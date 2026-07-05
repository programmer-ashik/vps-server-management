import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useDeletePartnerPaymentMutation,
  useGetPartnerPaymentsQuery,
  useUpdatePartnerPaymentStatusMutation,
} from "../../api/partnerPaymentApi";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../components/common/useToast";
import { getAssetUrl } from "../../utils/assets";

function formatUsd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function getGroupStatus(counts) {
  const activeStatuses = Object.entries(counts).filter(
    ([, count]) => count > 0,
  );
  if (activeStatuses.length === 1) return activeStatuses[0][0];
  return "mixed";
}

function buildGroups(items) {
  const groups = new Map();

  for (const item of items) {
    const key = String(item.bankAccountNumber || item.partnerEmail || item.id)
      .trim()
      .toLowerCase();
    const current = groups.get(key) ?? {
      key,
      bankAccountNumber: item.bankAccountNumber || "-",
      partnerName: item.partnerName,
      partnerEmail: item.partnerEmail,
      totalAmount: 0,
      latestSubmittedAt: item.submittedAt ?? item.createdAt,
      requests: [],
      statusCounts: {
        pending: 0,
        unpaid: 0,
        paid: 0,
        rejected: 0,
      },
    };

    current.partnerName = current.partnerName || item.partnerName;
    current.partnerEmail = current.partnerEmail || item.partnerEmail;
    current.totalAmount += Number(item.amount || 0);
    current.requests.push(item);
    current.statusCounts[item.status] =
      (current.statusCounts[item.status] ?? 0) + 1;

    const currentLatest = new Date(current.latestSubmittedAt || 0).getTime();
    const itemSubmitted = new Date(
      item.submittedAt ?? item.createdAt ?? 0,
    ).getTime();
    if (itemSubmitted >= currentLatest) {
      current.latestSubmittedAt = item.submittedAt ?? item.createdAt;
      current.partnerName = item.partnerName;
      current.partnerEmail = item.partnerEmail;
    }

    groups.set(key, current);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      requests: [...group.requests].sort(
        (a, b) =>
          new Date(b.submittedAt ?? b.createdAt) -
          new Date(a.submittedAt ?? a.createdAt),
      ),
      groupStatus: getGroupStatus(group.statusCounts),
    }))
    .sort(
      (a, b) =>
        new Date(b.latestSubmittedAt ?? 0) - new Date(a.latestSubmittedAt ?? 0),
    );
}

export default function PartnerPaymentsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? "",
  );
  const [selectedGroupKey, setSelectedGroupKey] = useState(
    searchParams.get("bankAccount") ?? "",
  );
  const [modalStatusFilter, setModalStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  const queryParams = useMemo(() => {
    const query = {};
    if (search.trim()) query.search = search.trim();
    return query;
  }, [search]);

  const {
    data = [],
    isLoading,
    isError,
  } = useGetPartnerPaymentsQuery(queryParams);
  const [deletePayment] = useDeletePartnerPaymentMutation();
  const [updateStatus] = useUpdatePartnerPaymentStatusMutation();

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (search.trim()) nextParams.set("search", search.trim());
    else nextParams.delete("search");
    if (statusFilter) nextParams.set("status", statusFilter);
    else nextParams.delete("status");
    if (selectedGroupKey) nextParams.set("bankAccount", selectedGroupKey);
    else nextParams.delete("bankAccount");

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [search, statusFilter, selectedGroupKey, searchParams, setSearchParams]);

  const groupedPayments = useMemo(() => buildGroups(data), [data]);

  const filteredGroups = useMemo(() => {
    if (!statusFilter) return groupedPayments;
    return groupedPayments.filter(
      (group) => group.statusCounts[statusFilter] > 0,
    );
  }, [groupedPayments, statusFilter]);

  const selectedGroup = useMemo(
    () =>
      filteredGroups.find((group) => group.key === selectedGroupKey) ??
      groupedPayments.find((group) => group.key === selectedGroupKey) ??
      null,
    [filteredGroups, groupedPayments, selectedGroupKey],
  );

  const modalRequests = useMemo(() => {
    if (!selectedGroup) return [];
    if (!modalStatusFilter) return selectedGroup.requests;
    return selectedGroup.requests.filter(
      (request) => request.status === modalStatusFilter,
    );
  }, [selectedGroup, modalStatusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePayment(deleteId).unwrap();
      showToast("Partner payment deleted");
      setDeleteId(null);
    } catch {
      showToast("Failed to delete partner payment", "error");
    }
  };

  const markStatus = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      const messages = {
        unpaid: "Partner payment approved and moved to unpaid",
        paid: "Partner payment marked as paid",
        rejected: "Partner payment rejected",
        pending: "Partner payment moved back to pending",
      };
      showToast(messages[status] ?? `Updated to ${status}`);
    } catch (error) {
      showToast(error?.data?.message ?? "Failed to update status", "error");
    }
  };

  if (isLoading) return <div className='p-4'>Loading...</div>;
  if (isError)
    return (
      <div className='p-4 text-red-500'>Failed to load partner payments.</div>
    );

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Partner Payments</h1>
        <p className='mt-1 text-sm text-neutral-600 dark:text-neutral-400'>
          Grouped by bank account so each partner keeps a single request history
          in one place.
        </p>
      </div>

      <div className='mb-4 flex flex-wrap gap-3'>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search partner or bank account...'
          className='min-w-[240px] rounded-md border bg-white px-3 py-2 text-sm dark:bg-neutral-900'
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className='rounded-md border bg-white px-3 py-2 text-sm dark:bg-neutral-900'
        >
          <option value=''>All grouped users</option>
          <option value='pending'>Has pending</option>
          <option value='unpaid'>Has unpaid</option>
          <option value='paid'>Has paid</option>
          <option value='rejected'>Has rejected</option>
        </select>
      </div>

      <div className='overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-neutral-800'>
        <table className='w-full text-sm'>
          <thead className='border-b bg-neutral-50 dark:bg-neutral-900'>
            <tr>
              <th className='p-4 text-left'>Partner</th>
              <th className='p-4 text-left'>Bank Account</th>
              <th className='p-4 text-left'>Requests</th>
              <th className='p-4 text-left'>Total Amount</th>
              <th className='p-4 text-left'>Status Mix</th>
              <th className='p-4 text-left'>Latest Submitted</th>
              <th className='p-4 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan='7' className='p-8 text-center text-neutral-500'>
                  No partner payment groups found
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => (
                <tr
                  key={group.key}
                  className='border-b hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                >
                  <td className='p-4'>
                    <div className='font-medium'>{group.partnerName}</div>
                    <div className='text-xs text-neutral-500'>
                      {group.partnerEmail}
                    </div>
                  </td>
                  <td className='p-4 font-medium'>
                    {group.bankAccountNumber || "-"}
                  </td>
                  <td className='p-4'>
                    <div className='font-medium'>{group.requests.length}</div>
                    <div className='text-xs text-neutral-500'>
                      P {group.statusCounts.pending} / U{" "}
                      {group.statusCounts.unpaid} / PD {group.statusCounts.paid}
                    </div>
                  </td>
                  <td className='p-4'>{formatUsd(group.totalAmount)}</td>
                  <td className='p-4'>
                    {group.groupStatus === "mixed" ? (
                      <span className='inline-block rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'>
                        Mixed
                      </span>
                    ) : (
                      <StatusBadge status={group.groupStatus} />
                    )}
                  </td>
                  <td className='p-4 text-xs text-neutral-600 dark:text-neutral-400'>
                    {formatDate(group.latestSubmittedAt)}
                  </td>
                  <td className='p-4 text-right'>
                    <button
                      onClick={() => {
                        setSelectedGroupKey(group.key);
                        setModalStatusFilter("");
                      }}
                      className='rounded-md border px-3 py-1.5 text-xs'
                    >
                      View Requests
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedGroup}
        onClose={() => {
          setSelectedGroupKey("");
          setModalStatusFilter("");
        }}
        title={
          selectedGroup
            ? `${selectedGroup.partnerName} Requests`
            : "Partner Requests"
        }
        size='xl'
      >
        {selectedGroup && (
          <div className='space-y-5'>
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='rounded-lg border p-4'>
                <div className='text-xs uppercase tracking-wide text-neutral-500'>
                  Bank Account
                </div>
                <div className='mt-2 font-medium'>
                  {selectedGroup.bankAccountNumber || "-"}
                </div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='text-xs uppercase tracking-wide text-neutral-500'>
                  Requests
                </div>
                <div className='mt-2 text-2xl font-semibold'>
                  {selectedGroup.requests.length}
                </div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='text-xs uppercase tracking-wide text-neutral-500'>
                  Total Amount
                </div>
                <div className='mt-2 text-2xl font-semibold'>
                  {formatUsd(selectedGroup.totalAmount)}
                </div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='text-xs uppercase tracking-wide text-neutral-500'>
                  Latest Submission
                </div>
                <div className='mt-2 text-sm font-medium'>
                  {formatDate(selectedGroup.latestSubmittedAt)}
                </div>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <select
                value={modalStatusFilter}
                onChange={(event) => setModalStatusFilter(event.target.value)}
                className='rounded-md border bg-white px-3 py-2 text-sm dark:bg-neutral-900'
              >
                <option value=''>All requests</option>
                <option value='pending'>Pending</option>
                <option value='unpaid'>Unpaid</option>
                <option value='paid'>Paid</option>
                <option value='rejected'>Rejected</option>
              </select>
              <div className='text-sm text-neutral-500'>
                Showing {modalRequests.length} of{" "}
                {selectedGroup.requests.length} requests
              </div>
            </div>

            <div className='overflow-x-auto rounded-lg border'>
              <table className='w-full text-sm'>
                <thead className='border-b bg-neutral-50 dark:bg-neutral-900'>
                  <tr>
                    <th className='p-3 text-left'>Submitted</th>
                    <th className='p-3 text-left'>Amount</th>
                    <th className='p-3 text-left'>Status</th>
                    <th className='p-3 text-left'>Notes</th>
                    <th className='p-3 text-left'>Proof</th>
                    <th className='p-3 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan='6'
                        className='p-6 text-center text-neutral-500'
                      >
                        No requests found for this filter
                      </td>
                    </tr>
                  ) : (
                    modalRequests.map((item) => (
                      <tr key={item.id} className='border-b'>
                        <td className='p-3 text-xs text-neutral-600 dark:text-neutral-400'>
                          {formatDate(item.submittedAt)}
                        </td>
                        <td className='p-3'>{formatUsd(item.amount)}</td>
                        <td className='p-3'>
                          <StatusBadge status={item.status} />
                        </td>
                        <td className='p-3 text-xs text-neutral-600 dark:text-neutral-400'>
                          {item.notes || "-"}
                        </td>
                        <td className='p-3'>
                          {item.screenshotUrl ? (
                            <a
                              href={getAssetUrl(item.screenshotUrl)}
                              target='_blank'
                              rel='noreferrer'
                              className='text-xs text-accent-600 hover:underline'
                            >
                              View proof
                            </a>
                          ) : (
                            <span className='text-xs text-neutral-400'>
                              No proof
                            </span>
                          )}
                        </td>
                        <td className='p-3'>
                          <div className='flex flex-wrap justify-end gap-2'>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => markStatus(item.id, "unpaid")}
                                  className='rounded-md border border-sky-300 px-2 py-1 text-xs text-sky-700'
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    markStatus(item.id, "rejected")
                                  }
                                  className='rounded-md border border-red-300 px-2 py-1 text-xs text-red-700'
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {item.status === "unpaid" && (
                              <button
                                onClick={() => markStatus(item.id, "paid")}
                                className='rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700'
                              >
                                Mark Paid
                              </button>
                            )}
                            {item.status === "rejected" && (
                              <button
                                onClick={() => markStatus(item.id, "pending")}
                                className='rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-700'
                              >
                                Reopen
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className='rounded-md border border-red-300 px-2 py-1 text-xs text-red-600'
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title='Delete Partner Payment'
        message='Are you sure you want to delete this payout request?'
      />
    </div>
  );
}

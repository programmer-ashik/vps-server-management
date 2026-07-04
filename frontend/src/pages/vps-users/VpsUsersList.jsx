import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  useDeleteVpsUserMutation,
  useGetVpsUsersQuery,
} from '../../api/vpsUserApi';
import {
  useCreateServerRequestMutation,
  useDeleteServerRequestMutation,
  useGetServerRequestQuery,
  useGetServerRequestsQuery,
  useUpdatePaymentStatusMutation,
} from '../../api/serverRequestApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/useToast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const PAYMENT_TYPES = [
  { value: 'Nagad', label: 'Nagad' },
  { value: 'bKash', label: 'bKash' },
];

const PLAN_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: '3_monthly', label: '3 Monthly' },
  { value: '6_monthly', label: '6 Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const REQUEST_STATUSES = [
  { value: '', label: 'All requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function createRequestForm() {
  return {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    transactionType: 'bKash',
    transactionId: '',
    amount: '',
    subscriptionPlan: 'monthly',
    description: '',
  };
}

function formatPlan(plan) {
  return PLAN_OPTIONS.find((item) => item.value === plan)?.label ?? plan;
}

export default function VpsUsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState(searchParams.get('requestSearch') ?? '');
  const [requestStatus, setRequestStatus] = useState(searchParams.get('requestStatus') ?? '');
  const [requestServerStatus, setRequestServerStatus] = useState(
    searchParams.get('requestServerStatus') ?? ''
  );
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState(createRequestForm());
  const [formError, setFormError] = useState('');

  const userParams = useMemo(() => {
    const q = {};
    if (search.trim()) q.search = search.trim();
    return q;
  }, [search]);

  const requestParams = useMemo(() => {
    const q = {};
    if (requestStatus) q.paymentStatus = requestStatus;
    if (requestServerStatus) q.serverStatus = requestServerStatus;
    if (requestSearch.trim()) q.search = requestSearch.trim();
    return q;
  }, [requestSearch, requestStatus, requestServerStatus]);
  const focusedRequestId = searchParams.get('requestId');

  const { data: users = [], isLoading, isError } = useGetVpsUsersQuery(userParams);
  const {
    data: requests = [],
    isLoading: requestsLoading,
    isError: requestsError,
  } = useGetServerRequestsQuery(requestParams);
  const {
    data: focusedRequest,
  } = useGetServerRequestQuery(focusedRequestId, { skip: !focusedRequestId });
  const [deleteUser] = useDeleteVpsUserMutation();
  const [deleteRequest] = useDeleteServerRequestMutation();
  const [updatePaymentStatus, { isLoading: updatingPayment }] = useUpdatePaymentStatusMutation();
  const [createServerRequest, { isLoading: creatingRequest }] = useCreateServerRequestMutation();
  const { showToast } = useToast();

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (requestStatus) nextParams.set('requestStatus', requestStatus);
    else nextParams.delete('requestStatus');
    if (requestServerStatus) nextParams.set('requestServerStatus', requestServerStatus);
    else nextParams.delete('requestServerStatus');
    if (requestSearch.trim()) nextParams.set('requestSearch', requestSearch.trim());
    else nextParams.delete('requestSearch');
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [requestSearch, requestServerStatus, requestStatus, searchParams, setSearchParams]);

  useEffect(() => {
    if (!focusedRequestId || !focusedRequest) return;
    setViewRequest(focusedRequest);
  }, [focusedRequest, focusedRequestId]);

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser(deleteUserId).unwrap();
      showToast('VPS user deleted');
      setDeleteUserId(null);
    } catch {
      showToast('Failed to delete VPS user', 'error');
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteRequestId) return;
    try {
      await deleteRequest(deleteRequestId).unwrap();
      showToast('Request deleted');
      setDeleteRequestId(null);
    } catch {
      showToast('Failed to delete request', 'error');
    }
  };

  const updateRequestPayment = async (id, paymentStatus) => {
    try {
      const result = await updatePaymentStatus({ id, paymentStatus }).unwrap();
      if (paymentStatus === 'paid' && result?.linkedVpsUserId) {
        showToast('Payment approved. Customer is available in VPS Users.');
      } else {
        showToast(`Request marked as ${paymentStatus}`);
      }
    } catch {
      showToast('Failed to update request', 'error');
    }
  };

  const clearFocusedRequest = () => {
    setViewRequest(null);
    if (!focusedRequestId) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('requestId');
    setSearchParams(nextParams, { replace: true });
  };

  const handleRequestFormChange = (field, value) => {
    setRequestForm((current) => ({ ...current, [field]: value }));
    setFormError('');
  };

  const handleCreateRequest = async (event) => {
    event.preventDefault();
    const amount = Number(requestForm.amount);
    if (!requestForm.customerName.trim() || !requestForm.customerEmail.trim()) {
      setFormError('Customer name and email are required.');
      return;
    }
    if (!requestForm.transactionId.trim() || !Number.isFinite(amount) || amount <= 0) {
      setFormError('Transaction ID and a valid amount are required.');
      return;
    }

    try {
      await createServerRequest({
        customerName: requestForm.customerName.trim(),
        customerEmail: requestForm.customerEmail.trim().toLowerCase(),
        customerPhone: requestForm.customerPhone.trim() || undefined,
        transactionType: requestForm.transactionType,
        transactionId: requestForm.transactionId.trim(),
        amount,
        subscriptionPlan: requestForm.subscriptionPlan,
        description: requestForm.description.trim() || undefined,
      }).unwrap();
      showToast('Payment request created');
      setRequestForm(createRequestForm());
      setShowRequestModal(false);
    } catch {
      setFormError('Failed to create payment request.');
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load VPS users.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">VPS Users</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Review payment requests, approve customers, and manage VPS subscriptions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowRequestModal(true)}>Add Payment Request</Button>
          <Link
            to="/vps-users/new"
            className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-600"
          >
            Direct Add User
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Payment Requests</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Review payment details before approving, rejecting, or deleting a request.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              value={requestSearch}
              onChange={(e) => setRequestSearch(e.target.value)}
              placeholder="Search customer or transaction"
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900 min-w-[240px]"
            />
            <select
              value={requestStatus}
              onChange={(e) => setRequestStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            >
              {REQUEST_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
              <tr>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Payment</th>
                <th className="text-left p-4">Tier</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requestsLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-neutral-500">Loading requests...</td>
                </tr>
              ) : requestsError ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-red-500">Failed to load requests.</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-neutral-500">No payment requests found</td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="p-4">
                      <div className="font-medium">{item.customerName}</div>
                      <div className="text-neutral-500 text-xs">{item.customerEmail}</div>
                      {item.customerPhone && (
                        <div className="text-neutral-500 text-xs">{item.customerPhone}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div>{item.transactionType} - BDT {item.amount}</div>
                      <div className="text-xs font-mono text-neutral-500">{item.transactionId}</div>
                    </td>
                    <td className="p-4">{formatPlan(item.subscriptionPlan)}</td>
                    <td className="p-4"><StatusBadge status={item.paymentStatus} /></td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => setViewRequest(item)}
                          className="px-2 py-1 text-xs border rounded-md hover:bg-neutral-100"
                        >
                          View
                        </button>
                        {item.paymentStatus === 'pending' && (
                          <>
                            <button
                              disabled={updatingPayment}
                              onClick={() => updateRequestPayment(item.id, 'paid')}
                              className="px-2 py-1 text-xs border rounded-md hover:bg-emerald-50 text-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={updatingPayment}
                              onClick={() => updateRequestPayment(item.id, 'rejected')}
                              className="px-2 py-1 text-xs border rounded-md hover:bg-red-50 text-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteRequestId(item.id)}
                          className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md"
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
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Customers</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Customer-level list with onboarding, active, expiring, and cancelled subscriptions.
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, email..."
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900 min-w-[240px]"
          />
        </div>

        <div className="overflow-x-auto border rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
              <tr>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Subscriptions</th>
                <th className="text-left p-4">Active</th>
                <th className="text-left p-4">Expiring Soon</th>
                <th className="text-left p-4">Latest Expiry</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-500">No VPS users found</td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="p-4">
                      <div className="font-medium">{item.customerName}</div>
                      <div className="text-neutral-500 text-xs">{item.customerEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-md bg-neutral-100 dark:bg-neutral-700">
                        {item.source === 'server_request' ? 'Paid request' : 'Manual'}
                      </span>
                    </td>
                    <td className="p-4">{item.totalSubscriptions}</td>
                    <td className="p-4">{item.activeSubscriptions}</td>
                    <td className="p-4">{item.expiringSoonCount}</td>
                    <td className="p-4">
                      {item.latestSubscriptionEndDate
                        ? new Date(item.latestSubscriptionEndDate).toLocaleDateString()
                        : <span className="text-neutral-400">No subscriptions yet</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Link to={`/vps-users/${item.id}`} className="px-2 py-1 text-xs border rounded-md hover:bg-neutral-100">
                          View
                        </Link>
                        <button
                          onClick={() => setDeleteUserId(item.id)}
                          className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md"
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
      </section>

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Add Payment Request"
        size="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              required
              value={requestForm.customerName}
              onChange={(e) => handleRequestFormChange('customerName', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              required
              value={requestForm.customerEmail}
              onChange={(e) => handleRequestFormChange('customerEmail', e.target.value)}
            />
            <Input
              label="Phone"
              value={requestForm.customerPhone}
              onChange={(e) => handleRequestFormChange('customerPhone', e.target.value)}
            />
            <Select
              label="Payment Type"
              value={requestForm.transactionType}
              onChange={(e) => handleRequestFormChange('transactionType', e.target.value)}
            >
              {PAYMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
            <Input
              label="Transaction ID"
              required
              value={requestForm.transactionId}
              onChange={(e) => handleRequestFormChange('transactionId', e.target.value)}
            />
            <Input
              label="Amount"
              type="number"
              min="1"
              required
              value={requestForm.amount}
              onChange={(e) => handleRequestFormChange('amount', e.target.value)}
            />
            <Select
              label="Tier"
              value={requestForm.subscriptionPlan}
              onChange={(e) => handleRequestFormChange('subscriptionPlan', e.target.value)}
            >
              {PLAN_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              rows={3}
              value={requestForm.description}
              onChange={(e) => handleRequestFormChange('description', e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowRequestModal(false)}>
              Close
            </Button>
            <Button type="submit" disabled={creatingRequest}>
              {creatingRequest ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewRequest}
        onClose={clearFocusedRequest}
        title="Payment Request Details"
        size="lg"
      >
        {viewRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-lg border p-4 bg-white dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Customer</p>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="text-neutral-500">Name:</span> {viewRequest.customerName}</p>
                  <p><span className="text-neutral-500">Email:</span> {viewRequest.customerEmail}</p>
                  <p><span className="text-neutral-500">Phone:</span> {viewRequest.customerPhone || '-'}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-white dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Payment</p>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="text-neutral-500">Type:</span> {viewRequest.transactionType}</p>
                  <p><span className="text-neutral-500">Transaction ID:</span> {viewRequest.transactionId}</p>
                  <p><span className="text-neutral-500">Amount:</span> BDT {viewRequest.amount}</p>
                  <p><span className="text-neutral-500">Tier:</span> {formatPlan(viewRequest.subscriptionPlan)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 text-sm">Status:</span>
                    <StatusBadge status={viewRequest.paymentStatus} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-white dark:bg-neutral-900">
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Notes</p>
              <p className="mt-3 text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {viewRequest.description || 'No notes provided.'}
              </p>
            </div>

            {viewRequest.linkedVpsUserId && (
              <div className="rounded-lg border p-4 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Customer Record</p>
                  <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                    This request is already linked to a VPS user.
                  </p>
                </div>
                <Link
                  to={`/vps-users/${viewRequest.linkedVpsUserId}`}
                  className="px-3 py-2 text-sm border rounded-md hover:bg-neutral-100"
                  onClick={clearFocusedRequest}
                >
                  Open Customer
                </Link>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={clearFocusedRequest}>
                Close
              </Button>
              {viewRequest.paymentStatus === 'pending' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await updateRequestPayment(viewRequest.id, 'rejected');
                      clearFocusedRequest();
                    }}
                    disabled={updatingPayment}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={async () => {
                      await updateRequestPayment(viewRequest.id, 'paid');
                      clearFocusedRequest();
                    }}
                    disabled={updatingPayment}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Delete VPS User"
        message="Are you sure you want to delete this customer and all related subscriptions?"
      />

      <ConfirmDialog
        isOpen={!!deleteRequestId}
        onClose={() => setDeleteRequestId(null)}
        onConfirm={handleDeleteRequest}
        title="Delete Payment Request"
        message="Are you sure you want to delete this payment request?"
      />
    </div>
  );
}

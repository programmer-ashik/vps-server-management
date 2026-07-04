import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useDeletePartnerPaymentMutation,
  useGetPartnerPaymentQuery,
  useUpdatePartnerPaymentStatusMutation,
} from '../../api/partnerPaymentApi';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';
import { getAssetUrl } from '../../utils/assets';

function formatUsd(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function PartnerPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useGetPartnerPaymentQuery(id ?? '');
  const [updateStatus] = useUpdatePartnerPaymentStatusMutation();
  const [deletePayment] = useDeletePartnerPaymentMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showToast } = useToast();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !item) {
    return (
      <div className="rounded-lg border border-red-200 p-6 text-red-700">
        Partner payment not found.
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/partner-payments')}>
          Back
        </Button>
      </div>
    );
  }

  const markStatus = async (status) => {
    try {
      await updateStatus({ id: item.id, status }).unwrap();
      const messages = {
        unpaid: 'Partner payment approved and moved to unpaid',
        paid: 'Partner payment marked as paid',
        rejected: 'Partner payment rejected',
        pending: 'Partner payment moved back to pending',
      };
      showToast(messages[status] ?? `Marked as ${status}`);
    } catch (error) {
      showToast(error?.data?.message ?? 'Failed to update status', 'error');
    }
  };

  const onDelete = async () => {
    try {
      await deletePayment(item.id).unwrap();
      showToast('Deleted');
      navigate('/partner-payments');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{item.partnerName}</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Partner payout request details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/partner-payments')}>
            Back
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-6 rounded-lg border bg-white p-6 dark:bg-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={item.status} />
          <StatusBadge status={item.settlementStatus} />
          <span className="text-sm text-neutral-500">Submitted {formatDate(item.submittedAt)}</span>
        </div>

        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Email</dt>
            <dd>{item.partnerEmail}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Amount</dt>
            <dd>{formatUsd(item.amount)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Bank Account Number</dt>
            <dd>{item.bankAccountNumber || '-'}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Approved At</dt>
            <dd>{formatDate(item.approvedAt)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Paid At</dt>
            <dd>{formatDate(item.paidAt)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Rejected At</dt>
            <dd>{formatDate(item.rejectedAt)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-500">Notes</dt>
            <dd>{item.notes || '-'}</dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 text-sm text-neutral-500">Payment Screenshot</p>
          {item.screenshotUrl ? (
            <a href={getAssetUrl(item.screenshotUrl)} target="_blank" rel="noreferrer">
              <img
                src={getAssetUrl(item.screenshotUrl)}
                alt="Partner payment screenshot"
                className="max-h-[28rem] rounded-xl border object-contain"
              />
            </a>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-sm text-neutral-500">
              No screenshot was attached to this request.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {item.status === 'pending' && (
            <>
              <Button onClick={() => markStatus('unpaid')}>Approve</Button>
              <Button variant="secondary" onClick={() => markStatus('rejected')}>
                Reject
              </Button>
            </>
          )}
          {item.status === 'unpaid' && (
            <Button onClick={() => markStatus('paid')}>Mark Paid</Button>
          )}
          {item.status === 'rejected' && (
            <Button variant="secondary" onClick={() => markStatus('pending')}>
              Move To Pending
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete Partner Payment"
        message="Are you sure you want to delete this payout request?"
      />
    </div>
  );
}

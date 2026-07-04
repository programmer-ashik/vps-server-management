import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useDeleteServerRequestMutation,
  useGetServerRequestQuery,
  useSendServerDetailsMutation,
  useUpdatePaymentStatusMutation,
  useUpdateServerStatusMutation,
} from '../../api/serverRequestApi';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';

const deliverySchema = z.object({
  serverIp: z.string().trim().min(1, 'Server IP is required'),
  serverUsername: z.string().trim().min(1, 'Username is required'),
  serverPassword: z.string().trim().min(1, 'Password is required'),
  serverPanelUrl: z.string().trim().optional(),
  additionalNotes: z.string().trim().optional(),
});

export default function ServerRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useGetServerRequestQuery(id ?? '');
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();
  const [updateServerStatus] = useUpdateServerStatusMutation();
  const [sendServerDetails, { isLoading: sending }] = useSendServerDetailsMutation();
  const [deleteRequest] = useDeleteServerRequestMutation();
  const [showDelivery, setShowDelivery] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      serverIp: '',
      serverUsername: '',
      serverPassword: '',
      serverPanelUrl: '',
      additionalNotes: '',
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !item) {
    return (
      <div className="p-6 border border-red-200 rounded-lg text-red-700">
        Server request not found.
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/server-requests')}>
          Back
        </Button>
      </div>
    );
  }

  const updatePayment = async (paymentStatus) => {
    try {
      const result = await updatePaymentStatus({ id: item.id, paymentStatus }).unwrap();
      if (paymentStatus === 'paid' && result?.linkedVpsUserId) {
        showToast('Payment marked as paid. Customer is now available in VPS Users.');
      } else {
        showToast(`Payment marked as ${paymentStatus}`);
      }
    } catch {
      showToast('Failed to update payment', 'error');
    }
  };

  const updateServer = async (serverStatus) => {
    try {
      await updateServerStatus({ id: item.id, serverStatus }).unwrap();
      showToast(`Server status updated to ${serverStatus.replace(/_/g, ' ')}`);
    } catch {
      showToast('Failed to update server status', 'error');
    }
  };

  const onSendDelivery = handleSubmit(async (values) => {
    try {
      await sendServerDetails({ id: item.id, ...values }).unwrap();
      showToast('Server details emailed to customer');
      setShowDelivery(false);
    } catch {
      showToast('Failed to send email. Check Brevo API configuration.', 'error');
    }
  });

  const onDelete = async () => {
    try {
      await deleteRequest(item.id).unwrap();
      showToast('Deleted');
      navigate('/server-requests');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{item.serverName}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Request details</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => navigate('/server-requests')}>Back</Button>
          <Button onClick={() => setShowDelivery(true)}>Send Server Details</Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(true)}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-5 bg-white dark:bg-neutral-800">
          <h2 className="font-semibold mb-3">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-neutral-500">Name</dt><dd>{item.customerName}</dd></div>
            <div><dt className="text-neutral-500">Email</dt><dd>{item.customerEmail}</dd></div>
            <div><dt className="text-neutral-500">Phone</dt><dd>{item.customerPhone || '-'}</dd></div>
            {item.linkedVpsUserId && (
              <div>
                <dt className="text-neutral-500">VPS User</dt>
                <dd>
                  <Link to={`/vps-users/${item.linkedVpsUserId}`} className="text-accent-600 hover:underline">
                    Open customer record
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="border rounded-lg p-5 bg-white dark:bg-neutral-800">
          <h2 className="font-semibold mb-3">Payment</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-neutral-500">Type</dt><dd>{item.transactionType}</dd></div>
            <div><dt className="text-neutral-500">Transaction ID</dt><dd>{item.transactionId}</dd></div>
            <div><dt className="text-neutral-500">Amount</dt><dd>{item.amount}</dd></div>
            <div className="flex items-center gap-2">
              <dt className="text-neutral-500">Status</dt>
              <dd><StatusBadge status={item.paymentStatus} /></dd>
            </div>
          </dl>
          {item.paymentStatus === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button onClick={() => updatePayment('paid')}>Mark Paid</Button>
              <Button variant="secondary" onClick={() => updatePayment('rejected')}>Reject</Button>
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-5 bg-white dark:bg-neutral-800 mb-6">
        <h2 className="font-semibold mb-3">Server</h2>
        <p className="text-sm mb-2"><span className="text-neutral-500">Details:</span> {item.serverDetails}</p>
        {item.description && (
          <p className="text-sm mb-4"><span className="text-neutral-500">Description:</span> {item.description}</p>
        )}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-neutral-500">Delivery status:</span>
          <StatusBadge status={item.serverStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => updateServer('processing')}>Processing</Button>
          <Button variant="secondary" onClick={() => updateServer('ready_to_share')}>Ready to Share</Button>
          <Button variant="secondary" onClick={() => updateServer('shared')}>Shared</Button>
        </div>
        {item.emailSentAt && (
          <p className="text-xs text-neutral-500 mt-4">
            Email sent at: {new Date(item.emailSentAt).toLocaleString()}
          </p>
        )}
        {item.serverDeliveryDetails && (
          <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md text-sm">
            <p className="font-medium mb-2">Last delivery details</p>
            <p>IP: {item.serverDeliveryDetails.serverIp}</p>
            <p>User: {item.serverDeliveryDetails.serverUsername}</p>
            {item.serverDeliveryDetails.serverPanelUrl && (
              <p>Panel: {item.serverDeliveryDetails.serverPanelUrl}</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showDelivery} onClose={() => setShowDelivery(false)} title="Send Server Details" size="lg">
        <form onSubmit={onSendDelivery} className="space-y-4">
          <Input label="Server IP" required {...register('serverIp')} />
          {errors.serverIp && <p className="text-xs text-red-500">{errors.serverIp.message}</p>}
          <Input label="Username" required {...register('serverUsername')} />
          {errors.serverUsername && <p className="text-xs text-red-500">{errors.serverUsername.message}</p>}
          <Input label="Password" type="text" required {...register('serverPassword')} />
          {errors.serverPassword && <p className="text-xs text-red-500">{errors.serverPassword.message}</p>}
          <Input label="Panel URL" {...register('serverPanelUrl')} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Additional Notes</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 bg-white dark:bg-neutral-900"
              rows={3}
              {...register('additionalNotes')}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Email'}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowDelivery(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete Server Request"
        message="Are you sure you want to delete this request?"
      />
    </div>
  );
}

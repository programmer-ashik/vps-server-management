import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  useGetServerRequestsQuery,
  useDeleteServerRequestMutation,
  useUpdatePaymentStatusMutation,
} from '../../api/serverRequestApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/useToast';

export default function ServerRequestsList() {
  const [paymentFilter, setPaymentFilter] = useState('');
  const [serverFilter, setServerFilter] = useState('');
  const [search, setSearch] = useState('');
  const params = useMemo(() => {
    const q = {};
    if (paymentFilter) q.paymentStatus = paymentFilter;
    if (serverFilter) q.serverStatus = serverFilter;
    if (search.trim()) q.search = search.trim();
    return q;
  }, [paymentFilter, serverFilter, search]);

  const { data = [], isLoading, isError } = useGetServerRequestsQuery(params);
  const [deleteRequest] = useDeleteServerRequestMutation();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRequest(deleteId).unwrap();
      showToast('Server request deleted');
      setDeleteId(null);
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const markPayment = async (id, paymentStatus) => {
    try {
      const result = await updatePaymentStatus({ id, paymentStatus }).unwrap();
      if (paymentStatus === 'paid' && result?.linkedVpsUserId) {
        showToast('Payment marked as paid. Customer is now available in VPS Users.');
      } else {
        showToast(`Payment marked as ${paymentStatus}`);
      }
    } catch {
      showToast('Failed to update payment status', 'error');
    }
  };

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load server requests.</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Server Requests</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Manage server purchase requests from external websites
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, server, transaction…"
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900 min-w-[220px]"
        />
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
        >
          <option value="">All payment statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={serverFilter}
          onChange={(e) => setServerFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
        >
          <option value="">All server statuses</option>
          <option value="processing">Processing</option>
          <option value="ready_to_share">Ready to share</option>
          <option value="shared">Shared</option>
        </select>
      </div>

      <div className="overflow-x-auto border rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
            <tr>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Server</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Payment</th>
              <th className="text-left p-4">Server Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-neutral-500">No server requests found</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="p-4">
                    <div className="font-medium">{item.customerName}</div>
                    <div className="text-neutral-500 text-xs">{item.customerEmail}</div>
                    {item.linkedVpsUserId && (
                      <Link to={`/vps-users/${item.linkedVpsUserId}`} className="text-xs text-accent-600 hover:underline">
                        Open in VPS Users
                      </Link>
                    )}
                  </td>
                  <td className="p-4">{item.serverName}</td>
                  <td className="p-4">৳{item.amount}</td>
                  <td className="p-4"><StatusBadge status={item.paymentStatus} /></td>
                  <td className="p-4"><StatusBadge status={item.serverStatus} /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 flex-wrap">
                      {item.paymentStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => markPayment(item.id, 'paid')}
                            className="px-2 py-1 text-xs border rounded-md hover:bg-emerald-50 text-emerald-700"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => markPayment(item.id, 'rejected')}
                            className="px-2 py-1 text-xs border rounded-md hover:bg-red-50 text-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <Link to={`/server-requests/${item.id}`} className="px-2 py-1 text-xs border rounded-md hover:bg-neutral-100">
                        View
                      </Link>
                      <button
                        onClick={() => setDeleteId(item.id)}
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

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Server Request"
        message="Are you sure you want to delete this server request?"
      />
    </div>
  );
}

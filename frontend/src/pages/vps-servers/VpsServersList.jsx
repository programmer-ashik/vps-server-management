import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  useDeleteVpsServerMutation,
  useGetVpsServersQuery,
  usePingVpsServerMutation,
} from '../../api/vpsServerApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/useToast';

export default function VpsServersList() {
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [pingFilter, setPingFilter] = useState('');
  const [search, setSearch] = useState('');
  const params = useMemo(() => {
    const q = {};
    if (availabilityFilter) q.availabilityStatus = availabilityFilter;
    if (pingFilter) q.pingStatus = pingFilter;
    if (search.trim()) q.search = search.trim();
    return q;
  }, [availabilityFilter, pingFilter, search]);

  const { data = [], isLoading, isError } = useGetVpsServersQuery(params);
  const [deleteServer] = useDeleteVpsServerMutation();
  const [pingServer] = usePingVpsServerMutation();
  const [deleteId, setDeleteId] = useState(null);
  const [pingingId, setPingingId] = useState(null);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteServer(deleteId).unwrap();
      showToast('VPS server deleted');
      setDeleteId(null);
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handlePing = async (id) => {
    setPingingId(id);
    try {
      const result = await pingServer(id).unwrap();
      showToast(`Ping result: ${result.pingStatus}`);
    } catch {
      showToast('Ping failed', 'error');
    } finally {
      setPingingId(null);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load VPS servers.</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">VPS Servers</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Inventory with assignment, expiry, and current subscription price
          </p>
        </div>
        <Link
          to="/vps-servers/new"
          className="px-4 py-2 text-sm font-medium rounded-md bg-accent-500 text-white hover:bg-accent-600"
        >
          Add VPS Server
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, IP, details..."
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900 min-w-[220px]"
        />
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
        >
          <option value="">All availability</option>
          <option value="available">Available</option>
          <option value="shared">Shared</option>
        </select>
        <select
          value={pingFilter}
          onChange={(e) => setPingFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
        >
          <option value="">All ping status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div className="overflow-x-auto border rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">IP</th>
              <th className="text-left p-4">Availability</th>
              <th className="text-left p-4">Assigned User</th>
              <th className="text-left p-4">Expiry</th>
              <th className="text-left p-4">Price</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-neutral-500">No VPS servers found</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-neutral-500 text-xs truncate max-w-[220px]">{item.serverDetails}</div>
                  </td>
                  <td className="p-4 font-mono text-xs">{item.ip}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={item.availabilityStatus} />
                      <StatusBadge status={item.pingStatus} />
                    </div>
                  </td>
                  <td className="p-4">
                    {item.assignedUser ? (
                      <div>
                        <div className="font-medium">{item.assignedUser.customerName}</div>
                        <div className="text-xs text-neutral-500">{item.assignedUser.customerEmail}</div>
                      </div>
                    ) : (
                      <span className="text-neutral-400">Not assigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    {item.assignedSubscription?.subscriptionEndDate
                      ? new Date(item.assignedSubscription.subscriptionEndDate).toLocaleDateString()
                      : <span className="text-neutral-400">-</span>}
                  </td>
                  <td className="p-4">
                    {item.assignedSubscription?.subscriptionPrice ?? <span className="text-neutral-400">-</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => handlePing(item.id)}
                        disabled={pingingId === item.id}
                        className="px-2 py-1 text-xs border rounded-md hover:bg-blue-50 text-blue-700 disabled:opacity-50"
                      >
                        {pingingId === item.id ? 'Pinging...' : 'Ping'}
                      </button>
                      <Link to={`/vps-servers/${item.id}`} className="px-2 py-1 text-xs border rounded-md hover:bg-neutral-100">
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
        title="Delete VPS Server"
        message="Are you sure you want to delete this VPS server?"
      />
    </div>
  );
}

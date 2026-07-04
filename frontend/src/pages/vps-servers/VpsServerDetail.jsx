import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  useDeleteVpsServerMutation,
  useGetVpsServerQuery,
  usePingVpsServerMutation,
  useUpdateVpsServerMutation,
} from '../../api/vpsServerApi';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';

export default function VpsServerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: server, isLoading, isError } = useGetVpsServerQuery(id);
  const [updateServer, { isLoading: saving }] = useUpdateVpsServerMutation();
  const [pingServer, { isLoading: pinging }] = usePingVpsServerMutation();
  const [deleteServer] = useDeleteVpsServerMutation();
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const { showToast } = useToast();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !server) return <div className="p-4 text-red-500">VPS server not found.</div>;

  const startEdit = () => {
    setForm({
      name: server.name,
      serverDetails: server.serverDetails,
      ip: server.ip,
      username: server.credentials?.username ?? '',
      password: server.credentials?.password ?? '',
      panelUrl: server.credentials?.panelUrl ?? '',
      additionalNotes: server.credentials?.additionalNotes ?? '',
      isActive: server.isActive,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateServer({
        id,
        name: form.name,
        serverDetails: form.serverDetails,
        ip: form.ip,
        isActive: form.isActive,
        credentials: {
          username: form.username || undefined,
          password: form.password || undefined,
          panelUrl: form.panelUrl || undefined,
          additionalNotes: form.additionalNotes || undefined,
        },
      }).unwrap();
      showToast('VPS server updated');
      setEditing(false);
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const handlePing = async () => {
    try {
      const result = await pingServer(id).unwrap();
      showToast(`Ping result: ${result.pingStatus}`);
    } catch {
      showToast('Ping failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteServer(id).unwrap();
      showToast('VPS server deleted');
      navigate('/vps-servers');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Link to="/vps-servers" className="text-sm text-accent-600 hover:underline">← Back to VPS Servers</Link>
          <h1 className="text-3xl font-bold mt-2">{server.name}</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={handlePing} disabled={pinging}>
            {pinging ? 'Pinging...' : 'Ping Now'}
          </Button>
          {!editing && (
            <Button variant="secondary" onClick={startEdit}>Edit</Button>
          )}
          <Button variant="secondary" onClick={() => setShowDelete(true)}>Delete</Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white dark:bg-neutral-800 shadow-sm divide-y">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Availability</p>
            <div className="mt-1"><StatusBadge status={server.availabilityStatus} /></div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Ping Status</p>
            <div className="mt-1"><StatusBadge status={server.pingStatus} /></div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Current Expiry</p>
            <p className="mt-1 text-sm">
              {server.assignedSubscription?.subscriptionEndDate
                ? new Date(server.assignedSubscription.subscriptionEndDate).toLocaleDateString()
                : 'Not assigned'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Current Price</p>
            <p className="mt-1 text-sm">
              {server.assignedSubscription?.subscriptionPrice ?? 'Not assigned'}
            </p>
          </div>
        </div>

        {editing ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Server Details</label>
              <textarea
                value={form.serverDetails}
                onChange={(e) => setForm({ ...form, serverDetails: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IP Address</label>
              <input
                value={form.ip}
                onChange={(e) => setForm({ ...form, ip: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900 font-mono"
              />
            </div>
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold">Credentials</h3>
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              />
              <input
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              />
              <input
                placeholder="Panel URL"
                value={form.panelUrl}
                onChange={(e) => setForm({ ...form, panelUrl: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              />
              <textarea
                placeholder="Additional notes"
                value={form.additionalNotes}
                onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                rows={2}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded"
              />
              Enable automatic ping monitoring
            </label>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Details</p>
              <p className="text-sm whitespace-pre-wrap">{server.serverDetails}</p>
            </div>
            <div className="p-6">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Assigned User</p>
              {server.assignedUser ? (
                <div>
                  <p className="font-medium">{server.assignedUser.customerName}</p>
                  <p className="text-sm text-neutral-500">{server.assignedUser.customerEmail}</p>
                  <Link to={`/vps-users/${server.assignedUser.id}`} className="text-sm text-accent-600 hover:underline">
                    Open VPS user
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Not assigned</p>
              )}
            </div>
            <div className="p-6">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">IP Address</p>
              <p className="font-mono text-sm">{server.ip}</p>
            </div>
            <div className="p-6">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">Access Credentials</p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-neutral-500">Username</dt>
                  <dd className="font-mono">{server.credentials?.username || '-'}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Password</dt>
                  <dd className="font-mono">{server.credentials?.password || '-'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-neutral-500">Panel URL</dt>
                  <dd>
                    {server.credentials?.panelUrl ? (
                      <a href={server.credentials.panelUrl} target="_blank" rel="noreferrer" className="text-accent-600 hover:underline">
                        {server.credentials.panelUrl}
                      </a>
                    ) : '-'}
                  </dd>
                </div>
                {server.credentials?.additionalNotes && (
                  <div className="sm:col-span-2">
                    <dt className="text-neutral-500">Notes</dt>
                    <dd className="whitespace-pre-wrap">{server.credentials.additionalNotes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete VPS Server"
        message="Are you sure you want to delete this VPS server?"
      />
    </div>
  );
}

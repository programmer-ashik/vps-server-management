import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  useDeleteVpsUserMutation,
  useGetVpsUserQuery,
  useUpdateVpsUserMutation,
  useAddVpsSubscriptionsMutation,
} from '../../api/vpsUserApi';
import { useCancelVpsSubscriptionMutation, useRenewVpsSubscriptionMutation } from '../../api/vpsSubscriptionApi';
import { useGetVpsServersQuery } from '../../api/vpsServerApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/common/useToast';
import StatusBadge from '../../components/common/StatusBadge';

const PLAN_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: '3_monthly', label: '3 Monthly' },
  { value: '6_monthly', label: '6 Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

function createSubscriptionRow() {
  return {
    vpsServerId: '',
    vpsServerLabel: '',
    subscriptionPlan: 'monthly',
    subscriptionPrice: '',
    subscriptionStartDate: '',
  };
}

function getPlanMonths(plan) {
  return {
    monthly: 1,
    '3_monthly': 3,
    '6_monthly': 6,
    yearly: 12,
  }[plan] ?? 1;
}

function getProjectedRenewalDate(subscriptionEndDate, plan) {
  if (!subscriptionEndDate) {
    const next = new Date();
    next.setMonth(next.getMonth() + getPlanMonths(plan));
    return next;
  }
  const currentEndDate = new Date(subscriptionEndDate);
  const now = new Date();
  const base = currentEndDate > now ? currentEndDate : now;
  const next = new Date(base);
  next.setMonth(next.getMonth() + getPlanMonths(plan));
  return next;
}

export default function VpsUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useGetVpsUserQuery(id);
  const { data: availableServers = [] } = useGetVpsServersQuery({ availabilityStatus: 'available' });
  const [updateUser, { isLoading: saving }] = useUpdateVpsUserMutation();
  const [addSubscriptions, { isLoading: addingSubscriptions }] = useAddVpsSubscriptionsMutation();
  const [renewSubscription, { isLoading: renewing }] = useRenewVpsSubscriptionMutation();
  const [cancelSubscription, { isLoading: cancelling }] = useCancelVpsSubscriptionMutation();
  const [deleteUser] = useDeleteVpsUserMutation();
  const [showDelete, setShowDelete] = useState(false);
  const [showAddVps, setShowAddVps] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [subscriptionRows, setSubscriptionRows] = useState([createSubscriptionRow()]);
  const [serverSearch, setServerSearch] = useState('');
  const [highlightedServerId, setHighlightedServerId] = useState('');
  const [renewForm, setRenewForm] = useState({ subscriptionPlan: 'monthly', subscriptionPrice: '' });
  const { showToast } = useToast();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !user) return <div className="p-4 text-red-500">VPS user not found.</div>;
  const projectedRenewalDate = renewTarget
    ? getProjectedRenewalDate(renewTarget.subscriptionEndDate, renewForm.subscriptionPlan)
    : null;
  const selectedServerIds = subscriptionRows
    .map((item) => item.vpsServerId)
    .filter(Boolean);
  const filteredAvailableServers = availableServers.filter((server) => {
    const keyword = serverSearch.trim().toLowerCase();
    if (selectedServerIds.includes(server.id)) return false;
    if (!keyword) return true;
    return [server.name, server.ip, server.serverDetails]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  });

  const startEdit = () => {
    setForm({
      customerName: user.customerName,
      customerEmail: user.customerEmail,
      customerPhone: user.customerPhone ?? '',
      notes: user.notes ?? '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateUser({
        id,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || undefined,
        notes: form.notes || undefined,
      }).unwrap();
      showToast('VPS user updated');
      setEditing(false);
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id).unwrap();
      showToast('VPS user deleted');
      navigate('/vps-users');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleRemoveRow = (index) =>
    setSubscriptionRows((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const handleRowChange = (index, field, value) =>
    setSubscriptionRows((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  const handleSelectServer = (server) => {
    setSubscriptionRows((current) => [
      ...current,
      {
        ...createSubscriptionRow(),
        vpsServerId: server.id,
        vpsServerLabel: `${server.name} - ${server.ip}`,
      },
    ]);
    setServerSearch('');
    setHighlightedServerId('');
  };

  const handleCreateSubscriptions = async () => {
    if (subscriptionRows.length === 0) {
      showToast('Select at least one VPS before saving', 'error');
      return;
    }

    const invalidRow = subscriptionRows.find(
      (item) =>
        !item.vpsServerId ||
        !item.subscriptionPrice ||
        Number(item.subscriptionPrice) < 0
    );
    if (invalidRow) {
      showToast('Select a VPS and fill price for every row', 'error');
      return;
    }

    try {
      const payload = subscriptionRows.map((item) => ({
        vpsServerId: item.vpsServerId,
        subscriptionPlan: item.subscriptionPlan,
        subscriptionPrice: Number(item.subscriptionPrice),
        subscriptionStartDate: item.subscriptionStartDate || undefined,
      }));
      const result = await addSubscriptions({ id, subscriptions: payload }).unwrap();
      showToast(result.emailSent ? 'VPS assigned and email sent' : `VPS assigned. Email not sent: ${result.emailError || 'unknown error'}`);
      setSubscriptionRows([]);
      setServerSearch('');
      setHighlightedServerId('');
      setShowAddVps(false);
    } catch {
      showToast('Failed to add VPS subscriptions', 'error');
    }
  };
  const handleOpenAddVps = () => {
    setSubscriptionRows([]);
    setServerSearch('');
    setHighlightedServerId('');
    setShowAddVps(true);
  };

  const openRenew = (subscription) => {
    setRenewTarget(subscription);
    setRenewForm({
      subscriptionPlan: subscription.subscriptionPlan,
      subscriptionPrice: String(subscription.subscriptionPrice),
    });
  };

  const handleRenew = async () => {
    if (!renewTarget) return;
    try {
      await renewSubscription({
        id: renewTarget.id,
        subscriptionPlan: renewForm.subscriptionPlan,
        subscriptionPrice: Number(renewForm.subscriptionPrice),
      }).unwrap();
      showToast('Subscription renewed');
      setRenewTarget(null);
    } catch {
      showToast('Failed to renew subscription', 'error');
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelTarget) return;
    try {
      await cancelSubscription(cancelTarget.id).unwrap();
      showToast('Subscription cancelled');
      setCancelTarget(null);
    } catch {
      showToast('Failed to cancel subscription', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Link to="/vps-users" className="text-sm text-accent-600 hover:underline">{'< Back to VPS Users'}</Link>
          <h1 className="text-3xl font-bold mt-2">{user.customerName}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {user.customerEmail} {user.customerPhone ? `• ${user.customerPhone}` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleOpenAddVps}>Add VPS</Button>
          {!editing && <Button variant="secondary" onClick={startEdit}>Edit</Button>}
          <Button variant="secondary" onClick={() => setShowDelete(true)}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border rounded-lg bg-white dark:bg-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Source</p>
          <p className="mt-2 text-sm">{user.source === 'server_request' ? 'Paid server request' : 'Manual dashboard entry'}</p>
        </div>
        <div className="border rounded-lg bg-white dark:bg-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Subscriptions</p>
          <p className="mt-2 text-2xl font-semibold">{user.totalSubscriptions}</p>
        </div>
        <div className="border rounded-lg bg-white dark:bg-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Active</p>
          <p className="mt-2 text-2xl font-semibold">{user.activeSubscriptions}</p>
        </div>
        <div className="border rounded-lg bg-white dark:bg-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Expiring Soon</p>
          <p className="mt-2 text-2xl font-semibold">{user.expiringSoonCount}</p>
        </div>
      </div>

      <div className="border rounded-lg bg-white dark:bg-neutral-800 shadow-sm divide-y">
        {editing ? (
          <div className="p-6 space-y-4">
            <input
              placeholder="Customer name"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            />
            <input
              placeholder="Email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            />
            <input
              placeholder="Phone"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            {user.notes && (
              <div className="p-6">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{user.notes}</p>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Subscriptions</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Add one or more VPS subscriptions and manage renew/cancel per row.
                  </p>
                </div>
                <Button variant="secondary" onClick={handleOpenAddVps}>Add VPS</Button>
              </div>

              {user.subscriptions?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 pr-4">Server</th>
                        <th className="text-left py-3 pr-4">Plan</th>
                        <th className="text-left py-3 pr-4">Price</th>
                        <th className="text-left py-3 pr-4">Expiry</th>
                        <th className="text-left py-3 pr-4">Status</th>
                        <th className="text-right py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.subscriptions.map((subscription) => (
                        <tr key={subscription.id} className="border-b last:border-b-0">
                          <td className="py-4 pr-4">
                            {subscription.vpsServer ? (
                              <div>
                                <div className="font-medium">{subscription.vpsServer.name}</div>
                                <div className="text-xs font-mono text-neutral-500">{subscription.vpsServer.ip}</div>
                              </div>
                            ) : (
                              <span className="text-neutral-400">Server unavailable</span>
                            )}
                          </td>
                          <td className="py-4 pr-4">{subscription.subscriptionPlan}</td>
                          <td className="py-4 pr-4">{subscription.subscriptionPrice}</td>
                          <td className="py-4 pr-4">
                            {subscription.subscriptionEndDate ? (
                              <div>{new Date(subscription.subscriptionEndDate).toLocaleDateString()}</div>
                            ) : (
                              <div className="text-neutral-400">No active expiry</div>
                            )}
                            {subscription.status === 'active' && subscription.daysUntilExpiry !== null && (
                              <div className="text-xs text-neutral-500">{subscription.daysUntilExpiry} days left</div>
                            )}
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={subscription.status} />
                              {subscription.expiringSoon && (
                                <span className="text-xs text-amber-600">Expiring soon</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2 flex-wrap">
                              <button
                                onClick={() => openRenew(subscription)}
                                className="px-2 py-1 text-xs border rounded-md hover:bg-emerald-50 text-emerald-700"
                              >
                                Renew
                              </button>
                              <button
                                onClick={() => setCancelTarget(subscription)}
                                className="px-2 py-1 text-xs border rounded-md hover:bg-red-50 text-red-700"
                              >
                                Cancel
                              </button>
                              {subscription.vpsServer && (
                                <Link to={`/vps-servers/${subscription.vpsServer.id}`} className="px-2 py-1 text-xs border rounded-md hover:bg-neutral-100">
                                  Server
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-neutral-500">
                  No subscriptions yet. This is expected for paid requests that were auto-converted into onboarding customers.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showAddVps} onClose={() => setShowAddVps(false)} title="Add VPS Subscription" size="lg">
        <div className="space-y-4">
          <input
            value={serverSearch}
            onChange={(e) => {
              setServerSearch(e.target.value);
              setHighlightedServerId('');
            }}
            placeholder="Search available VPS by name, IP, or details"
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
          />
          <div className="border rounded-lg bg-white dark:bg-neutral-900 overflow-hidden">
            {filteredAvailableServers.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-500">
                No available VPS matched the search.
              </div>
            ) : (
              filteredAvailableServers.map((server) => {
                const isActive = highlightedServerId === server.id;
                return (
                  <button
                    key={server.id}
                    type="button"
                    onClick={() => handleSelectServer(server)}
                    onMouseEnter={() => setHighlightedServerId(server.id)}
                    className={`w-full px-4 py-3 text-left border-b last:border-b-0 ${
                      isActive
                        ? 'bg-neutral-100 dark:bg-neutral-800'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="font-medium text-sm">{server.name}</div>
                    <div className="text-xs text-neutral-500 font-mono">{server.ip}</div>
                    <div className="text-xs text-neutral-500 mt-1">{server.serverDetails}</div>
                  </button>
                );
              })
            )}
          </div>
          {subscriptionRows.length === 0 ? (
            <div className="border rounded-lg p-6 text-sm text-neutral-500">
              Search and select one or more available VPS from the list above.
            </div>
          ) : subscriptionRows.map((row, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">VPS #{index + 1}</h3>
                <button onClick={() => handleRemoveRow(index)} className="text-xs text-red-600">
                  Remove
                </button>
              </div>
              <div className="rounded-md border px-3 py-2 text-sm bg-white dark:bg-neutral-900">
                <div className="font-medium">{row.vpsServerLabel || 'No VPS selected'}</div>
                <div className="text-xs font-mono text-neutral-500">{row.vpsServerId}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={row.subscriptionPlan}
                  onChange={(e) => handleRowChange(index, 'subscriptionPlan', e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                >
                  {PLAN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={row.subscriptionPrice}
                  onChange={(e) => handleRowChange(index, 'subscriptionPrice', e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                />
                <input
                  type="date"
                  value={row.subscriptionStartDate}
                  onChange={(e) => handleRowChange(index, 'subscriptionStartDate', e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2 justify-between">
            <div className="text-sm text-neutral-500 self-center">
              Selected VPS: {subscriptionRows.length}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowAddVps(false)}>Close</Button>
              <Button onClick={handleCreateSubscriptions} disabled={addingSubscriptions}>
                {addingSubscriptions ? 'Saving...' : 'Save and Email'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!renewTarget} onClose={() => setRenewTarget(null)} title="Renew Subscription">
        <div className="space-y-4">
          {renewTarget && (
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Current expiry: {renewTarget.subscriptionEndDate
                ? new Date(renewTarget.subscriptionEndDate).toLocaleDateString()
                : 'No active expiry'}
              <br />
              New expiry after renewal: {projectedRenewalDate?.toLocaleDateString()}
            </div>
          )}
          <select
            value={renewForm.subscriptionPlan}
            onChange={(e) => setRenewForm((current) => ({ ...current, subscriptionPlan: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
          >
            {PLAN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            type="number"
            value={renewForm.subscriptionPrice}
            onChange={(e) => setRenewForm((current) => ({ ...current, subscriptionPrice: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            placeholder="Subscription price"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setRenewTarget(null)}>Close</Button>
            <Button onClick={handleRenew} disabled={renewing}>
              {renewing ? 'Renewing...' : 'Confirm Renewal'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message={cancelling ? 'Cancelling...' : 'Cancel this subscription now and release its assigned server?'}
      />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete VPS User"
        message="Delete this customer and all related subscriptions?"
      />
    </div>
  );
}

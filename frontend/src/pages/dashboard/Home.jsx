import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useGetDashboardSummaryQuery } from '../../api/dashboardApi';
import StatusBadge from '../../components/common/StatusBadge';

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function StatCard({ label, value, accent = false, to, helper }) {
  const content = (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
      <h3 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</h3>
      <p className={`text-3xl font-bold ${accent ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
        {value ?? 0}
      </p>
      {helper ? <p className="mt-2 text-xs text-neutral-500">{helper}</p> : null}
    </div>
  );

  if (!to) return content;
  return (
    <Link to={to} className="block transition-opacity hover:opacity-95">
      {content}
    </Link>
  );
}

function WindowCard({ title, window, to }) {
  return (
    <Link
      to={to}
      className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-accent-300 dark:border-neutral-800 dark:bg-neutral-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {window.totalRequests} request{window.totalRequests === 1 ? '' : 's'}
          </p>
        </div>
        <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {formatUsd(window.totalAmount)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/10">
          <p className="text-xs text-neutral-500">Pending</p>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
            {formatUsd(window.pendingAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-900/10">
          <p className="text-xs text-neutral-500">Unpaid</p>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
            {formatUsd(window.unpaidAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/10">
          <p className="text-xs text-neutral-500">Paid</p>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
            {formatUsd(window.paidAmount)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError } = useGetDashboardSummaryQuery();

  if (isLoading) {
    return <div className="p-4 text-neutral-600 dark:text-neutral-400">Loading dashboard...</div>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load dashboard summary.
      </div>
    );
  }

  const windows = data.partnerPaymentWindows ?? {
    today: { totalRequests: 0, totalAmount: 0, pendingAmount: 0, unpaidAmount: 0, paidAmount: 0 },
    last3Days: { totalRequests: 0, totalAmount: 0, pendingAmount: 0, unpaidAmount: 0, paidAmount: 0 },
    last7Days: { totalRequests: 0, totalAmount: 0, pendingAmount: 0, unpaidAmount: 0, paidAmount: 0 },
    last30Days: { totalRequests: 0, totalAmount: 0, pendingAmount: 0, unpaidAmount: 0, paidAmount: 0 },
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Welcome back, {user?.name || user?.email || 'Admin'}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={data.usersCount} />
        <StatCard label="Pending Server Requests" value={data.pendingServerRequests} accent to="/vps-users?requestStatus=pending" />
        <StatCard label="Paid Server Requests" value={data.paidServerRequests} to="/vps-users?requestStatus=paid" />
        <StatCard label="Processing Servers" value={data.processingServers} to="/vps-users?requestStatus=&requestServerStatus=processing" />
        <StatCard label="Ready to Share" value={data.readyToShareServers} to="/vps-users?requestStatus=&requestServerStatus=ready_to_share" />
        <StatCard label="Pending Partner Reviews" value={data.pendingPartnerPayments} accent to="/partner-payments?status=pending" />
        <StatCard label="Approved But Unpaid" value={data.unpaidPartnerPayments} to="/partner-payments?status=unpaid" helper="Approved requests waiting settlement" />
        <StatCard label="Paid Partner Requests" value={data.paidPartnerPayments} to="/partner-payments?status=paid" />
      </div>

      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Partner Payment Windows</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Dollar totals for submitted partner payment requests across rolling windows.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WindowCard title="Today" window={windows.today} to="/partner-payments" />
          <WindowCard title="Last 3 Days" window={windows.last3Days} to="/partner-payments" />
          <WindowCard title="Last 7 Days" window={windows.last7Days} to="/partner-payments" />
          <WindowCard title="Last 30 Days" window={windows.last30Days} to="/partner-payments" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Recent Server Requests</h2>
            <Link to="/vps-users?requestStatus=" className="text-sm text-accent-600 hover:underline dark:text-accent-400">
              View all
            </Link>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {(data.recentServerRequests ?? []).length === 0 ? (
              <p className="p-4 text-sm text-neutral-500">No server requests yet.</p>
            ) : (
              data.recentServerRequests.map((item) => (
                <Link
                  key={item.id}
                  to={`/vps-users?requestStatus=&requestId=${item.id}`}
                  className="block p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {item.serverName || 'VPS request'}
                      </p>
                      <p className="text-sm text-neutral-500">{item.customerName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={item.paymentStatus} />
                      <StatusBadge status={item.serverStatus} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Recent Partner Payments</h2>
            <Link to="/partner-payments" className="text-sm text-accent-600 hover:underline dark:text-accent-400">
              View all
            </Link>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {(data.recentPartnerPayments ?? []).length === 0 ? (
              <p className="p-4 text-sm text-neutral-500">No partner payments yet.</p>
            ) : (
              data.recentPartnerPayments.map((item) => (
                <Link
                  key={item.id}
                  to={
                    item.bankAccountNumber
                      ? `/partner-payments?bankAccount=${encodeURIComponent(
                          item.bankAccountNumber.trim().toLowerCase()
                        )}`
                      : `/partner-payments/${item.id}`
                  }
                  className="block p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.partnerName}</p>
                      <p className="text-sm text-neutral-500">
                        {formatUsd(item.amount)} - {item.bankAccountNumber || 'No account yet'}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

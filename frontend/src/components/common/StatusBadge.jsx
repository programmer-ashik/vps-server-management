const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  unpaid: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  queued_for_payout: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  ready_to_share: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  shared: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  inactive: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  shared: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  online: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  offline: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  unknown: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  cancelled: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
};

function formatLabel(value) {
  return String(value ?? '').replace(/_/g, ' ');
}

export default function StatusBadge({ status }) {
  const key = String(status ?? 'pending').toLowerCase();
  const className = statusStyles[key] ?? statusStyles.pending;

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md capitalize ${className}`}>
      {formatLabel(key)}
    </span>
  );
}

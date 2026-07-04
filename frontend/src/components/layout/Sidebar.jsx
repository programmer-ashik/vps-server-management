import { Link, useLocation } from 'react-router-dom';

function DashboardIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Zm10-7h6v-3h-6v3Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path strokeLinecap="round" d="M7 7h.01M7 17h.01M11 7h2M11 17h2" />
    </svg>
  );
}

function VpsUsersIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21a7 7 0 0 1 14 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 8h2m-1-1v2" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 15h3" />
    </svg>
  );
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/users', label: 'Users', icon: UsersIcon },
  { path: '/vps-servers', label: 'VPS Servers', icon: ServerIcon },
  { path: '/vps-users', label: 'VPS Users', icon: VpsUsersIcon },
  { path: '/partner-payments', label: 'Partner Payments', icon: PaymentIcon },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between md:hidden">
            <div className="font-semibold text-lg">Menu</div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="hidden md:block p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="font-bold text-lg text-neutral-900 dark:text-neutral-100">Server Dashboard</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Admin panel</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all ${
                    isActive
                      ? 'bg-accent-500 text-white shadow-sm'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}
                >
                  <span className="w-7 h-7 rounded-md border border-current/20 flex items-center justify-center">
                    <Icon />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

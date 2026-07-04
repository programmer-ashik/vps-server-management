export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 dark:focus:ring-offset-neutral-900 shadow-sm hover:shadow',
    secondary: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:ring-neutral-500 dark:focus:ring-offset-neutral-900 border border-neutral-300 dark:border-neutral-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:focus:ring-offset-neutral-900 shadow-sm hover:shadow',
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}


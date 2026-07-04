export default function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <input
        className={`w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:focus:ring-offset-neutral-900 transition-all ${className}`}
        {...props}
      />
    </div>
  );
}


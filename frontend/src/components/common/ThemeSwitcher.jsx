import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleMode } from "../../features/theme/themeSlice";

export default function ThemeSwitcher() {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((s) => s.theme);

  return (
    <div className="flex items-center">
      <button
        className="px-3 py-1.5 rounded-md bg-accent-500 text-white hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 text-sm font-medium"
        onClick={() => dispatch(toggleMode())}
        aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      >
        {mode === "dark" ? "Light" : "Dark"}
      </button>
    </div>
  );
}

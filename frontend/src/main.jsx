import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./index.css";
import { loadJSON } from "./utils/storage";

// Apply theme immediately before React renders to prevent flash
function applyInitialTheme() {
  const theme = loadJSON('theme') ?? { mode: 'light' };
  const root = document.documentElement;
  
  // Apply dark mode class
  if (theme.mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Apply theme synchronously before React renders
applyInitialTheme();

// Start MSW only in dev
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { worker } = await import("./mocks/browser");
    // Use default service worker path (public/mockServiceWorker.js)
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

// Initialize app
async function initApp() {
  try {
    await enableMocking();
  } catch (err) {
    console.warn("MSW initialization failed, continuing without mocks:", err);
  }
  
  ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

initApp();

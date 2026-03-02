import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme before render to prevent flash
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

// In preview/editor environments, unregister any stale service workers
const isPreview =
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app") && window.location.hostname.includes("preview");

if (isPreview && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
} else if ("serviceWorker" in navigator) {
  // Production: listen for new service worker and prompt user to refresh
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New version available — dispatch custom event for the app to show a toast
          window.dispatchEvent(new CustomEvent("sw-update-available", { detail: registration }));
        }
      });
    });
  });
}

// Core Web Vitals monitoring (LCP, CLS) — lightweight, no deps
try {
  const logVital = (name: string, value: number) => {
    try {
      const log = JSON.parse(localStorage.getItem("tb_perf_log") || "[]");
      log.unshift({ name, value: Math.round(value), ts: Date.now() });
      localStorage.setItem("tb_perf_log", JSON.stringify(log.slice(0, 20)));
    } catch { /* quota exceeded — ignore */ }
  };
  if (typeof PerformanceObserver !== "undefined") {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) logVital("LCP", entry.startTime);
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      let cls = 0;
      for (const entry of list.getEntries()) cls += (entry as any).value ?? 0;
      if (cls > 0) logVital("CLS", cls * 1000);
    }).observe({ type: "layout-shift", buffered: true });
  }
} catch { /* PerformanceObserver not supported */ }

createRoot(document.getElementById("root")!).render(<App />);

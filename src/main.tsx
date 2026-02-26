import { createRoot } from "react-dom/client";
import "./index.css";

// Apply saved theme before render to prevent flash
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

// Debug: log env vars availability
console.log("[TradeBook] ENV check:", {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  mode: import.meta.env.MODE,
});

const root = createRoot(document.getElementById("root")!);

import("./App.tsx")
  .then(({ default: App }) => {
    root.render(<App />);
  })
  .catch((err) => {
    console.error("[TradeBook] App failed to load:", err);
    root.render(
      <div style={{ padding: "2rem", fontFamily: "Inter, sans-serif", color: "#fff", background: "#0a0f1c", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>TradeBook</h1>
        <p style={{ color: "#f87171" }}>Failed to initialize: {err?.message || String(err)}</p>
        <p style={{ color: "#94a3b8", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          Please try refreshing the page. If the issue persists, the backend may be temporarily unavailable.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Refresh Page
        </button>
      </div>
    );
  });

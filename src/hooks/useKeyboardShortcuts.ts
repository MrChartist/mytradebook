import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutHandlers {
  onNewTrade?: () => void;
  onNewAlert?: () => void;
  onNewStudy?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable) {
        return;
      }

      // Skip if modifier keys (Ctrl/Cmd) are held — avoid hijacking browser shortcuts
      if (e.ctrlKey || e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          handlers.onNewTrade?.();
          break;
        case "a":
          e.preventDefault();
          handlers.onNewAlert?.();
          break;
        case "s":
          e.preventDefault();
          handlers.onNewStudy?.();
          break;
        case "/":
          e.preventDefault();
          handlers.onSearch?.();
          break;
        // Navigation shortcuts with 'g' prefix pattern
        case "1":
          navigate("/");
          break;
        case "2":
          navigate("/trades");
          break;
        case "3":
          navigate("/alerts");
          break;
        case "4":
          navigate("/studies");
          break;
        case "5":
          navigate("/watchlist");
          break;
        case "6":
          navigate("/analytics");
          break;
      }
    },
    [navigate, handlers]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

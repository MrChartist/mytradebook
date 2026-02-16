import { useState, useCallback, useEffect } from "react";
import { useUserSettings } from "./useUserSettings";

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

// Type for user settings with dashboard_layout
interface UserSettingsWithLayout {
  dashboard_layout?: WidgetConfig[] | null;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "kpi", label: "KPI Cards", visible: true, order: 0 },
  { id: "chart", label: "Daily Chart", visible: true, order: 1 },
  { id: "alerts", label: "Alerts Panel", visible: true, order: 2 },
  { id: "positions", label: "Open Positions", visible: true, order: 3 },
  { id: "monthly", label: "Monthly Metrics", visible: true, order: 4 },
  { id: "actions", label: "Quick Actions", visible: true, order: 5 },
];

export function useDashboardLayout() {
  const { settings, updateSettings } = useUserSettings();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  useEffect(() => {
    const settingsWithLayout = settings as unknown as UserSettingsWithLayout;
    const saved = settingsWithLayout?.dashboard_layout;

    if (saved && Array.isArray(saved)) {
      // Merge saved with defaults to handle new widgets
      const merged = DEFAULT_WIDGETS.map((dw) => {
        const found = saved.find((s) => s.id === dw.id);
        return found ? { ...dw, visible: found.visible, order: found.order } : dw;
      });
      merged.sort((a, b) => a.order - b.order);
      setWidgets(merged);
    }
  }, [settings]);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
      const update: UserSettingsWithLayout = { dashboard_layout: next };
      updateSettings.mutate(update);
      return next;
    });
  }, [updateSettings]);

  const moveWidget = useCallback((id: string, direction: "up" | "down") => {
    setWidgets((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      const reordered = next.map((w, i) => ({ ...w, order: i }));
      const update: UserSettingsWithLayout = { dashboard_layout: reordered };
      updateSettings.mutate(update);
      return reordered;
    });
  }, [updateSettings]);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    const update: UserSettingsWithLayout = { dashboard_layout: null };
    updateSettings.mutate(update);
  }, [updateSettings]);

  return { widgets, toggleWidget, moveWidget, resetLayout };
}

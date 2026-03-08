import { useState, useCallback, useEffect } from "react";
import { useUserSettings } from "./useUserSettings";
import { arrayMove } from "@dnd-kit/sortable";

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

interface UserSettingsWithLayout {
  dashboard_layout?: WidgetConfig[] | null;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "kpi", label: "KPI Cards", visible: true, order: 0 },
  { id: "riskGoal", label: "Risk Gauge & Goals", visible: true, order: 1 },
  { id: "heatMap", label: "Portfolio Heat Map", visible: true, order: 2 },
  { id: "chart", label: "Daily Chart", visible: true, order: 3 },
  { id: "alerts", label: "Alerts Panel", visible: true, order: 4 },
  { id: "equityCurve", label: "Equity Curve", visible: true, order: 5 },
  { id: "positions", label: "Open Positions", visible: true, order: 6 },
  { id: "streakCalendar", label: "Streak & Calendar", visible: true, order: 7 },
  { id: "monthly", label: "Monthly Metrics", visible: true, order: 8 },
  { id: "actions", label: "Quick Actions", visible: true, order: 9 },
  { id: "aiInsights", label: "AI Insights", visible: true, order: 10 },
  { id: "achievements", label: "Achievements", visible: true, order: 11 },
];

export function useDashboardLayout() {
  const { settings, updateSettings } = useUserSettings();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  useEffect(() => {
    const settingsWithLayout = settings as unknown as UserSettingsWithLayout;
    const saved = settingsWithLayout?.dashboard_layout;

    if (saved && Array.isArray(saved)) {
      const merged = DEFAULT_WIDGETS.map((dw) => {
        const found = saved.find((s) => s.id === dw.id);
        return found ? { ...dw, visible: found.visible, order: found.order } : dw;
      });
      merged.sort((a, b) => a.order - b.order);
      setWidgets(merged);
    }
  }, [settings]);

  const persistWidgets = useCallback((next: WidgetConfig[]) => {
    updateSettings.mutate({ dashboard_layout: next } as any);
  }, [updateSettings]);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
      persistWidgets(next);
      return next;
    });
  }, [persistWidgets]);

  const moveWidget = useCallback((id: string, direction: "up" | "down") => {
    setWidgets((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      const reordered = next.map((w, i) => ({ ...w, order: i }));
      persistWidgets(reordered);
      return reordered;
    });
  }, [persistWidgets]);

  const reorderWidgets = useCallback((oldIndex: number, newIndex: number) => {
    setWidgets((prev) => {
      const next = arrayMove(prev, oldIndex, newIndex).map((w, i) => ({ ...w, order: i }));
      persistWidgets(next);
      return next;
    });
  }, [persistWidgets]);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    updateSettings.mutate({ dashboard_layout: null } as any);
  }, [updateSettings]);

  return { widgets, toggleWidget, moveWidget, reorderWidgets, resetLayout };
}

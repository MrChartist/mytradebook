import { useState, useCallback, useEffect } from "react";
import { useUserSettings } from "./useUserSettings";
import { arrayMove } from "@dnd-kit/sortable";

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  pinned?: boolean;
  priority?: "essential" | "normal" | "optional";
}

interface UserSettingsWithLayout {
  dashboard_layout?: WidgetConfig[] | null;
  dashboard_focus_mode?: boolean;
  dashboard_density?: "compact" | "comfortable" | "spacious";
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "morningBriefing", label: "Morning Briefing", visible: true, order: 0, priority: "essential", pinned: true },
  { id: "dailyScorecard", label: "Daily Scorecard", visible: true, order: 1, priority: "essential" },
  { id: "kpi", label: "KPI Cards", visible: true, order: 2, priority: "essential" },
  { id: "riskMeter", label: "Risk Meter", visible: true, order: 3, priority: "essential" },
  { id: "disciplineScore", label: "Discipline Score", visible: true, order: 4, priority: "normal" },
  { id: "riskGoal", label: "Risk Goal", visible: true, order: 5, priority: "normal" },
  { id: "heatMap", label: "Portfolio Heat Map", visible: true, order: 6, priority: "normal" },
  { id: "chart", label: "Daily Chart", visible: true, order: 7, priority: "normal" },
  { id: "alerts", label: "Alerts Panel", visible: true, order: 8, priority: "normal" },
  { id: "equityCurve", label: "Equity Curve", visible: true, order: 9, priority: "normal" },
  { id: "positions", label: "Open Positions", visible: true, order: 10, priority: "essential" },
  { id: "streakCalendar", label: "Streak & Calendar", visible: true, order: 11, priority: "optional" },
  { id: "monthly", label: "Monthly Metrics", visible: true, order: 12, priority: "optional" },
  { id: "actions", label: "Quick Actions", visible: true, order: 13, priority: "normal" },
  { id: "aiInsights", label: "AI Insights", visible: true, order: 14, priority: "normal" },
  { id: "achievements", label: "Achievements", visible: true, order: 15, priority: "optional" },
];

export function useDashboardLayout() {
  const { settings, updateSettings } = useUserSettings();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [focusMode, setFocusMode] = useState(false);
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");

  useEffect(() => {
    const settingsWithLayout = settings as unknown as UserSettingsWithLayout;
    
    if (settingsWithLayout?.dashboard_focus_mode !== undefined) {
      setFocusMode(settingsWithLayout.dashboard_focus_mode);
    }
    if (settingsWithLayout?.dashboard_density !== undefined) {
      setDensity(settingsWithLayout.dashboard_density);
    }

    const saved = settingsWithLayout?.dashboard_layout;
    if (saved && Array.isArray(saved)) {
      const merged = DEFAULT_WIDGETS.map((dw) => {
        const found = saved.find((s) => s.id === dw.id);
        return found ? { ...dw, visible: found.visible, order: found.order, pinned: found.pinned ?? dw.pinned } : dw;
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

  const togglePin = useCallback((id: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w));
      persistWidgets(next);
      return next;
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
    setFocusMode(false);
    setDensity("comfortable");
    updateSettings.mutate({ 
      dashboard_layout: null,
      dashboard_focus_mode: false,
      dashboard_density: "comfortable"
    } as any);
  }, [updateSettings]);

  const handleSetFocusMode = useCallback((val: boolean) => {
    setFocusMode(val);
    updateSettings.mutate({ dashboard_focus_mode: val } as any);
  }, [updateSettings]);

  const handleSetDensity = useCallback((val: "compact" | "comfortable" | "spacious") => {
    setDensity(val);
    updateSettings.mutate({ dashboard_density: val } as any);
  }, [updateSettings]);

  const getVisibleWidgets = useCallback(() => {
    return widgets.filter(w => {
      if (!w.visible) return false;
      if (focusMode) {
        return w.pinned || w.priority === "essential";
      }
      return true;
    });
  }, [widgets, focusMode]);

  return { 
    widgets, 
    toggleWidget, 
    moveWidget,
    togglePin,
    reorderWidgets, 
    resetLayout,
    focusMode,
    setFocusMode: handleSetFocusMode,
    density,
    setDensity: handleSetDensity,
    getVisibleWidgets
  };
}

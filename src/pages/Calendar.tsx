import { CalendarDays } from "lucide-react";
import { CalendarHeatmap } from "@/components/dashboard/CalendarHeatmap";

export default function Calendar() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground text-sm">Daily trading activity timeline and journal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarHeatmap />
        </div>
        <div className="surface-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Daily Journal
          </h3>
          <p className="text-muted-foreground text-sm">Select a date to view trades, alerts, and your daily journal entry.</p>
        </div>
      </div>
    </div>
  );
}

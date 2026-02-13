import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "grid";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center rounded-xl border border-border p-0.5 bg-card", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 rounded-lg transition-all duration-200",
          view === "list" && "bg-primary/10 text-primary shadow-sm"
        )}
        onClick={() => onViewChange("list")}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 rounded-lg transition-all duration-200",
          view === "grid" && "bg-primary/10 text-primary shadow-sm"
        )}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
    </div>
  );
}

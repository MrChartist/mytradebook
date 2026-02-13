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
    <div className={cn("flex items-center rounded-lg border border-border p-0.5", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 w-7 p-0 rounded-md",
          view === "list" && "bg-primary/10 text-primary"
        )}
        onClick={() => onViewChange("list")}
      >
        <List className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 w-7 p-0 rounded-md",
          view === "grid" && "bg-primary/10 text-primary"
        )}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

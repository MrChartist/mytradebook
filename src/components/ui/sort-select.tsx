import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SortOption[];
  className?: string;
}

export function SortSelect({ value, onValueChange, options, className }: SortSelectProps) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <ArrowUpDown className="absolute left-2 w-3 h-3 text-muted-foreground pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-8 w-[160px] pl-7 pr-3 text-xs rounded-xl border border-border bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

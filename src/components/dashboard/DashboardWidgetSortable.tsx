import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SortableWidgetItemProps {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
}

export function SortableWidgetItem({ id, label, visible, onToggle }: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-1.5 px-1 rounded-lg",
        isDragging && "opacity-50 bg-muted/50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 text-xs flex-1 text-left",
          !visible && "text-muted-foreground line-through"
        )}
      >
        <span className={cn(
          "w-2 h-2 rounded-full shrink-0",
          visible ? "bg-profit" : "bg-muted-foreground/30"
        )} />
        {label}
      </button>
    </div>
  );
}

interface SortableWidgetWrapperProps {
  id: string;
  children: ReactNode;
}

export function SortableWidgetWrapper({ id, children }: SortableWidgetWrapperProps) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-60 scale-[0.98]")}
    >
      {children}
    </div>
  );
}

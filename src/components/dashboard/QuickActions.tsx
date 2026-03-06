import { useState } from "react";
import { Plus, TrendingUp, Bell, BookOpen, Moon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateTradeModal } from "@/components/modals/CreateTradeModal";
import { CreateAlertModal } from "@/components/modals/CreateAlertModal";
import { CreateStudyModal } from "@/components/modals/CreateStudyModal";
import { DailyReviewWizard } from "@/components/dashboard/DailyReviewWizard";

const actions = [
  { label: "New Trade", icon: TrendingUp, modal: "trade" as const, color: "text-profit" },
  { label: "New Alert", icon: Bell, modal: "alert" as const, color: "text-warning" },
  { label: "New Study", icon: BookOpen, modal: "study" as const, color: "text-primary" },
  { label: "Daily Review", icon: Moon, modal: "review" as const, color: "text-accent-foreground" },
];

export function QuickActions() {
  const [expanded, setExpanded] = useState(false);
  const [openModal, setOpenModal] = useState<"trade" | "alert" | "study" | "review" | null>(null);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* Action buttons */}
        {expanded &&
          actions.map((action, i) => (
            <button
              key={action.label}
              onClick={() => {
                setOpenModal(action.modal);
                setExpanded(false);
              }}
              className="flex items-center gap-2 glass-card px-4 py-2.5 rounded-full hover:scale-105 transition-all duration-200 animate-scale-in shadow-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <action.icon className={cn("w-4 h-4", action.color)} />
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            </button>
          ))}

        {/* FAB */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-glow",
            "bg-gradient-primary hover:scale-110 active:scale-95",
            expanded && "rotate-45"
          )}
        >
          {expanded ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <Plus className="w-6 h-6 text-primary-foreground" />
          )}
        </button>
      </div>

      {/* Modals */}
      {openModal === "trade" && (
        <CreateTradeModal open onOpenChange={(o) => !o && setOpenModal(null)} />
      )}
      {openModal === "alert" && (
        <CreateAlertModal open onOpenChange={(o) => !o && setOpenModal(null)} />
      )}
      {openModal === "study" && (
        <CreateStudyModal open onOpenChange={(o) => !o && setOpenModal(null)} />
      )}
      {openModal === "review" && (
        <DailyReviewWizard open onOpenChange={(o) => !o && setOpenModal(null)} />
      )}
    </>
  );
}

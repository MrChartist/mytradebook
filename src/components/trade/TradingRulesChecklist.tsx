import { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTradingRules } from "@/hooks/useTradingRules";
import { cn } from "@/lib/utils";

interface TradingRulesChecklistProps {
  checkedRules: Set<string>;
  onToggleCheck: (ruleId: string) => void;
  compact?: boolean;
}

export function TradingRulesChecklist({
  checkedRules,
  onToggleCheck,
  compact = false,
}: TradingRulesChecklistProps) {
  const { rules, addRule, deleteRule } = useTradingRules();
  const [newRule, setNewRule] = useState("");
  const [editing, setEditing] = useState(false);

  const activeRules = rules.filter((r) => r.active);
  const allChecked = activeRules.length > 0 && activeRules.every((r) => checkedRules.has(r.id));

  const handleAdd = () => {
    if (!newRule.trim()) return;
    addRule.mutate(newRule.trim());
    setNewRule("");
  };

  if (activeRules.length === 0 && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg border border-dashed border-border hover:border-primary/30"
      >
        <ClipboardCheck className="w-3.5 h-3.5" />
        Set up pre-trade rules checklist
      </button>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2",
      allChecked
        ? "border-profit/30 bg-profit/5"
        : "border-border bg-muted/30"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium">
          <ClipboardCheck className={cn("w-3.5 h-3.5", allChecked ? "text-profit" : "text-muted-foreground")} />
          <span>Pre-Trade Checklist</span>
          {allChecked && <span className="text-profit text-[10px]">✓ All clear</span>}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px]"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Done" : "Edit"}
        </Button>
      </div>

      <div className="space-y-1">
        {activeRules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => !editing && onToggleCheck(rule.id)}
          >
            {checkedRules.has(rule.id) ? (
              <CheckCircle2 className="w-4 h-4 text-profit flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(
              "text-xs flex-1",
              checkedRules.has(rule.id) && "line-through text-muted-foreground"
            )}>
              {rule.rule_text}
            </span>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRule.mutate(rule.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-loss" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="flex gap-2 pt-1">
          <Input
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="e.g., Never trade first 15 min"
            className="h-7 text-xs"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          />
          <Button
            type="button"
            size="sm"
            className="h-7 px-2"
            onClick={handleAdd}
            disabled={!newRule.trim()}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

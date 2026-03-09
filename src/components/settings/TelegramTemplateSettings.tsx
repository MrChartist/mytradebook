import { useState } from "react";
import { Code2, RotateCcw, Save, Loader2, Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

const TEMPLATE_KEYS: Array<{
  key: string;
  label: string;
  description: string;
  defaultPreview: string;
}> = [
  {
    key: "new_trade",
    label: "New Trade",
    description: "Sent when a new trade is created",
    defaultPreview: "🟢 *NEW BUY TRADE*\n📍 *RELIANCE* `NSE·EQ`\n💰 Entry: ₹2,850\n🛑 SL: ₹2,800 ...",
  },
  {
    key: "trade_closed",
    label: "Trade Closed",
    description: "Sent when a trade is closed",
    defaultPreview: "📒 *TRADE CLOSED*\n📍 *RELIANCE* `NSE·EQ`\n🟢 P&L: ₹5,000 (+2.50%) ...",
  },
  {
    key: "alert_triggered",
    label: "Alert Triggered",
    description: "Sent when a price alert fires",
    defaultPreview: "📈 *PRICE ABOVE HIT*\n📍 *NIFTY*\n💰 LTP: ₹22,500 ...",
  },
];

const AVAILABLE_VARIABLES = [
  { name: "symbol", desc: "Trading symbol" },
  { name: "side", desc: "BUY or SELL" },
  { name: "entry_price", desc: "Entry price (formatted)" },
  { name: "stop_loss", desc: "Stop loss (formatted)" },
  { name: "current_price", desc: "Current/last price" },
  { name: "pnl", desc: "P&L amount" },
  { name: "pnl_percent", desc: "P&L percentage" },
  { name: "quantity", desc: "Quantity" },
  { name: "segment", desc: "Market segment" },
  { name: "status", desc: "Trade status" },
  { name: "targets", desc: "Target levels" },
  { name: "risk_amount", desc: "Risk in ₹ (entry - SL × qty)" },
  { name: "timeframe", desc: "Chart timeframe" },
  { name: "holding_period", desc: "Intraday / Positional" },
  { name: "notes", desc: "Trade notes" },
];

export default function TelegramTemplateSettings() {
  const { settings, updateSettings } = useUserSettings();
  const [templates, setTemplates] = useState<Record<string, string>>(
    () => (settings?.telegram_message_templates as Record<string, string>) || {}
  );
  const [saving, setSaving] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings.mutateAsync({
        telegram_message_templates: templates,
      } as any);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (key: string) => {
    const updated = { ...templates };
    delete updated[key];
    setTemplates(updated);
  };

  const handleCopyVar = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const hasChanges = JSON.stringify(templates) !== JSON.stringify(settings?.telegram_message_templates || {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">Custom Message Templates</h4>
        </div>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Save Templates
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Define custom Telegram message formats using <code className="bg-accent px-1 rounded">{"{{variable}}"}</code> placeholders.
        Leave empty to use the default rich format.
      </p>

      {/* Variable Reference */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <Info className="w-3.5 h-3.5" />
          Available variables
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 p-3 rounded-lg border border-border bg-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {AVAILABLE_VARIABLES.map((v) => (
              <button
                key={v.name}
                onClick={() => handleCopyVar(v.name)}
                className="flex items-center gap-1.5 text-left p-1.5 rounded hover:bg-accent/50 transition-colors group"
              >
                <code className="text-[10px] bg-accent px-1 rounded font-mono text-primary">
                  {`{{${v.name}}}`}
                </code>
                {copiedVar === v.name ? (
                  <Check className="w-3 h-3 text-profit shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                )}
                <span className="text-[10px] text-muted-foreground truncate">{v.desc}</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Template Editors */}
      <div className="space-y-3">
        {TEMPLATE_KEYS.map((tmpl) => (
          <Collapsible
            key={tmpl.key}
            open={expandedKey === tmpl.key}
            onOpenChange={(open) => setExpandedKey(open ? tmpl.key : null)}
          >
            <div className="p-3 rounded-lg border border-border bg-card">
              <CollapsibleTrigger className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tmpl.label}</span>
                  {templates[tmpl.key] ? (
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30">Custom</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px]">Default</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{tmpl.description}</span>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3 space-y-2">
                <Label className="text-xs">Template</Label>
                <Textarea
                  value={templates[tmpl.key] || ""}
                  onChange={(e) => setTemplates({ ...templates, [tmpl.key]: e.target.value })}
                  placeholder={`Leave empty for default format...\n\nExample:\n🚨 NEW SIGNAL: {{symbol}}\nEntry: {{entry_price}} | SL: {{stop_loss}}\nRisk: {{risk_amount}}`}
                  className="min-h-[100px] font-mono text-xs"
                />
                {templates[tmpl.key] && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => handleReset(tmpl.key)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset to default
                  </Button>
                )}

                {/* Preview of default */}
                <div className="p-2 rounded bg-accent/30 border border-border/50">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Default format preview:</p>
                  <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono">{tmpl.defaultPreview}</pre>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

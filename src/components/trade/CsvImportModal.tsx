import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, ArrowRight, ArrowLeft, Check, X, Loader2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type Step = "upload" | "mapping" | "preview" | "importing";

const REQUIRED_FIELDS = ["symbol", "segment", "trade_type", "quantity"] as const;
const OPTIONAL_FIELDS = ["entry_price", "entry_time", "stop_loss", "pnl", "pnl_percent", "status", "notes", "timeframe", "holding_period"] as const;
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

const FIELD_LABELS: Record<string, string> = {
  symbol: "Symbol *",
  segment: "Segment *",
  trade_type: "Trade Type (BUY/SELL) *",
  quantity: "Quantity *",
  entry_price: "Entry Price",
  entry_time: "Entry Time",
  stop_loss: "Stop Loss",
  pnl: "P&L",
  pnl_percent: "P&L %",
  status: "Status",
  notes: "Notes",
  timeframe: "Timeframe",
  holding_period: "Holding Period",
};

const SEGMENT_MAP: Record<string, string> = {
  intraday: "Equity_Intraday", equity_intraday: "Equity_Intraday", eq_intraday: "Equity_Intraday",
  positional: "Equity_Positional", equity_positional: "Equity_Positional", swing: "Equity_Positional",
  futures: "Futures", fut: "Futures", fno: "Futures",
  options: "Options", opt: "Options",
  commodities: "Commodities", mcx: "Commodities", commodity: "Commodities",
};

function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().trim().replace(/[^a-z0-9]/g, "_"));

  const patterns: Record<string, string[]> = {
    symbol: ["symbol", "ticker", "stock", "scrip", "instrument", "name"],
    segment: ["segment", "market", "category", "type"],
    trade_type: ["trade_type", "side", "direction", "buy_sell", "action", "type"],
    quantity: ["quantity", "qty", "lots", "shares", "volume", "size"],
    entry_price: ["entry_price", "buy_price", "price", "entry", "avg_price", "cost"],
    entry_time: ["entry_time", "date", "time", "entry_date", "trade_date", "datetime"],
    stop_loss: ["stop_loss", "sl", "stoploss"],
    pnl: ["pnl", "profit", "p_l", "profit_loss", "net_pnl", "realized_pnl"],
    pnl_percent: ["pnl_percent", "pnl_pct", "return", "returns", "roi"],
    status: ["status", "state"],
    notes: ["notes", "comment", "remarks", "description"],
    timeframe: ["timeframe", "tf", "chart_timeframe"],
    holding_period: ["holding_period", "duration", "hold_period"],
  };

  for (const [field, keywords] of Object.entries(patterns)) {
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (keywords.some(k => lowerHeaders[i].includes(k))) {
        mapping[field] = headers[i];
        break;
      }
    }
  }
  return mapping;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === "," && !inQuotes) { cols.push(current.trim()); current = ""; continue; }
      current += char;
    }
    cols.push(current.trim());
    return cols;
  });
  return { headers, rows };
}

export function CsvImportModal({ open, onOpenChange, onImportComplete }: CsvImportModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const reset = () => {
    setStep("upload");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setImporting(false);
    setImportResult(null);
  };

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      if (h.length === 0) { toast.error("Could not parse CSV file"); return; }
      setHeaders(h);
      setRows(r.filter(r => r.some(c => c.length > 0)));
      setMapping(autoMapColumns(h));
      setStep("mapping");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) handleFile(file);
    else toast.error("Please upload a CSV file");
  }, [handleFile]);

  const missingRequired = REQUIRED_FIELDS.filter(f => !mapping[f]);

  const previewData = rows.slice(0, 5).map(row => {
    const obj: Record<string, string> = {};
    for (const [field, header] of Object.entries(mapping)) {
      const idx = headers.indexOf(header);
      if (idx >= 0) obj[field] = row[idx] || "";
    }
    return obj;
  });

  const handleImport = async () => {
    if (!user) return;
    setImporting(true);
    setStep("importing");
    let success = 0, failed = 0;

    for (const row of rows) {
      try {
        const getValue = (field: string) => {
          const header = mapping[field];
          if (!header) return undefined;
          const idx = headers.indexOf(header);
          return idx >= 0 ? row[idx]?.trim() : undefined;
        };

        const symbol = getValue("symbol");
        const rawSegment = getValue("segment") || "Equity_Intraday";
        const segment = SEGMENT_MAP[rawSegment.toLowerCase()] || rawSegment;
        const tradeType = (getValue("trade_type") || "BUY").toUpperCase();
        const quantity = parseInt(getValue("quantity") || "0", 10);

        if (!symbol || quantity <= 0) { failed++; continue; }

        const validSegments = ["Equity_Intraday", "Equity_Positional", "Futures", "Options", "Commodities"];
        if (!validSegments.includes(segment)) { failed++; continue; }

        const entry: Record<string, unknown> = {
          user_id: user.id,
          symbol,
          segment,
          trade_type: tradeType === "SELL" ? "SELL" : "BUY",
          quantity,
          entry_price: parseFloat(getValue("entry_price") || "0") || null,
          entry_time: getValue("entry_time") || new Date().toISOString(),
          stop_loss: parseFloat(getValue("stop_loss") || "0") || null,
          pnl: parseFloat(getValue("pnl") || "0") || 0,
          pnl_percent: parseFloat(getValue("pnl_percent") || "0") || 0,
          status: (getValue("status") || "OPEN").toUpperCase(),
          notes: getValue("notes") || null,
          timeframe: getValue("timeframe") || null,
          holding_period: getValue("holding_period") || null,
        };

        const validStatuses = ["PENDING", "OPEN", "CLOSED", "CANCELLED"];
        if (!validStatuses.includes(entry.status as string)) entry.status = "OPEN";
        if (entry.status === "CLOSED") entry.closed_at = new Date().toISOString();

        const { error } = await supabase.from("trades").insert(entry as any);
        if (error) { failed++; } else { success++; }
      } catch { failed++; }
    }

    setImportResult({ success, failed });
    setImporting(false);
    if (success > 0) {
      toast.success(`${success} trades imported successfully`);
      onImportComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Import Trades from CSV
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-4">
          {(["upload", "mapping", "preview", "importing"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                step === s ? "bg-primary text-primary-foreground" :
                (["upload", "mapping", "preview", "importing"].indexOf(step) > i) ? "bg-profit text-profit-foreground" :
                "bg-muted text-muted-foreground"
              )}>
                {["upload", "mapping", "preview", "importing"].indexOf(step) > i ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < 3 && <div className="w-8 h-0.5 bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".csv";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFile(file);
              };
              input.click();
            }}
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium mb-1">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-3">
              Required columns: Symbol, Segment, Trade Type, Quantity
            </p>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === "mapping" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Map your CSV columns to trade fields. We auto-detected what we could.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ALL_FIELDS.map((field) => (
                <div key={field}>
                  <label className="text-xs font-medium mb-1 block">{FIELD_LABELS[field]}</label>
                  <Select value={mapping[field] || "_skip"} onValueChange={(v) => setMapping(prev => ({ ...prev, [field]: v === "_skip" ? "" : v }))}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Skip" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_skip">— Skip —</SelectItem>
                      {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {missingRequired.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                Missing required: {missingRequired.map(f => FIELD_LABELS[f]).join(", ")}
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button disabled={missingRequired.length > 0} onClick={() => setStep("preview")}> Preview <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Previewing first 5 of {rows.length} rows. Verify the data looks correct.
            </p>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    {Object.keys(mapping).filter(k => mapping[k]).map(f => (
                      <th key={f} className="px-3 py-2 text-left font-medium">{FIELD_LABELS[f]?.replace(" *", "")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.keys(mapping).filter(k => mapping[k]).map(f => (
                        <td key={f} className="px-3 py-2 truncate max-w-[120px]">{row[f] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("mapping")}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button onClick={handleImport}>
                Import {rows.length} Trades <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === "importing" && (
          <div className="py-8 text-center">
            {importing ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="font-medium">Importing trades...</p>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </>
            ) : importResult && (
              <>
                <div className="w-14 h-14 rounded-full bg-profit/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-profit" />
                </div>
                <p className="font-bold text-lg mb-1">Import Complete</p>
                <p className="text-sm text-muted-foreground">
                  {importResult.success} imported successfully
                  {importResult.failed > 0 && `, ${importResult.failed} failed`}
                </p>
                <Button className="mt-6" onClick={() => { reset(); onOpenChange(false); }}>
                  Done
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

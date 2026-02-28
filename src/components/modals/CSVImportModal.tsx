import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, X, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "map" | "preview" | "importing" | "done";

const TRADE_FIELDS = [
  { key: "symbol", label: "Symbol", required: true },
  { key: "segment", label: "Segment", required: true },
  { key: "trade_type", label: "Trade Type (BUY/SELL)", required: true },
  { key: "quantity", label: "Quantity", required: true },
  { key: "entry_price", label: "Entry Price", required: false },
  { key: "stop_loss", label: "Stop Loss", required: false },
  { key: "entry_time", label: "Entry Time", required: false },
  { key: "status", label: "Status", required: false },
  { key: "pnl", label: "P&L", required: false },
  { key: "current_price", label: "Exit/Current Price", required: false },
  { key: "notes", label: "Notes", required: false },
  { key: "timeframe", label: "Timeframe", required: false },
  { key: "holding_period", label: "Holding Period", required: false },
];

const SEGMENT_MAP: Record<string, string> = {
  intraday: "Equity_Intraday",
  equity_intraday: "Equity_Intraday",
  positional: "Equity_Positional",
  equity_positional: "Equity_Positional",
  futures: "Futures",
  options: "Options",
  commodities: "Commodities",
  mcx: "Commodities",
};

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow).filter((r) => r.some((c) => c));
  return { headers, rows };
}

function autoMapColumns(csvHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowerHeaders = csvHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, "_"));

  TRADE_FIELDS.forEach((field) => {
    const idx = lowerHeaders.findIndex((h) =>
      h === field.key ||
      h.includes(field.key) ||
      (field.key === "symbol" && (h.includes("ticker") || h.includes("scrip") || h.includes("stock"))) ||
      (field.key === "trade_type" && (h.includes("side") || h.includes("direction") || h.includes("buy_sell"))) ||
      (field.key === "quantity" && (h.includes("qty") || h.includes("lots") || h.includes("volume"))) ||
      (field.key === "entry_price" && (h.includes("price") || h.includes("avg_price") || h.includes("buy_price"))) ||
      (field.key === "current_price" && (h.includes("exit") || h.includes("sell_price") || h.includes("close_price"))) ||
      (field.key === "entry_time" && (h.includes("date") || h.includes("time") || h.includes("timestamp"))) ||
      (field.key === "stop_loss" && h.includes("sl")) ||
      (field.key === "pnl" && (h.includes("profit") || h.includes("loss") || h.includes("p_l")))
    );
    if (idx !== -1) {
      mapping[field.key] = csvHeaders[idx];
    }
  });
  return mapping;
}

export function CSVImportModal({ open, onOpenChange }: CSVImportModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][] }>({ headers: [], rows: [] });
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState({ success: 0, errors: 0, errorMessages: [] as string[] });

  const reset = () => {
    setStep("upload");
    setCsvData({ headers: [], rows: [] });
    setMapping({});
    setResults({ success: 0, errors: 0, errorMessages: [] });
  };

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.headers.length === 0) {
        toast.error("Could not parse CSV file");
        return;
      }
      setCsvData(parsed);
      setMapping(autoMapColumns(parsed.headers));
      setStep("map");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      handleFile(file);
    } else {
      toast.error("Please upload a CSV file");
    }
  }, [handleFile]);

  const requiredMapped = TRADE_FIELDS.filter((f) => f.required).every((f) => mapping[f.key]);

  const doImport = async () => {
    if (!user?.id) return;
    setStep("importing");
    setImporting(true);

    let success = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    for (let i = 0; i < csvData.rows.length; i++) {
      const row = csvData.rows[i];
      try {
        const getValue = (field: string) => {
          const csvCol = mapping[field];
          if (!csvCol) return undefined;
          const idx = csvData.headers.indexOf(csvCol);
          return idx >= 0 ? row[idx] : undefined;
        };

        const symbol = getValue("symbol");
        const rawSegment = (getValue("segment") || "").toLowerCase().replace(/[^a-z_]/g, "");
        const segment = SEGMENT_MAP[rawSegment] || "Equity_Intraday";
        const rawType = (getValue("trade_type") || "BUY").toUpperCase();
        const trade_type = rawType === "SELL" || rawType === "SHORT" || rawType === "S" ? "SELL" : "BUY";
        const quantity = parseInt(getValue("quantity") || "1") || 1;
        const entry_price = parseFloat(getValue("entry_price") || "0") || undefined;
        const stop_loss = parseFloat(getValue("stop_loss") || "0") || undefined;
        const pnl = parseFloat(getValue("pnl") || "0") || undefined;
        const current_price = parseFloat(getValue("current_price") || "0") || undefined;
        const notes = getValue("notes") || undefined;
        const timeframe = getValue("timeframe") || undefined;
        const holding_period = getValue("holding_period") || undefined;
        const rawStatus = (getValue("status") || "").toUpperCase();
        const status = ["PENDING", "OPEN", "CLOSED", "CANCELLED"].includes(rawStatus)
          ? rawStatus as "PENDING" | "OPEN" | "CLOSED" | "CANCELLED"
          : pnl ? "CLOSED" : "OPEN";

        let entry_time = getValue("entry_time");
        if (entry_time) {
          const parsed = new Date(entry_time);
          entry_time = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
        } else {
          entry_time = new Date().toISOString();
        }

        if (!symbol) {
          errorMessages.push(`Row ${i + 1}: Missing symbol`);
          errors++;
          continue;
        }

        const { error } = await supabase.from("trades").insert({
          user_id: user.id,
          symbol,
          segment: segment as any,
          trade_type: trade_type as any,
          quantity,
          entry_price,
          stop_loss,
          entry_time,
          status: status as any,
          pnl: pnl || 0,
          current_price,
          notes,
          timeframe,
          holding_period,
          closed_at: status === "CLOSED" ? entry_time : undefined,
        });

        if (error) {
          errorMessages.push(`Row ${i + 1}: ${error.message}`);
          errors++;
        } else {
          success++;
        }
      } catch (err) {
        errorMessages.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
        errors++;
      }
    }

    setResults({ success, errors, errorMessages });
    setImporting(false);
    setStep("done");
    queryClient.invalidateQueries({ queryKey: ["trades"] });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[hsl(var(--tb-accent))]" />
            Import Trades from CSV
          </DialogTitle>
        </DialogHeader>

        {/* Step: Upload */}
        {step === "upload" && (
          <div
            className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-[hsl(var(--tb-accent)/0.4)] transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">Drop your CSV file here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}

        {/* Step: Map columns */}
        {step === "map" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found <strong>{csvData.rows.length}</strong> rows. Map your CSV columns to trade fields:
            </p>
            <ScrollArea className="max-h-[350px]">
              <div className="space-y-2.5 pr-2">
                {TRADE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-40 flex-shrink-0">
                      <span className="text-sm">{field.label}</span>
                      {field.required && <span className="text-loss ml-1 text-xs">*</span>}
                    </div>
                    <Select
                      value={mapping[field.key] || "__none__"}
                      onValueChange={(v) =>
                        setMapping((prev) => {
                          const next = { ...prev };
                          if (v === "__none__") delete next[field.key];
                          else next[field.key] = v;
                          return next;
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="— Skip —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Skip —</SelectItem>
                        {csvData.headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>Back</Button>
              <Button
                size="sm"
                disabled={!requiredMapped}
                onClick={() => setStep("preview")}
                className="gap-1"
              >
                Preview <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ready to import <strong>{csvData.rows.length}</strong> trades. Here's a preview of the first 3:
            </p>
            <ScrollArea className="max-h-[250px]">
              <div className="space-y-2">
                {csvData.rows.slice(0, 3).map((row, i) => {
                  const symIdx = csvData.headers.indexOf(mapping.symbol || "");
                  const typeIdx = csvData.headers.indexOf(mapping.trade_type || "");
                  const qtyIdx = csvData.headers.indexOf(mapping.quantity || "");
                  return (
                    <div key={i} className="text-xs bg-muted rounded-lg p-3 flex gap-4">
                      <span className="font-mono font-bold">{symIdx >= 0 ? row[symIdx] : "?"}</span>
                      <span className={cn(
                        typeIdx >= 0 && row[typeIdx]?.toUpperCase().includes("SELL") ? "text-loss" : "text-profit"
                      )}>
                        {typeIdx >= 0 ? row[typeIdx] : "BUY"}
                      </span>
                      <span className="text-muted-foreground">Qty: {qtyIdx >= 0 ? row[qtyIdx] : "1"}</span>
                    </div>
                  );
                })}
                {csvData.rows.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ...and {csvData.rows.length - 3} more
                  </p>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("map")}>Back</Button>
              <Button size="sm" onClick={doImport} className="gap-1">
                Import {csvData.rows.length} Trades <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Importing */}
        {step === "importing" && (
          <div className="py-10 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-[hsl(var(--tb-accent))] mb-4" />
            <p className="text-sm font-medium">Importing trades...</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[hsl(var(--profit))] mb-3" />
              <p className="text-lg font-bold">{results.success} trades imported</p>
              {results.errors > 0 && (
                <p className="text-sm text-loss mt-1">{results.errors} errors</p>
              )}
            </div>
            {results.errorMessages.length > 0 && (
              <ScrollArea className="max-h-[150px]">
                <div className="space-y-1">
                  {results.errorMessages.slice(0, 10).map((msg, i) => (
                    <div key={i} className="text-xs text-loss flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      {msg}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <div className="flex justify-center">
              <Button size="sm" onClick={() => { reset(); onOpenChange(false); }}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Download, Upload, Database, Shield, Loader2, FileJson, FileSpreadsheet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { tradesToCSV, downloadCSV } from "@/lib/csv-export";
import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";

export default function DataBackupExport() {
  const { user } = useAuth();
  const { trades } = useTrades();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleFullBackup = async () => {
    if (!user?.id) return;
    setExporting("full");
    try {
      const { data, error } = await supabase.functions.invoke("export-data", {
        body: { format: "json" },
      });
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tradebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Full backup downloaded successfully");
    } catch (err) {
      toast.error("Backup failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setExporting(null);
    }
  };

  const handleTradesCSV = () => {
    setExporting("csv");
    try {
      const csv = tradesToCSV(trades);
      downloadCSV(csv, `trades-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success(`Exported ${trades.length} trades as CSV`);
    } catch {
      toast.error("CSV export failed");
    } finally {
      setExporting(null);
    }
  };

  const handleJournalExport = async () => {
    if (!user?.id) return;
    setExporting("journal");
    try {
      const { data, error } = await supabase
        .from("daily_journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false });
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-entries-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data?.length || 0} journal entries`);
    } catch (err) {
      toast.error("Journal export failed");
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      id: "full",
      icon: Database,
      title: "Full Data Backup",
      description: "All trades, journal entries, settings, alerts, studies, and tags in JSON format",
      action: handleFullBackup,
      badge: "Recommended",
      badgeColor: "bg-profit/10 text-profit border-profit/30",
    },
    {
      id: "csv",
      icon: FileSpreadsheet,
      title: "Trades CSV",
      description: `Export ${trades.length} trades as CSV file (compatible with Excel/Google Sheets)`,
      action: handleTradesCSV,
    },
    {
      id: "journal",
      icon: FileJson,
      title: "Journal Entries",
      description: "Export all daily journal entries as JSON",
      action: handleJournalExport,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">Data Backup & Export</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Download your data for safekeeping or migration. All exports include your personal data only.
      </p>

      <div className="space-y-2">
        {exportOptions.map((opt) => (
          <div key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
              <opt.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium">{opt.title}</p>
                {opt.badge && (
                  <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", opt.badgeColor)}>
                    {opt.badge}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 shrink-0"
              onClick={opt.action}
              disabled={!!exporting}
            >
              {exporting === opt.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              Export
            </Button>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-[10px] font-medium text-muted-foreground">Tip</p>
        </div>
        <p className="text-[10px] text-muted-foreground">
          We recommend taking a full backup at least once a month. Your data is also protected by our cloud infrastructure with automatic backups.
        </p>
      </div>
    </div>
  );
}

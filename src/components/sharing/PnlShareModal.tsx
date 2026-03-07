import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Copy, Share2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useShareCardData, type SharePeriod } from "@/hooks/useShareCardData";
import { ShareCard, TEMPLATE_OPTIONS, type TemplateId } from "./ShareCardTemplates";

const PERIODS: { value: SharePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "all_time", label: "All Time" },
];

interface PnlShareModalProps {
  trigger?: React.ReactNode;
  defaultPeriod?: SharePeriod;
}

export function PnlShareModal({ trigger, defaultPeriod = "today" }: PnlShareModalProps) {
  const [period, setPeriod] = useState<SharePeriod>(defaultPeriod);
  const [template, setTemplate] = useState<TemplateId>("dark");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const data = useShareCardData(period);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      width: 1080,
      height: 1080,
      pixelRatio: 1,
      cacheBust: true,
    });
  }, []);

  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `tradebook-${period}-pnl.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setIsExporting(false);
    }
  }, [generateImage, period]);

  const handleCopy = useCallback(async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed — try downloading instead");
    } finally {
      setIsExporting(false);
    }
  }, [generateImage]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share P&L Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period selector */}
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <Badge
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Badge>
            ))}
          </div>

          {/* Template selector */}
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_OPTIONS.map((t) => (
              <Badge
                key={t.id}
                variant={template === t.id ? "default" : "secondary"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setTemplate(t.id)}
              >
                {t.label}
              </Badge>
            ))}
          </div>

          {/* Preview — scaled down to fit */}
          <div className="rounded-xl border bg-muted/30 p-3 overflow-hidden">
            <div style={{ width: "100%", aspectRatio: "1/1", position: "relative" }}>
              <div
                ref={cardRef}
                style={{
                  width: 1080,
                  height: 1080,
                  transform: "scale(var(--preview-scale))",
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  // --preview-scale set via parent width
                }}
                className="[--preview-scale:calc(100cqw/1080)]"
              >
                <div style={{ containerType: "inline-size", width: "100%", height: "100%" }}>
                  <ShareCard template={template} data={data} />
                </div>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {data.totalTrades === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No closed trades found for this period. Try a different time range.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} disabled={isExporting || data.totalTrades === 0} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={isExporting || data.totalTrades === 0}
              className="flex-1"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

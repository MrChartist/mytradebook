import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { toPng } from "html-to-image";
import { Download, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Trade } from "@/hooks/useTrades";
import { useTradeTags } from "@/hooks/useTradeTags";
import { TradeShareCard, TRADE_TEMPLATE_OPTIONS, type TradeTemplateId } from "./TradeShareCardTemplates";

interface TradeShareModalProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeShareModal({ trade, open, onOpenChange }: TradeShareModalProps) {
  const [template, setTemplate] = useState<TradeTemplateId>("dark");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(0.5);
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { patterns, candlesticks, volumes } = useTradeTags(trade.id);
  const tags = useMemo(() => {
    const all: string[] = [];
    patterns.forEach((p) => all.push(p.name));
    candlesticks.forEach((c) => all.push(c.name));
    volumes.forEach((v) => all.push(v.name));
    if (trade.timeframe) all.push(trade.timeframe);
    return all;
  }, [patterns, candlesticks, volumes, trade.timeframe]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || 500;
      setScale(w / 1080);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, { width: 1080, height: 1080, pixelRatio: 1, cacheBust: true });
  }, []);

  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `tradebook-${trade.symbol}-trade.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setIsExporting(false);
    }
  }, [generateImage, trade.symbol]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Trade Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template selector */}
          <div className="flex flex-wrap gap-2">
            {TRADE_TEMPLATE_OPTIONS.map((t) => (
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

          {/* Preview */}
          <div ref={wrapperRef} className="rounded-xl border bg-muted/30 p-3 overflow-hidden">
            <div style={{ width: "100%", aspectRatio: "1/1", position: "relative", overflow: "hidden" }}>
              <div
                ref={cardRef}
                style={{
                  width: 1080, height: 1080,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  position: "absolute", top: 0, left: 0,
                }}
              >
                <TradeShareCard template={template} data={{ trade, tags }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} disabled={isExporting} className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Download PNG
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={isExporting} className="flex-1">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

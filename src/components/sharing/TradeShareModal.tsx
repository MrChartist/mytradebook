import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { toPng } from "html-to-image";
import { Download, Copy, Check, Upload, X, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Trade } from "@/hooks/useTrades";
import { useTradeTags } from "@/hooks/useTradeTags";
import { TradeShareCard, TRADE_TEMPLATE_OPTIONS, type TradeTemplateId } from "./TradeShareCardTemplates";
import { CARD_SIZE_OPTIONS, getCardSize, getCustomLogo, saveCustomLogo, clearCustomLogo, type CardSizeId } from "./shareCardUtils";

interface TradeShareModalProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeShareModal({ trade, open, onOpenChange }: TradeShareModalProps) {
  const [template, setTemplate] = useState<TradeTemplateId>("dark");
  const [cardSize, setCardSize] = useState<CardSizeId>("square");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [customLogo, setCustomLogo] = useState<string | null>(getCustomLogo());
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { patterns, candlesticks, volumes } = useTradeTags(trade.id);
  const tags = useMemo(() => {
    const all: string[] = [];
    patterns.forEach((p) => all.push(p.name));
    candlesticks.forEach((c) => all.push(c.name));
    volumes.forEach((v) => all.push(v.name));
    if (trade.timeframe) all.push(trade.timeframe);
    return all;
  }, [patterns, candlesticks, volumes, trade.timeframe]);

  const currentSize = getCardSize(cardSize);
  const aspectRatio = `${currentSize.width}/${currentSize.height}`;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || 500;
      setScale(w / currentSize.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [currentSize.width]);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      width: currentSize.width,
      height: currentSize.height,
      pixelRatio: 1,
      cacheBust: true,
    });
  }, [currentSize]);

  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `tradebook-${trade.symbol}-${cardSize}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setIsExporting(false);
    }
  }, [generateImage, trade.symbol, cardSize]);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      toast.error("Logo must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      saveCustomLogo(dataUrl);
      setCustomLogo(dataUrl);
      toast.success("Custom logo applied!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    clearCustomLogo();
    setCustomLogo(null);
    toast.success("Switched back to TradeBook branding");
  };

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

          {/* Size selector */}
          <div className="flex flex-wrap gap-2">
            {CARD_SIZE_OPTIONS.map((s) => (
              <Badge
                key={s.id}
                variant={cardSize === s.id ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setCardSize(s.id)}
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                {s.label}
                <span className="ml-1 text-xs opacity-60">{s.description}</span>
              </Badge>
            ))}
          </div>

          {/* Custom branding */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {customLogo ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/30">
                <img src={customLogo} alt="" className="h-6 w-auto rounded" />
                <span className="text-xs text-muted-foreground">Custom logo</span>
                <button onClick={handleRemoveLogo} className="ml-1 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Custom Logo
              </Button>
            )}
          </div>

          {/* Preview */}
          <div ref={wrapperRef} className="rounded-xl border bg-muted/30 p-3 overflow-hidden">
            <div style={{ width: "100%", aspectRatio, position: "relative", overflow: "hidden" }}>
              <div
                ref={cardRef}
                style={{
                  width: currentSize.width,
                  height: currentSize.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <TradeShareCard template={template} data={{ trade, tags, customLogo, cardSize }} />
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

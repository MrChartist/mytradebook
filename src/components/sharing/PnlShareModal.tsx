import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { toPng } from "html-to-image";
import { Download, Copy, Share2, Check, Upload, X, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useShareCardData, type SharePeriod } from "@/hooks/useShareCardData";
import { ShareCard, TEMPLATE_OPTIONS, type TemplateId } from "./ShareCardTemplates";
import { StreakShareCard } from "./StreakShareCard";
import {
  CARD_SIZE_OPTIONS, getCardSize, getCustomLogo, saveCustomLogo, clearCustomLogo,
  type CardSizeId,
} from "./shareCardUtils";

const PERIODS: { value: SharePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "all_time", label: "All Time" },
];

type CardMode = "pnl" | "streak";

interface PnlShareModalProps {
  trigger?: React.ReactNode;
  defaultPeriod?: SharePeriod;
}

export function PnlShareModal({ trigger, defaultPeriod = "today" }: PnlShareModalProps) {
  const [period, setPeriod] = useState<SharePeriod>(defaultPeriod);
  const [template, setTemplate] = useState<TemplateId>("dark");
  const [cardSize, setCardSize] = useState<CardSizeId>("square");
  const [cardMode, setCardMode] = useState<CardMode>("pnl");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [customLogo, setCustomLogo] = useState<string | null>(getCustomLogo());
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const data = useShareCardData(period);

  const currentSize = getCardSize(cardSize);
  const aspectRatio = `${currentSize.width}/${currentSize.height}`;

  const hasStreak = Math.abs(data.streak) >= 2;

  // Build streak trade list from the data
  const streakTrades = useMemo(() => {
    if (!hasStreak) return [];
    // We use bestTrade/worstTrade as examples — the actual streak trades
    // would need the full trade list, but we show what we have
    const trades: { symbol: string; pnl: number }[] = [];
    if (data.bestTrade) trades.push(data.bestTrade);
    if (data.worstTrade) trades.push(data.worstTrade);
    return trades;
  }, [data, hasStreak]);

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
      link.download = `tradebook-${period}-${cardMode}-${cardSize}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setIsExporting(false);
    }
  }, [generateImage, period, cardMode, cardSize]);

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
  };

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
          <DialogTitle>Share Performance Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card mode selector */}
          <div className="flex gap-2">
            <Badge
              variant={cardMode === "pnl" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm"
              onClick={() => setCardMode("pnl")}
            >
              📊 P&L Card
            </Badge>
            {hasStreak && (
              <Badge
                variant={cardMode === "streak" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setCardMode("streak")}
              >
                🔥 Streak Card ({Math.abs(data.streak)})
              </Badge>
            )}
          </div>

          {/* Period selector (only for P&L mode) */}
          {cardMode === "pnl" && (
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
          )}

          {/* Template selector (only for P&L mode) */}
          {cardMode === "pnl" && (
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
          )}

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
                {cardMode === "streak" ? (
                  <StreakShareCard data={{
                    streakCount: Math.abs(data.streak),
                    streakType: data.streak >= 0 ? "win" : "loss",
                    totalPnl: data.totalPnl,
                    trades: streakTrades,
                    customLogo,
                    cardSize,
                  }} />
                ) : (
                  <ShareCard template={template} data={data} />
                )}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {data.totalTrades === 0 && cardMode === "pnl" && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No closed trades found for this period. Try a different time range.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} disabled={isExporting || (cardMode === "pnl" && data.totalTrades === 0)} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={isExporting || (cardMode === "pnl" && data.totalTrades === 0)}
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

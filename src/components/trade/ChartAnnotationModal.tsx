import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MousePointer2, Minus, Circle, Type, Undo2, Download, 
  ArrowUpRight, Trash2 
} from "lucide-react";

type Tool = "select" | "arrow" | "line" | "circle" | "text";
type Annotation = {
  id: string;
  tool: Tool;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  text?: string;
};

interface ChartAnnotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (annotatedImageUrl: string) => void;
}

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#ffffff"];

export function ChartAnnotationModal({ open, onOpenChange, imageUrl, onSave }: ChartAnnotationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("arrow");
  const [color, setColor] = useState("#ef4444");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState<Partial<Annotation> | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    if (!open || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = imageUrl;
    return () => { setImgLoaded(false); };
  }, [open, imageUrl]);

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;
    if (!canvas || !ctx || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const allAnnotations = [...annotations];
    if (current && current.startX !== undefined) {
      allAnnotations.push(current as Annotation);
    }

    for (const a of allAnnotations) {
      ctx.strokeStyle = a.color;
      ctx.fillStyle = a.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      if (a.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(a.startX, a.startY);
        ctx.lineTo(a.endX, a.endY);
        ctx.stroke();
      } else if (a.tool === "arrow") {
        // Line
        ctx.beginPath();
        ctx.moveTo(a.startX, a.startY);
        ctx.lineTo(a.endX, a.endY);
        ctx.stroke();
        // Arrowhead
        const angle = Math.atan2(a.endY - a.startY, a.endX - a.startX);
        const headLen = 18;
        ctx.beginPath();
        ctx.moveTo(a.endX, a.endY);
        ctx.lineTo(a.endX - headLen * Math.cos(angle - Math.PI / 6), a.endY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(a.endX, a.endY);
        ctx.lineTo(a.endX - headLen * Math.cos(angle + Math.PI / 6), a.endY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (a.tool === "circle") {
        const rx = Math.abs(a.endX - a.startX);
        const ry = Math.abs(a.endY - a.startY);
        ctx.beginPath();
        ctx.ellipse((a.startX + a.endX) / 2, (a.startY + a.endY) / 2, rx / 2, ry / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (a.tool === "text" && a.text) {
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(a.text, a.startX, a.startY);
      }
    }
  }, [annotations, current]);

  useEffect(() => {
    if (imgLoaded) redraw();
  }, [imgLoaded, redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "select") return;
    if (tool === "text") {
      const { x, y } = getPos(e);
      const text = prompt("Enter annotation text:");
      if (text) {
        setAnnotations(prev => [...prev, { id: crypto.randomUUID(), tool: "text", color, startX: x, startY: y, endX: x, endY: y, text }]);
        redraw();
      }
      return;
    }
    const { x, y } = getPos(e);
    setDrawing(true);
    setCurrent({ id: crypto.randomUUID(), tool, color, startX: x, startY: y, endX: x, endY: y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !current) return;
    const { x, y } = getPos(e);
    setCurrent(prev => prev ? { ...prev, endX: x, endY: y } : null);
    redraw();
  };

  const handleMouseUp = () => {
    if (drawing && current) {
      setAnnotations(prev => [...prev, current as Annotation]);
      setCurrent(null);
      setDrawing(false);
      redraw();
    }
  };

  const undo = () => {
    setAnnotations(prev => prev.slice(0, -1));
    setTimeout(redraw, 0);
  };

  const clearAll = () => {
    setAnnotations([]);
    setTimeout(redraw, 0);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    redraw();
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onOpenChange(false);
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer2 className="w-4 h-4" />, label: "Select" },
    { id: "arrow", icon: <ArrowUpRight className="w-4 h-4" />, label: "Arrow" },
    { id: "line", icon: <Minus className="w-4 h-4" />, label: "Line" },
    { id: "circle", icon: <Circle className="w-4 h-4" />, label: "Circle" },
    { id: "text", icon: <Type className="w-4 h-4" />, label: "Text" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Annotate Chart</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={cn(
                  "p-2 rounded-md transition-all",
                  tool === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn("w-6 h-6 rounded-full border-2 transition-all", color === c ? "border-foreground scale-110" : "border-transparent")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          <Button variant="ghost" size="icon" onClick={undo} className="h-8 w-8" title="Undo" disabled={annotations.length === 0}>
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={clearAll} className="h-8 w-8" title="Clear all" disabled={annotations.length === 0}>
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          <Button size="sm" onClick={handleSave} className="h-8">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Save Annotated
          </Button>
        </div>

        {/* Canvas */}
        <div className="relative border rounded-lg overflow-hidden bg-black/5">
          <canvas
            ref={canvasRef}
            className="w-full h-auto cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Loading image...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

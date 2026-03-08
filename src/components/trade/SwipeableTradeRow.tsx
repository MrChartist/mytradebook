import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import { cn } from "@/lib/utils";
import { X, Eye, Share2 } from "lucide-react";

interface SwipeableTradeRowProps {
  children: ReactNode;
  onClose?: () => void;
  onView?: () => void;
  onShare?: () => void;
}

const THRESHOLD = 80;
const MAX_SWIPE = 160;

export function SwipeableTradeRow({ children, onClose, onView, onShare }: SwipeableTradeRowProps) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!swiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    // Only allow left swipe
    const clamped = Math.max(0, Math.min(diff, MAX_SWIPE));
    setOffset(clamped);
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (offset > THRESHOLD) {
      setOffset(MAX_SWIPE);
    } else {
      setOffset(0);
    }
  };

  const resetSwipe = () => setOffset(0);

  return (
    <div className="relative overflow-hidden rounded-[var(--radius)]">
      {/* Action buttons revealed behind */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-stretch"
        style={{ width: MAX_SWIPE }}
      >
        {onView && (
          <button
            onClick={() => { resetSwipe(); onView(); }}
            className="flex-1 flex items-center justify-center bg-primary/90 text-primary-foreground"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {onShare && (
          <button
            onClick={() => { resetSwipe(); onShare(); }}
            className="flex-1 flex items-center justify-center bg-muted text-foreground"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
        {onClose && (
          <button
            onClick={() => { resetSwipe(); onClose(); }}
            className="flex-1 flex items-center justify-center bg-loss text-loss-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main content that slides */}
      <div
        className={cn(
          "relative bg-card z-10",
          !swiping && "transition-transform duration-300 ease-out"
        )}
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

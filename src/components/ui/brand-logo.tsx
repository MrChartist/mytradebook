import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showByline?: boolean;
  className?: string;
}

export function BrandLogo({ size = "md", showByline = true, className }: BrandLogoProps) {
  const sizes = {
    sm: "text-[14px]",
    md: "text-[17px]",
    lg: "text-[22px]",
  };
  const bylineSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-[12px]",
  };

  return (
    <span className={cn("inline-flex flex-col leading-none select-none", className)}>
      <span className={cn("font-heading font-bold tracking-tight text-foreground", sizes[size])}>
        TradeBook
      </span>
      {showByline && (
        <span className={cn("font-sans font-medium tracking-wide text-muted-foreground/60 mt-px", bylineSizes[size])}>
          by Mr Chartist
        </span>
      )}
    </span>
  );
}

/** Compact inline version for navbars */
export function BrandLogoInline({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "text-[13px]",
    md: "text-[15px]",
    lg: "text-[18px]",
  };
  const bylineSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-[11px]",
  };

  return (
    <span className={cn("inline-flex items-baseline gap-1.5 select-none", className)}>
      <span className={cn("font-heading font-bold tracking-tight text-foreground", sizes[size])}>
        TradeBook
      </span>
      <span className={cn("font-sans font-medium text-muted-foreground/50", bylineSizes[size])}>
        by Mr Chartist
      </span>
    </span>
  );
}

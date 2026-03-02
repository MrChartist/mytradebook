import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function LazyImage({ className, alt, onLoad, onError, fallback, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <img
      {...props}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className={cn(
        "transition-opacity duration-500",
        loaded ? "opacity-100" : "opacity-0",
        error && "hidden",
        className,
      )}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setError(true);
        if (fallback) {
          (e.currentTarget as HTMLImageElement).src = fallback;
          setError(false);
        }
        onError?.(e);
      }}
    />
  );
}

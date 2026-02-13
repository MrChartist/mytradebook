import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  /** Array of numeric values to plot */
  data?: number[];
  /** Width in px */
  width?: number;
  /** Height in px */
  height?: number;
  /** Stroke color — defaults to muted-foreground */
  color?: string;
  /** Fill area under line */
  fill?: boolean;
  /** Horizontal marker lines (e.g. entry, SL, target levels) */
  markers?: { value: number; color: string; label?: string }[];
  /** Current price marker dot */
  currentValue?: number;
  className?: string;
}

export function Sparkline({
  data = [],
  width = 120,
  height = 40,
  color = "hsl(var(--muted-foreground))",
  fill = false,
  markers = [],
  currentValue,
  className,
}: SparklineProps) {
  const { path, fillPath, yScale, min, max, lastPoint } = useMemo(() => {
    if (data.length < 2) {
      return { path: "", fillPath: "", yScale: () => height / 2, min: 0, max: 0, lastPoint: { x: 0, y: height / 2 } };
    }

    const allValues = [...data, ...markers.map(m => m.value), ...(currentValue ? [currentValue] : [])];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;

    const padding = 2;
    const chartH = height - padding * 2;
    const chartW = width - padding * 2;

    const yScale = (val: number) => padding + chartH - ((val - min) / range) * chartH;
    const xScale = (i: number) => padding + (i / (data.length - 1)) * chartW;

    const points = data.map((v, i) => ({ x: xScale(i), y: yScale(v) }));
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const fillPath = `${path} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;
    const lastPoint = points[points.length - 1];

    return { path, fillPath, yScale, min, max, lastPoint };
  }, [data, width, height, markers, currentValue]);

  if (data.length < 2) {
    return (
      <div
        className={cn("flex items-center justify-center text-[9px] text-muted-foreground", className)}
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  // Determine line color based on trend
  const isUp = data[data.length - 1] >= data[0];
  const lineColor = color === "hsl(var(--muted-foreground))"
    ? isUp ? "hsl(var(--profit))" : "hsl(var(--loss))"
    : color;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
    >
      {/* Fill area */}
      {fill && (
        <path
          d={fillPath}
          fill={lineColor}
          opacity={0.08}
        />
      )}

      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Marker lines */}
      {markers.map((m, i) => {
        const y = yScale(m.value);
        return (
          <g key={i}>
            <line
              x1={2}
              y1={y}
              x2={width - 2}
              y2={y}
              stroke={m.color}
              strokeWidth={0.75}
              strokeDasharray="3 2"
              opacity={0.6}
            />
            {m.label && (
              <text
                x={width - 3}
                y={y - 2}
                fill={m.color}
                fontSize={7}
                textAnchor="end"
                opacity={0.8}
              >
                {m.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Current value dot */}
      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.5}
          fill={lineColor}
        />
      )}
    </svg>
  );
}

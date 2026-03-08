import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
      <div className="space-y-1">
        <h1 className="text-[22px] lg:text-[26px] font-bold tracking-tight text-foreground font-heading">{title}</h1>
        {subtitle && (
          <p className="text-[14px] text-muted-foreground/80 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{children}</div>}
    </div>
  );
}

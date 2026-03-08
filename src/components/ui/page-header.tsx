import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="space-y-0.5">
        <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-[15px] text-muted-foreground leading-relaxed">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>}
    </div>
  );
}

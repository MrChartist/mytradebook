import { useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  trades: "Trades",
  alerts: "Alerts",
  journal: "Journal",
  studies: "Studies",
  watchlist: "Watchlist",
  analytics: "Analytics",
  calendar: "Calendar",
  mistakes: "Mistakes",
  reports: "Reports",
  settings: "Settings",
  fundamentals: "Fundamentals",
  docs: "Docs & FAQs",
};

const PAGE_GROUPS: Record<string, { label: string; path: string }> = {
  analytics: { label: "Analytics", path: "/analytics" },
  calendar: { label: "Analytics", path: "/analytics" },
  mistakes: { label: "Analytics", path: "/mistakes" },
  reports: { label: "Analytics", path: "/analytics" },
  fundamentals: { label: "Analytics", path: "/analytics" },
};

export function PageBreadcrumbs() {
  const location = useLocation();
  const segment = location.pathname.split("/").filter(Boolean)[0];

  if (!segment || !PAGE_LABELS[segment]) return null;

  const group = PAGE_GROUPS[segment];
  const searchParams = new URLSearchParams(location.search);
  const settingsTab = segment === "settings" ? searchParams.get("tab") : null;

  return (
    <Breadcrumb className="mb-5">
      <BreadcrumbList className="text-[12px] gap-1.5">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1 text-muted-foreground/60 hover:text-primary transition-colors duration-200">
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-muted-foreground/30" />
        
        {group && segment !== group.path.slice(1) && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={group.path} className="text-muted-foreground hover:text-foreground transition-colors duration-200">{group.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30" />
          </>
        )}

        {settingsTab ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors duration-200">Settings</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="capitalize font-medium text-foreground">{settingsTab}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">{PAGE_LABELS[segment]}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

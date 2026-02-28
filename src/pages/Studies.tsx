import { useState, useMemo } from "react";
import {
  BookOpen, Plus, Search, Tag, Calendar, Edit, Trash2,
  TrendingUp, BarChart2, Newspaper, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useStudies, type StudyFilters } from "@/hooks/useStudies";
import { CreateStudyModal } from "@/components/modals/CreateStudyModal";
import { CreateTradeModal, type TradeModalPrefill } from "@/components/modals/CreateTradeModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { InsightCard, type InsightCardAction } from "@/components/ui/insight-card";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { SortSelect, type SortOption } from "@/components/ui/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
import type { Study } from "@/hooks/useStudies";

const categoryIcons: Record<string, any> = {
  Technical: TrendingUp, Fundamental: BarChart2, News: Newspaper,
  Sentiment: BarChart2, Other: BookOpen,
};

const statusColors: Record<string, string> = {
  Draft: "text-muted-foreground bg-muted",
  Active: "text-primary bg-primary/10",
  Triggered: "text-profit bg-profit/10",
  Invalidated: "text-loss bg-loss/10",
  Archived: "text-muted-foreground bg-accent",
};

const categoryColors: Record<string, string> = {
  Technical: "text-primary bg-primary/10",
  Fundamental: "text-profit bg-profit/10",
  News: "text-warning bg-warning/10",
  Sentiment: "text-blue-500 bg-blue-500/10",
  Other: "text-muted-foreground bg-muted",
};

const durationLabels: Record<string, string> = {
  lt_6m: "< 6M", "6m_2y": "6M–2Y", "2y_5y": "2–5Y", gt_5y: "> 5Y",
};

const sortOptions: SortOption[] = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "symbol", label: "Symbol A–Z" },
  { value: "status", label: "By Status" },
];

export default function Studies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradePrefill, setTradePrefill] = useState<TradeModalPrefill>({});

  const filters: StudyFilters = {
    ...(selectedCategory && { category: selectedCategory as StudyFilters["category"] }),
    ...(searchQuery && { symbol: searchQuery }),
  };

  const { studies, isLoading, deleteStudy, updateStudy } = useStudies(filters);

  const filteredStudies = useMemo(() => {
    let list = selectedStatus ? studies.filter(s => s.status === selectedStatus) : studies;

    // Sort
    switch (sortBy) {
      case "oldest":
        list = [...list].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "symbol":
        list = [...list].sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      case "status":
        list = [...list].sort((a, b) => (a.status || "Draft").localeCompare(b.status || "Draft"));
        break;
      default: // latest
        list = [...list].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return list;
  }, [studies, selectedStatus, sortBy]);

  const statusCounts = studies.reduce((acc: Record<string, number>, s) => {
    const st = s.status || "Draft";
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const handleDeleteClick = (study: Study) => {
    setStudyToDelete(study);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studyToDelete) {
      await deleteStudy.mutateAsync(studyToDelete.id);
      setDeleteModalOpen(false);
      setStudyToDelete(null);
    }
  };

  const handleStatusChange = async (study: Study, newStatus: string) => {
    await updateStudy.mutateAsync({ id: study.id, status: newStatus } as any);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-primary" />
            <div className="pl-4">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Studies</h1>
              <p className="text-sm text-muted-foreground">Track setups, patterns, and market analysis</p>
            </div>
          </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Study
        </Button>
      </div>

      {/* Status strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Badge
          variant={selectedStatus === null ? "default" : "outline"}
          className="cursor-pointer shrink-0 text-xs"
          onClick={() => setSelectedStatus(null)}
        >
          All ({studies.length})
        </Badge>
        {Object.entries(statusColors).map(([key, color]) => {
          const count = statusCounts[key] || 0;
          if (count === 0 && key !== "Draft" && key !== "Active") return null;
          return (
            <Badge
              key={key}
              variant={selectedStatus === key ? "default" : "outline"}
              className={cn("cursor-pointer shrink-0 text-xs", selectedStatus === key && color)}
              onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
            >
              {key} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Filters + View Toggle + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 items-center">
          {["Technical", "Fundamental", "News"].map((cat) => (
            <Button
              key={cat}
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cn(
                "border-border text-xs h-8",
                selectedCategory === cat && "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              {cat}
            </Button>
          ))}
          <SortSelect value={sortBy} onValueChange={setSortBy} options={sortOptions} />
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Studies Grid/List */}
      {isLoading ? (
        <div className={cn(
          viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"
        )}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} className={viewMode === "grid" ? "h-52" : "h-16"} />)}
        </div>
      ) : filteredStudies.length > 0 ? (
        <div className={cn(
          viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"
        )}>
          {filteredStudies.map((study) => {
            const tags = study.tags || [];
            const studyStatus = study.status || "Draft";
            const duration = study.pattern_duration;

            const menuActions: InsightCardAction[] = [
              { label: "Edit", icon: Edit, onClick: () => {} },
              ...Object.keys(statusColors)
                .filter(k => k !== studyStatus)
                .map(k => ({ label: `Mark as ${k}`, onClick: () => handleStatusChange(study, k) })),
              { label: "Delete", icon: Trash2, onClick: () => handleDeleteClick(study), variant: "destructive" as const },
            ];

            return (
              <InsightCard
                key={study.id}
                symbol={study.symbol}
                typeLabel={study.category || "Other"}
                typeColor={categoryColors[study.category || "Other"]}
                status={studyStatus}
                statusColor={statusColors[studyStatus]}
                subtitle={study.title}
                notes={study.notes || undefined}
                tags={[
                  ...(duration && durationLabels[duration] ? [durationLabels[duration]] : []),
                  ...tags.slice(0, 3),
                ]}
                timestamp={study.analysis_date
                  ? new Date(study.analysis_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                  : undefined}
                onView={() => {}}
                onCreateAlert={() => {}}
                onCreateTrade={() => {
                  setTradePrefill({
                    symbol: study.symbol,
                    notes: `**From Study:** ${study.title}\n${study.notes || ""}`,
                    study_id: study.id,
                  });
                  setTradeModalOpen(true);
                }}
                menuActions={menuActions}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No studies found"
          description={searchQuery
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Studies help you track setups, patterns, and analysis before taking a trade."}
          createLabel="Create Study"
          onCreate={() => setCreateModalOpen(true)}
        />
      )}

      <CreateStudyModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <CreateTradeModal
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        prefill={tradePrefill}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteStudy.isPending}
        title="Delete Study"
        description={`Are you sure you want to delete "${studyToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

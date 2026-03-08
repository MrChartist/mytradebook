import { useState, useMemo } from "react";
import {
  BookOpen, Plus, Search, Tag, Calendar, Edit, Trash2,
  TrendingUp, BarChart2, Newspaper, Bell, ChevronDown, X, Filter,
} from "lucide-react";
import { useLivePrices, type InstrumentInput } from "@/hooks/useLivePrices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useStudies, type StudyFilters } from "@/hooks/useStudies";
import { CreateStudyModal } from "@/components/modals/CreateStudyModal";
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

// Tag groups for filtering (same as CreateStudyModal)
const tagGroups = [
  {
    label: "Classic Patterns",
    color: "text-primary bg-primary/10",
    tags: [
      "Double Top", "Double Bottom", "Head & Shoulders", "Inv H&S",
      "Cup & Handle", "Asc Triangle", "Desc Triangle", "Symm Triangle",
      "Flag", "Pennant", "Channel", "Wedge", "Rounding Bottom", "Rectangle",
    ],
  },
  {
    label: "Candlestick",
    color: "text-orange-500 bg-orange-500/10",
    tags: [
      "Engulfing", "Pin Bar", "Hammer", "Shooting Star", "Doji",
      "Inside Bar", "Morning Star", "Evening Star", "Harami", "Marubozu",
    ],
  },
  {
    label: "Setup",
    color: "text-profit bg-profit/10",
    tags: [
      "Breakout", "Breakdown", "Retest", "Range", "ATH", "ATL",
      "Gap", "Volume Spike", "Base Formation", "Distribution", "Accumulation",
    ],
  },
];

export default function Studies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);

  const filters: StudyFilters = {
    ...(selectedCategory && { category: selectedCategory as StudyFilters["category"] }),
    ...(searchQuery && { symbol: searchQuery }),
  };

  const { studies, isLoading, deleteStudy, updateStudy } = useStudies(filters);

  // Live prices for active/draft studies
  const priceInstruments = useMemo<InstrumentInput[]>(() => {
    const seen = new Set<string>();
    return studies
      .filter(s => s.status === "Draft" || s.status === "Active")
      .reduce<InstrumentInput[]>((acc, s) => {
        if (!seen.has(s.symbol)) {
          seen.add(s.symbol);
          acc.push({ symbol: s.symbol });
        }
        return acc;
      }, []);
  }, [studies]);

  const { prices } = useLivePrices(priceInstruments);

  // Compute tag counts from all studies (before status/tag filtering)
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    studies.forEach((s) => {
      s.tags?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [studies]);

  // Collect any custom tags not in preset groups
  const customTags = useMemo(() => {
    const presetSet = new Set(tagGroups.flatMap((g) => g.tags));
    return Object.keys(tagCounts).filter((t) => !presetSet.has(t)).sort();
  }, [tagCounts]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredStudies = useMemo(() => {
    let list = selectedStatus ? studies.filter(s => s.status === selectedStatus) : studies;

    // Tag filtering (OR logic)
    if (selectedTags.length > 0) {
      list = list.filter(s => s.tags?.some(t => selectedTags.includes(t)));
    }

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
  }, [studies, selectedStatus, selectedTags, sortBy]);

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
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">Studies</h1>
          <p className="text-[13px] text-muted-foreground/70 leading-relaxed">Track setups, patterns, and market analysis</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="rounded-xl px-5 shimmer-cta">
          <Plus className="w-4 h-4 mr-2" />
          New Study
        </Button>
      </div>

      {/* Status strip */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
        <button
          className={cn(
            "px-3 py-1 text-[11px] font-medium rounded-md border transition-all duration-200 shrink-0",
            selectedStatus === null
              ? "border-primary/15 bg-primary/6 text-primary"
              : "border-border/15 text-muted-foreground/50 hover:text-foreground hover:border-border/30"
          )}
          onClick={() => setSelectedStatus(null)}
        >
          All ({studies.length})
        </button>
        {Object.entries(statusColors).map(([key, color]) => {
          const count = statusCounts[key] || 0;
          if (count === 0 && key !== "Draft" && key !== "Active") return null;
          return (
            <button
              key={key}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-md border transition-all duration-200 shrink-0",
                selectedStatus === key
                  ? "border-primary/15 bg-primary/6 text-primary"
                  : "border-border/15 text-muted-foreground/50 hover:text-foreground hover:border-border/30"
              )}
              onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
            >
              {key} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters + View Toggle + Sort */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Search studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-[13px] bg-muted/20 border-border/20 focus:border-primary/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          {["Technical", "Fundamental", "News"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-md border transition-all duration-200",
                selectedCategory === cat
                  ? "border-primary/15 bg-primary/6 text-primary"
                  : "border-border/15 text-muted-foreground/50 hover:text-foreground hover:border-border/30"
              )}
            >
              {cat}
            </button>
          ))}
          <div className="w-px h-4 bg-border/20" />
          <SortSelect value={sortBy} onValueChange={setSortBy} options={sortOptions} />
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Tag Filter Section */}
      <Collapsible open={tagFilterOpen} onOpenChange={setTagFilterOpen}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <button className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-md border transition-all duration-200",
              selectedTags.length > 0
                ? "border-primary/15 bg-primary/6 text-primary"
                : "border-border/15 text-muted-foreground/50 hover:text-foreground hover:border-border/30"
            )}>
              <Filter className="w-3 h-3" />
              Filter by Tags
              {selectedTags.length > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold">
                  {selectedTags.length}
                </span>
              )}
              <ChevronDown className={cn("w-3 h-3 transition-transform", tagFilterOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          {selectedTags.length > 0 && (
            <button
              className="text-[10px] text-muted-foreground/50 hover:text-foreground underline underline-offset-2"
              onClick={() => setSelectedTags([])}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Selected tags display */}
        {selectedTags.length > 0 && !tagFilterOpen && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-primary/8 text-primary font-medium cursor-pointer hover:bg-primary/12 transition-colors inline-flex items-center gap-1"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="w-2.5 h-2.5" />
              </span>
            ))}
          </div>
        )}

        <CollapsibleContent className="mt-2.5 space-y-2.5 rounded-xl border border-border/20 bg-card/50 p-3">
          {tagGroups.map((group) => {
            const tagsWithCount = group.tags.filter((t) => tagCounts[t]);
            if (tagsWithCount.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-1.5">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1">
                  {tagsWithCount.map((tag) => (
                    <button
                      key={tag}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md border transition-all duration-200 font-medium",
                        selectedTags.includes(tag)
                          ? "border-primary/20 bg-primary/8 text-primary"
                          : "border-border/15 text-muted-foreground/60 hover:text-foreground hover:border-border/30"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      <span className="ml-1 opacity-50">({tagCounts[tag]})</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Custom / user tags */}
          {customTags.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-1.5">
                Custom
              </p>
              <div className="flex flex-wrap gap-1">
                {customTags.map((tag) => (
                  <button
                    key={tag}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md border transition-all duration-200 font-medium",
                      selectedTags.includes(tag)
                        ? "border-primary/20 bg-primary/8 text-primary"
                        : "border-border/15 text-muted-foreground/60 hover:text-foreground hover:border-border/30"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    <span className="ml-1 opacity-50">({tagCounts[tag]})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {Object.keys(tagCounts).length === 0 && (
            <p className="text-[11px] text-muted-foreground/40 text-center py-3">
              No tags found. Add tags when creating studies to enable filtering.
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Studies Grid/List */}
      {isLoading ? (
        <div className={cn(
          viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5" : "space-y-2"
        )}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} className={cn("shimmer-skeleton", viewMode === "grid" ? "h-52 rounded-[1.25rem]" : "h-16 rounded-xl")} />)}
        </div>
      ) : filteredStudies.length > 0 ? (
        <div className={cn(
          viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5" : "space-y-2"
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
                ltp={prices[study.symbol]?.ltp}
                dayChangePercent={prices[study.symbol]?.changePercent}
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
                onCreateTrade={() => {}}
                menuActions={menuActions}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No studies yet"
          description={searchQuery || selectedTags.length > 0
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Studies help you track setups, patterns, and analysis before placing a trade."}
          createLabel="Create Your First Study"
          onCreate={() => setCreateModalOpen(true)}
          steps={["Identify a setup", "Document your thesis", "Link to a trade later"]}
          hint="Tag studies with patterns to track what setups work best"
        />
      )}

      <CreateStudyModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
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

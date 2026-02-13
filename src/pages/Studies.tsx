import { useState } from "react";
import {
  BookOpen, Plus, Search, Filter, Tag, Calendar, ChevronRight,
  MoreHorizontal, TrendingUp, BarChart2, Newspaper, Trash2, Edit,
  Loader2, Target, AlertTriangle, Archive, CheckCircle, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useStudies, type StudyFilters } from "@/hooks/useStudies";
import { CreateStudyModal } from "@/components/modals/CreateStudyModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import type { Study } from "@/hooks/useStudies";

const categoryIcons: Record<string, any> = {
  Technical: TrendingUp, Fundamental: BarChart2, News: Newspaper,
  Sentiment: BarChart2, Other: BookOpen,
};

const categoryColors: Record<string, string> = {
  Technical: "text-primary bg-primary/10 border-primary/20",
  Fundamental: "text-profit bg-profit/10 border-profit/20",
  News: "text-warning bg-warning/10 border-warning/20",
  Sentiment: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Other: "text-muted-foreground bg-muted/10 border-muted/20",
};

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Draft: { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
  Active: { icon: Target, color: "text-primary", bg: "bg-primary/10" },
  Triggered: { icon: CheckCircle, color: "text-profit", bg: "bg-profit/10" },
  Invalidated: { icon: AlertTriangle, color: "text-loss", bg: "bg-loss/10" },
  Archived: { icon: Archive, color: "text-muted-foreground", bg: "bg-accent" },
};

const durationLabels: Record<string, string> = {
  lt_6m: "< 6M", "6m_2y": "6M–2Y", "2y_5y": "2–5Y", gt_5y: "> 5Y",
};

export default function Studies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);

  const filters: StudyFilters = {
    ...(selectedCategory && { category: selectedCategory as StudyFilters["category"] }),
    ...(searchQuery && { symbol: searchQuery }),
  };

  const { studies, isLoading, deleteStudy, updateStudy } = useStudies(filters);

  // Filter by status client-side
  const filteredStudies = selectedStatus
    ? studies.filter((s: any) => s.status === selectedStatus)
    : studies;

  // Stats
  const statusCounts = studies.reduce((acc: Record<string, number>, s: any) => {
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Studies</h1>
          <p className="text-muted-foreground">Track setups, patterns, and market analysis</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Study
        </Button>
      </div>

      {/* Status strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Badge
          variant={selectedStatus === null ? "default" : "outline"}
          className="cursor-pointer shrink-0"
          onClick={() => setSelectedStatus(null)}
        >
          All ({studies.length})
        </Badge>
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = statusCounts[key] || 0;
          if (count === 0 && key !== "Draft" && key !== "Active") return null;
          const StatusIcon = config.icon;
          return (
            <Badge
              key={key}
              variant={selectedStatus === key ? "default" : "outline"}
              className={cn("cursor-pointer shrink-0 gap-1", selectedStatus === key && config.bg)}
              onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
            >
              <StatusIcon className="w-3 h-3" />
              {key} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search studies by title, symbol, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          {["Technical", "Fundamental", "News"].map((cat) => (
            <Button
              key={cat}
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cn(
                "border-border",
                selectedCategory === cat && "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Studies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
        </div>
      ) : filteredStudies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStudies.map((study: any) => {
            const CategoryIcon = categoryIcons[study.category || "Other"] || BookOpen;
            const tags = study.tags || [];
            const studyStatus = study.status || "Draft";
            const statusCfg = statusConfig[studyStatus] || statusConfig.Draft;
            const StatusIcon = statusCfg.icon;
            const duration = study.pattern_duration;

            return (
              <div key={study.id} className="surface-card-hover p-5 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border",
                      categoryColors[study.category || "Other"]
                    )}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {study.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{study.symbol}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {study.analysis_date
                            ? new Date(study.analysis_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                      {Object.entries(statusConfig).map(([key]) => (
                        key !== studyStatus && (
                          <DropdownMenuItem key={key} onClick={(e) => { e.stopPropagation(); handleStatusChange(study, key); }}>
                            Mark as {key}
                          </DropdownMenuItem>
                        )
                      ))}
                      <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteClick(study); }}>
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status + Duration badges */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={cn("text-[10px] gap-1", statusCfg.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {studyStatus}
                  </Badge>
                  {duration && durationLabels[duration] && (
                    <Badge variant="outline" className="text-[10px]">
                      {durationLabels[duration]}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {study.category || "Other"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {study.notes || "No notes added."}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent text-[10px] text-muted-foreground">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {tags.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{tags.length - 4}</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="surface-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No studies found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search or filters" : "Start by creating your first study"}
          </p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Study
          </Button>
        </div>
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

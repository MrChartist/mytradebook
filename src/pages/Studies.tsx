import { useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Tag,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  BarChart2,
  Newspaper,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useStudies, type StudyFilters } from "@/hooks/useStudies";
import { CreateStudyModal } from "@/components/modals/CreateStudyModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import type { Study } from "@/hooks/useStudies";

const categoryIcons = {
  Technical: TrendingUp,
  Fundamental: BarChart2,
  News: Newspaper,
  Sentiment: BarChart2,
  Other: BookOpen,
};

const categoryColors: Record<string, string> = {
  Technical: "text-primary bg-primary/10 border-primary/20",
  Fundamental: "text-profit bg-profit/10 border-profit/20",
  News: "text-warning bg-warning/10 border-warning/20",
  Sentiment: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Other: "text-muted-foreground bg-muted/10 border-muted/20",
};

export default function Studies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);

  const filters: StudyFilters = {
    ...(selectedCategory && { category: selectedCategory as StudyFilters["category"] }),
    ...(searchQuery && { symbol: searchQuery }),
  };

  const { studies, isLoading, deleteStudy } = useStudies(filters);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Studies</h1>
          <p className="text-muted-foreground">
            Log and track your market analyses
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Study
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search studies by title or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          {["Technical", "Fundamental", "News"].map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category ? null : category
                )
              }
              className={cn(
                "border-border",
                selectedCategory === category &&
                  "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              {category}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="border-border">
            <Filter className="w-4 h-4 mr-1" />
            More
          </Button>
        </div>
      </div>

      {/* Studies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : studies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {studies.map((study) => {
            const CategoryIcon = categoryIcons[study.category || "Other"] || BookOpen;
            const tags = study.tags || [];
            return (
              <div
                key={study.id}
                className="glass-card-hover p-5 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                        categoryColors[study.category || "Other"]
                      )}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {study.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">{study.symbol}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {study.analysis_date
                            ? new Date(study.analysis_date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })
                            : "No date"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(study);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {study.notes || "No notes added."}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-xs text-muted-foreground"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No studies found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Start by creating your first study"}
          </p>
          <Button 
            className="bg-gradient-primary"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Study
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateStudyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
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

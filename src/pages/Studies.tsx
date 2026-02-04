import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Study {
  id: string;
  title: string;
  symbol: string;
  category: "Technical" | "Fundamental" | "News" | "Other";
  notes: string;
  createdAt: string;
  tags: string[];
}

const studies: Study[] = [
  {
    id: "1",
    title: "RELIANCE Cup & Handle Pattern",
    symbol: "RELIANCE",
    category: "Technical",
    notes:
      "Strong cup and handle formation on daily chart. Breakout above 2520 could target 2700.",
    createdAt: "2025-02-03",
    tags: ["cup-handle", "breakout", "daily"],
  },
  {
    id: "2",
    title: "NIFTY Weekly Trend Analysis",
    symbol: "NIFTY 50",
    category: "Technical",
    notes:
      "Weekly uptrend intact. Support at 21800, resistance at 22500. RSI shows bullish divergence.",
    createdAt: "2025-02-02",
    tags: ["trend", "weekly", "RSI"],
  },
  {
    id: "3",
    title: "TCS Q3 Earnings Impact",
    symbol: "TCS",
    category: "Fundamental",
    notes:
      "Strong Q3 results. Revenue up 6% YoY. Guidance positive for IT sector.",
    createdAt: "2025-02-01",
    tags: ["earnings", "IT-sector", "Q3"],
  },
  {
    id: "4",
    title: "RBI Policy Impact on Banking",
    symbol: "BANKNIFTY",
    category: "News",
    notes:
      "RBI kept rates unchanged. Banking sector expected to benefit from stable rates.",
    createdAt: "2025-01-30",
    tags: ["RBI", "policy", "banking"],
  },
];

const categoryIcons = {
  Technical: TrendingUp,
  Fundamental: BarChart2,
  News: Newspaper,
  Other: BookOpen,
};

const categoryColors = {
  Technical: "text-primary bg-primary/10 border-primary/20",
  Fundamental: "text-profit bg-profit/10 border-profit/20",
  News: "text-warning bg-warning/10 border-warning/20",
  Other: "text-muted-foreground bg-muted/10 border-muted/20",
};

export default function Studies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredStudies = studies.filter((study) => {
    const matchesSearch =
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || study.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredStudies.map((study) => {
          const CategoryIcon = categoryIcons[study.category];
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
                      categoryColors[study.category]
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
                        {new Date(study.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {study.notes}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {study.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-xs text-muted-foreground"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                  {study.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{study.tags.length - 3}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudies.length === 0 && (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No studies found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Start by creating your first study"}
          </p>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Study
          </Button>
        </div>
      )}
    </div>
  );
}

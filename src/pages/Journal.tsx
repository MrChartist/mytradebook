import { useState } from "react";
import { Calendar, AlertTriangle, Download, LayoutDashboard, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

import { useJournalAnalytics, useTradesWithMistakes, type JournalFilters } from "@/hooks/useJournalAnalytics";
import { JournalSummaryCards } from "@/components/journal/JournalSummaryCards";
import { JournalEquityCurve } from "@/components/journal/JournalEquityCurve";
import { JournalPerformanceTables } from "@/components/journal/JournalPerformanceTables";
import { JournalPatternsAndMistakes } from "@/components/journal/JournalPatternsAndMistakes";
import { JournalCalendarView } from "@/components/journal/JournalCalendarView";
import { JournalKanbanBoard } from "@/components/journal/JournalKanbanBoard";
import { TradeDetailModal } from "@/components/modals/TradeDetailModal";
import type { Trade } from "@/hooks/useTrades";

const segmentOptions = [
  { value: "ALL", label: "All Segments" },
  { value: "Equity_Intraday", label: "Equity Intraday" },
  { value: "Equity_Positional", label: "Equity Positional" },
  { value: "Futures", label: "Futures" },
  { value: "Options", label: "Options" },
  { value: "Commodities", label: "Commodities" },
];

const dateRangeOptions = [
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

export default function Journal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [segment, setSegment] = useState("ALL");
  const [dateRange, setDateRange] = useState("30");
  const [customFromDate, setCustomFromDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [customToDate, setCustomToDate] = useState<Date | undefined>(new Date());
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Calculate date filters
  const getDateFilters = (): JournalFilters => {
    const toDate = new Date();
    let fromDate: Date;

    if (dateRange === "custom" && customFromDate) {
      fromDate = customFromDate;
    } else {
      const days = parseInt(dateRange) || 30;
      fromDate = subDays(toDate, days);
    }

    return {
      fromDate,
      toDate: dateRange === "custom" && customToDate ? customToDate : toDate,
      segment,
    };
  };

  const filters = getDateFilters();
  const analytics = useJournalAnalytics(filters);
  const { data: tradesWithMistakes = [], isLoading: mistakesLoading } = useTradesWithMistakes();

  const handleTradeClick = (trade: any) => {
    setSelectedTrade(trade as Trade);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Trade Journal</h1>
          <p className="text-muted-foreground">
            Analyze your trading performance and patterns
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Segment Filter */}
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="w-[160px] border-border">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              {segmentOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] border-border">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Pickers */}
          {dateRange === "custom" && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {customFromDate ? format(customFromDate, "dd MMM") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={customFromDate}
                    onSelect={setCustomFromDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {customToDate ? format(customToDate, "dd MMM") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={customToDate}
                    onSelect={setCustomToDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </>
          )}

          {/* Export */}
          <Button variant="outline" className="border-border">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="mistakes" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Mistakes Review
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <JournalSummaryCards
            totalPnl={analytics.totalPnl}
            winRate={analytics.winRate}
            totalTrades={analytics.totalTrades}
            avgHoldingTimeMinutes={analytics.avgHoldingTimeMinutes}
            bestPattern={analytics.bestPattern}
            topMistake={analytics.topMistake}
            isLoading={analytics.isLoading}
          />

          {/* Equity Curve */}
          <JournalEquityCurve
            data={analytics.equityCurve}
            isLoading={analytics.isLoading}
          />

          {/* Performance by Rating & Confidence */}
          <JournalPerformanceTables
            performanceByRating={analytics.performanceByRating}
            performanceByConfidence={analytics.performanceByConfidence}
            isLoading={analytics.isLoading}
          />

          {/* Patterns & Mistakes */}
          <JournalPatternsAndMistakes
            patternPerformance={analytics.patternPerformance}
            mistakeImpact={analytics.mistakeImpact}
            isLoading={analytics.isLoading}
          />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <JournalCalendarView
            calendarData={analytics.calendarData}
            isLoading={analytics.isLoading}
            onTradeClick={handleTradeClick}
          />
        </TabsContent>

        {/* Mistakes Review Tab (Kanban) */}
        <TabsContent value="mistakes" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Mistakes Review Board</h3>
            <p className="text-sm text-muted-foreground">
              Review trades with mistakes, grouped by severity level
            </p>
          </div>
          <JournalKanbanBoard
            tradesWithMistakes={tradesWithMistakes}
            isLoading={mistakesLoading}
            onTradeClick={handleTradeClick}
          />
        </TabsContent>
      </Tabs>

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
    </div>
  );
}

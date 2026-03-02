import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChartLinkInput } from "@/components/ui/chart-link-input";
import { createStudySchema, type CreateStudyInput, studyCategories } from "@/lib/schemas";
import { useStudies } from "@/hooks/useStudies";
import { InstrumentPicker, type SelectedInstrument } from "@/components/trade/InstrumentPicker";
import {
  Loader2, ChevronDown, X, Sparkles, Link as LinkIcon,
  Plus, FileText, Target, Shield, ListChecks, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateStudyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// System pattern duration categories
const systemDurations = [
  { value: "lt_6m", label: "< 6 months" },
  { value: "6m_2y", label: "6 months – 2 years" },
  { value: "2y_5y", label: "2 – 5 years" },
  { value: "gt_5y", label: "> 5 years" },
];

// Study status options
const studyStatuses = [
  { value: "Draft", label: "Draft", color: "bg-muted text-muted-foreground" },
  { value: "Active", label: "Active", color: "bg-primary/10 text-primary" },
  { value: "Triggered", label: "Triggered", color: "bg-profit/10 text-profit" },
  { value: "Invalidated", label: "Invalidated", color: "bg-loss/10 text-loss" },
  { value: "Archived", label: "Archived", color: "bg-accent text-muted-foreground" },
];

// Preset tag groups
const patternTags = [
  "Double Top", "Double Bottom", "Head & Shoulders", "Inv H&S",
  "Cup & Handle", "Asc Triangle", "Desc Triangle", "Symm Triangle",
  "Flag", "Pennant", "Channel", "Wedge", "Rounding Bottom", "Rectangle",
];

const candlestickTags = [
  "Engulfing", "Pin Bar", "Hammer", "Shooting Star", "Doji",
  "Inside Bar", "Morning Star", "Evening Star", "Harami", "Marubozu",
];

const setupTags = [
  "Breakout", "Breakdown", "Retest", "Range", "ATH", "ATL",
  "Gap", "Volume Spike", "Base Formation", "Distribution", "Accumulation",
];

// Notes template snippets
const noteTemplates = [
  { icon: Target, label: "Entry/SL/Targets", text: "## Trade Plan\n- **Entry:** \n- **SL:** \n- **T1:** \n- **T2:** \n- **T3:** \n" },
  { icon: Shield, label: "Trigger/Invalidation", text: "## Trigger\n- \n\n## Invalidation\n- \n" },
  { icon: ListChecks, label: "Checklist", text: "## Checklist\n- [ ] Trigger confirmed\n- [ ] Volume confirmation\n- [ ] Risk:Reward > 2\n- [ ] Position sized\n" },
  { icon: MessageSquare, label: "Summary", text: "## Summary\n" },
];

export function CreateStudyModal({ open, onOpenChange }: CreateStudyModalProps) {
  const { createStudy } = useStudies();
  
  const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [chartLink, setChartLink] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [status, setStatus] = useState("Draft");
  const [patternDuration, setPatternDuration] = useState<string>("");
  const [patternStartDate, setPatternStartDate] = useState("");
  const [patternEndDate, setPatternEndDate] = useState("");

  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors },
  } = useForm<CreateStudyInput>({
    resolver: zodResolver(createStudySchema),
    defaultValues: { category: "Technical" },
  });

  const category = watch("category");
  const currentNotes = watch("notes") || "";

  // Auto-detect pattern duration from dates
  const suggestedDuration = useMemo(() => {
    if (!patternStartDate || !patternEndDate) return null;
    const start = new Date(patternStartDate);
    const end = new Date(patternEndDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months < 6) return "lt_6m";
    if (months < 24) return "6m_2y";
    if (months < 60) return "2y_5y";
    return "gt_5y";
  }, [patternStartDate, patternEndDate]);

  const handleInstrumentSelect = useCallback((instrument: SelectedInstrument) => {
    setSelectedInstrument(instrument);
    setValue("symbol", instrument.symbol, { shouldValidate: true });
    // Auto-fill title
    const currentTitle = watch("title");
    if (!currentTitle || currentTitle.trim() === "") {
      setValue("title", `${instrument.symbol} — Setup (Draft)`, { shouldValidate: true });
    }
  }, [setValue, watch]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addLink = () => {
    const trimmed = linkInput.trim();
    if (trimmed && (trimmed.startsWith("http://") || trimmed.startsWith("https://"))) {
      setLinks(prev => [...prev, trimmed]);
      setLinkInput("");
    } else if (trimmed) {
      toast.error("Please enter a valid URL starting with http:// or https://");
    }
  };

  const insertTemplate = (text: string) => {
    const newNotes = currentNotes ? `${currentNotes}\n\n${text}` : text;
    setValue("notes", newNotes);
  };

  const onSubmit = async (data: CreateStudyInput) => {
    const symbolToUse = selectedInstrument?.symbol || data.symbol;
    if (!symbolToUse || symbolToUse.trim() === "") {
      toast.error("Please select an instrument or enter a symbol");
      return;
    }

    try {
      await createStudy.mutateAsync({
        title: data.title,
        symbol: symbolToUse,
        category: data.category,
        notes: data.notes,
        tags: selectedTags,
        analysis_date: new Date().toISOString().split("T")[0],
        attachments: attachments,
        // These are extra fields we pass — the hook/DB will handle them
        status,
        pattern_duration: patternDuration || null,
        pattern_start_date: patternStartDate || null,
        pattern_end_date: patternEndDate || null,
        links: [
          ...(chartLink.trim() ? [chartLink.trim()] : []),
          ...links,
        ],
      } as any);

      resetForm();
      onOpenChange(false);
      toast.success("Study created successfully");
    } catch (error: unknown) {
      console.error("Study creation failed:", error);
      const message = error instanceof Error ? error.message : "Failed to create study";
      toast.error(message);
    }
  };

  const resetForm = () => {
    reset();
    setSelectedInstrument(null);
    setSelectedTags([]);
    setAttachments([]);
    setLinks([]);
    setLinkInput("");
    setChartLink("");
    setAdvancedOpen(false);
    setStatus("Draft");
    setPatternDuration("");
    setPatternStartDate("");
    setPatternEndDate("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Study</DialogTitle>
          <DialogDescription>
            Log a market analysis. Symbol and Title are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 1. Symbol (first) */}
          <InstrumentPicker
            segment="Equity_Positional"
            onSelect={handleInstrumentSelect}
            showLtpFetch={false}
          />

          {/* 2. Title (auto-filled) */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., RELIANCE — Cup & Handle Breakout"
              {...register("title")}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* 3. Study Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Study Type</Label>
              <Select value={category} onValueChange={(val) => setValue("category", val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {studyCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {studyStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", s.color.split(" ")[0])} />
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. Pattern Duration */}
          <div className="space-y-2">
            <Label>Pattern Duration</Label>
            <div className="flex flex-wrap gap-2">
              {systemDurations.map((d) => (
                <Badge
                  key={d.value}
                  variant={patternDuration === d.value ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setPatternDuration(patternDuration === d.value ? "" : d.value)}
                >
                  {d.label}
                </Badge>
              ))}
              {suggestedDuration && patternDuration !== suggestedDuration && (
                <Badge
                  variant="outline"
                  className="cursor-pointer text-xs border-primary/30 text-primary"
                  onClick={() => setPatternDuration(suggestedDuration)}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Auto: {systemDurations.find(d => d.value === suggestedDuration)?.label}
                </Badge>
              )}
            </div>
          </div>

          {/* 5. Analysis Notes with template buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes">Analysis Notes</Label>
              <div className="flex gap-1">
                {noteTemplates.map((tmpl) => (
                  <Button
                    key={tmpl.label}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => insertTemplate(tmpl.text)}
                    title={tmpl.label}
                  >
                    <tmpl.icon className="w-3 h-3" />
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              id="notes"
              placeholder="Describe your analysis, key levels, entry/exit criteria...&#10;Supports markdown: ## Heading, **bold**, - bullets"
              rows={6}
              className="font-mono text-sm"
              {...register("notes")}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>

          {/* 6. Tags — Quick Pick chips */}
          <div className="space-y-2">
            <Label>Tags</Label>
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleTag(tag)}>
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Quick pick sections */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Classic Patterns</p>
              <div className="flex flex-wrap gap-1">
                {patternTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="text-[10px] cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pt-1">Candlestick</p>
              <div className="flex flex-wrap gap-1">
                {candlestickTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="text-[10px] cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pt-1">Setup</p>
              <div className="flex flex-wrap gap-1">
                {setupTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="text-[10px] cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 7. Evidence: Chart Link + Charts + Links */}
          <div className="space-y-2">
            <Label>Evidence (Charts & Links)</Label>

            {/* Dedicated Chart Link */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-primary" />
                <Label className="text-xs font-medium">Chart Link</Label>
              </div>
              <Input
                type="url"
                placeholder="Paste TradingView / chart URL (optional)"
                value={chartLink}
                onChange={(e) => setChartLink(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <ChartLinkInput
              links={attachments}
              onLinksChange={setAttachments}
              maxLinks={5}
              placeholder="Paste chart image or TradingView URL..."
            />
            
            {/* Link attachments */}
            <div className="space-y-2 pt-2">
              {links.length > 0 && (
                <div className="space-y-1.5">
                  {links.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 border border-border text-xs">
                      <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <a href={link} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline flex-1">
                        {link}
                      </a>
                      <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setLinks(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Paste TradingView / screenshot link"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                  className="text-xs h-8"
                />
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={addLink}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Section */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-sm text-muted-foreground">Pattern Dates</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pattern_start">Pattern Start</Label>
                  <Input
                    id="pattern_start"
                    type="date"
                    value={patternStartDate}
                    onChange={(e) => setPatternStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pattern_end">Breakout Date</Label>
                  <Input
                    id="pattern_end"
                    type="date"
                    value={patternEndDate}
                    onChange={(e) => setPatternEndDate(e.target.value)}
                  />
                </div>
              </div>
              {suggestedDuration && (
                <p className="text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Auto-detected: <strong>{systemDurations.find(d => d.value === suggestedDuration)?.label}</strong>
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStudy.isPending}>
              {createStudy.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Study
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

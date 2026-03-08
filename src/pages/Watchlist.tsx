import { useState, useMemo } from "react";
import { SEOHead } from "@/components/SEOHead";
import { EmptyState } from "@/components/ui/empty-state";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import {
  Eye, Plus, Search, Trash2, MoreHorizontal, Edit2,
  List, Star, Bell, X, Palette, TrendingUp, CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { InstrumentPicker, type SelectedInstrument } from "@/components/trade/InstrumentPicker";
import { CreateAlertModal } from "@/components/modals/CreateAlertModal";
import { CreateTradeModal } from "@/components/modals/CreateTradeModal";
import { SortSelect } from "@/components/ui/sort-select";
import { useWatchlists, useWatchlistItems, type Watchlist, type WatchlistItem } from "@/hooks/useWatchlists";
import { useLivePrices } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";

const listColors = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#64748b",
];

// ── Utilities ──────────────────────────────────────────────────

function formatIndianPrice(n: number | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(vol: number | undefined): string {
  if (vol == null || isNaN(vol) || vol === 0) return "—";
  if (vol >= 10000000) return `${(vol / 10000000).toFixed(1)}Cr`;
  if (vol >= 100000) return `${(vol / 100000).toFixed(1)}L`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
  return vol.toString();
}

function formatTime(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const sortOptions = [
  { value: "change_pct", label: "% Change" },
  { value: "volume", label: "Volume" },
  { value: "ltp", label: "LTP" },
  { value: "alphabetical", label: "A → Z" },
];

// ── Page ───────────────────────────────────────────────────────

export default function WatchlistPage() {
  const { watchlists, isLoading, createWatchlist, updateWatchlist, deleteWatchlist } = useWatchlists();
  const { limits } = useSubscription();
  const [selectedList, setSelectedList] = useState<Watchlist | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<Watchlist | null>(null);
  const [renameTarget, setRenameTarget] = useState<Watchlist | null>(null);
  const [renameName, setRenameName] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (watchlists.length >= limits.maxWatchlists) {
      toast.error(`You've reached the ${limits.maxWatchlists} watchlist limit on your plan. Upgrade for more.`);
      return;
    }
    await createWatchlist.mutateAsync({ name: newName.trim(), description: newDesc.trim() || undefined, color: newColor });
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
    setNewColor("#6366f1");
  };

  const handleDelete = async () => {
    if (listToDelete) {
      await deleteWatchlist.mutateAsync(listToDelete.id);
      if (selectedList?.id === listToDelete.id) setSelectedList(null);
      setDeleteOpen(false);
      setListToDelete(null);
    }
  };

  // Auto-select first list
  if (!selectedList && watchlists.length > 0 && !isLoading) {
    setSelectedList(watchlists[0]);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-[22px] lg:text-[26px] font-bold tracking-tight text-foreground font-heading">Watchlists</h1>
          <p className="text-[14px] text-muted-foreground/80 leading-relaxed">Track instruments & create quick alerts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New List
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[400px] rounded-[1.25rem] shimmer-skeleton" />
          <Skeleton className="h-[400px] lg:col-span-2 rounded-[1.25rem] shimmer-skeleton" />
        </div>
      ) : watchlists.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No watchlists yet"
          description="Create a watchlist to start tracking your favorite instruments with live prices."
          createLabel="Create Watchlist"
          onCreate={() => setCreateOpen(true)}
          steps={["Create a list", "Add instruments", "Track live prices"]}
          hint="Use ⌘K to quickly search and add instruments"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* Watchlists sidebar */}
          <div className="space-y-2">
            {watchlists.map((wl) => (
              <div
                key={wl.id}
                onClick={() => setSelectedList(wl)}
                className={cn(
                  "surface-card p-4 cursor-pointer group transition-all",
                  selectedList?.id === wl.id && "ring-2 ring-primary/30 border-primary/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: wl.color || "#6366f1" }}
                    />
                    <div>
                      <h3 className="font-medium text-sm">{wl.name}</h3>
                      {wl.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{wl.description}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameTarget(wl); setRenameName(wl.name); }}><Edit2 className="w-4 h-4 mr-2" /> Rename</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); setListToDelete(wl); setDeleteOpen(true); }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" className="w-full" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add List
            </Button>
          </div>

          {/* Selected watchlist detail */}
          <div className="lg:col-span-2">
            {selectedList ? (
              <WatchlistDetail watchlist={selectedList} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            ) : (
              <div className="surface-card p-12 text-center">
                <List className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Select a watchlist</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Watchlist</DialogTitle>
            <DialogDescription>Track a group of instruments together.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g., Banking Stocks, Breakout Setups"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Palette className="w-3 h-3" /> Color</Label>
              <div className="flex gap-2 flex-wrap">
                {listColors.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all",
                      newColor === c ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || createWatchlist.isPending}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isLoading={deleteWatchlist.isPending}
        title="Delete Watchlist"
        description={`Delete "${listToDelete?.name}"? All items will be removed.`}
      />

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Watchlist</DialogTitle>
            <DialogDescription>Enter a new name for "{renameTarget?.name}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Watchlist name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameName.trim() && renameTarget) {
                  updateWatchlist.mutate({ id: renameTarget.id, name: renameName.trim() });
                  setRenameTarget(null);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
              <Button
                disabled={!renameName.trim() || updateWatchlist.isPending}
                onClick={() => {
                  if (renameTarget && renameName.trim()) {
                    updateWatchlist.mutate({ id: renameTarget.id, name: renameName.trim() });
                    setRenameTarget(null);
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Watchlist Detail Panel ───────────────────────────────────────

function WatchlistDetail({
  watchlist,
  searchQuery,
  onSearchChange,
}: {
  watchlist: Watchlist;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const { items, isLoading, addItem, removeItem } = useWatchlistItems(watchlist.id);
  const [addingSymbol, setAddingSymbol] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertPrefill, setAlertPrefill] = useState<{ symbol: string; exchange: string } | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradePrefill, setTradePrefill] = useState<string>("");
  const [sortBy, setSortBy] = useState("change_pct");

  // Build instruments array for live prices
  const instruments = useMemo(
    () =>
      items.map((i) => ({
        symbol: i.symbol,
        security_id: i.security_id,
        exchange_segment: i.exchange_segment || undefined,
      })),
    [items]
  );

  const { prices, isPolling, lastUpdated, isLoading: pricesLoading } = useLivePrices(instruments);

  // Check market closed: all prices have ltp 0 or no prices fetched
  const allUnavailable = items.length > 0 && Object.keys(prices).length === 0 && !pricesLoading;

  // Filter
  const filteredItems = searchQuery
    ? items.filter((i) => i.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  // Sort
  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    arr.sort((a, b) => {
      const pa = prices[a.symbol];
      const pb = prices[b.symbol];
      switch (sortBy) {
        case "change_pct":
          return (pb?.changePercent ?? -Infinity) - (pa?.changePercent ?? -Infinity);
        case "volume":
          return (pb?.volume ?? 0) - (pa?.volume ?? 0);
        case "ltp":
          return (pb?.ltp ?? 0) - (pa?.ltp ?? 0);
        case "alphabetical":
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });
    return arr;
  }, [filteredItems, prices, sortBy]);

  const handleAddInstrument = async (instrument: SelectedInstrument) => {
    if (items.some((i) => i.symbol === instrument.symbol && i.exchange === instrument.exchange)) return;
    await addItem.mutateAsync({
      watchlist_id: watchlist.id,
      symbol: instrument.symbol,
      exchange: instrument.exchange,
      security_id: instrument.security_id || undefined,
      exchange_segment: instrument.exchange_segment || undefined,
    });
    setAddingSymbol(false);
  };

  return (
    <div className="surface-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: watchlist.color || "#6366f1" }} />
            <div>
              <h2 className="font-semibold">{watchlist.name}</h2>
              <p className="text-xs text-muted-foreground">{items.length} instruments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            {isPolling && items.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {allUnavailable ? (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-muted-foreground/30">
                    Market Closed
                  </Badge>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-profit" />
                    </span>
                    <span>Live</span>
                  </>
                )}
                {lastUpdated && (
                  <span className="text-[10px] text-muted-foreground/60 ml-1">
                    {formatTime(lastUpdated)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <SortSelect value={sortBy} onValueChange={setSortBy} options={sortOptions} className="w-[130px]" />
          <Button size="sm" variant="outline" onClick={() => setAddingSymbol(!addingSymbol)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Add instrument */}
      {addingSymbol && (
        <div className="p-4 border-b border-border bg-accent/30">
          <InstrumentPicker onSelect={handleAddInstrument} showLtpFetch={false} />
        </div>
      )}

      {/* Items */}
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="p-8 text-center">
          <Star className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "No matches" : "No instruments yet. Add one above."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {sortedItems.map((item) => (
            <WatchlistRow
              key={item.id}
              item={item}
              price={prices[item.symbol]}
              onAlert={() => {
                setAlertPrefill({ symbol: item.symbol, exchange: item.exchange || "NSE" });
                setAlertModalOpen(true);
              }}
              onTrade={() => {
                setTradePrefill(item.symbol);
                setTradeModalOpen(true);
              }}
              onRemove={() => removeItem.mutate(item.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAlertModal
        open={alertModalOpen}
        onOpenChange={setAlertModalOpen}
        prefillSymbol={alertPrefill?.symbol}
        prefillExchange={alertPrefill?.exchange}
      />
      <CreateTradeModal
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        initialData={tradePrefill ? { symbol: tradePrefill } : null}
      />
    </div>
  );
}

// ── Single Row ───────────────────────────────────────────────────

function WatchlistRow({
  item,
  price,
  onAlert,
  onTrade,
  onRemove,
}: {
  item: WatchlistItem;
  price?: { ltp: number; change: number; changePercent: number; open?: number; high?: number; low?: number; prevClose?: number; volume?: number };
  onAlert: () => void;
  onTrade: () => void;
  onRemove: () => void;
}) {
  const hasPrice = price && price.ltp > 0;
  const isPositive = (price?.changePercent ?? 0) >= 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors group gap-2">
      {/* Left: Avatar + Symbol */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {item.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{item.symbol}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{item.exchange || "NSE"}</p>
        </div>
      </div>

      {/* Middle: LTP + Change */}
      <div className="flex items-center gap-3 md:min-w-[180px]">
        <span className="font-mono font-bold text-base tabular-nums">
          {hasPrice ? formatIndianPrice(price.ltp) : "—"}
        </span>
        {hasPrice && (
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full tabular-nums",
              isPositive
                ? "bg-profit/15 text-profit"
                : "bg-loss/15 text-loss"
            )}
          >
            {isPositive ? "+" : ""}
            {price.change.toFixed(2)} ({isPositive ? "+" : ""}
            {price.changePercent.toFixed(2)}%)
          </span>
        )}
      </div>

      {/* Right: OHLC + Volume */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-muted-foreground font-mono tabular-nums">
        <OhlcChip label="O" value={price?.open} />
        <OhlcChip label="H" value={price?.high} />
        <OhlcChip label="L" value={price?.low} />
        <OhlcChip label="C" value={price?.prevClose} />
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground">
          Vol {formatVolume(price?.volume)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Create alert" onClick={onAlert}>
          <Bell className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Quick trade" onClick={onTrade}>
          <TrendingUp className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Remove" onClick={onRemove}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function OhlcChip({ label, value }: { label: string; value?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/50">
      <span className="text-muted-foreground/70">{label}</span>{" "}
      {value != null && !isNaN(value) && value > 0
        ? value.toLocaleString("en-IN", { maximumFractionDigits: 2 })
        : "—"}
    </span>
  );
}

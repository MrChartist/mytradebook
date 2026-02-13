import { useState } from "react";
import {
  Eye, Plus, Search, Trash2, MoreHorizontal, Edit2,
  List, Star, Bell, ChevronRight, X, Palette,
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
import { useWatchlists, useWatchlistItems, type Watchlist } from "@/hooks/useWatchlists";
import { cn } from "@/lib/utils";

const listColors = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#64748b",
];

export default function WatchlistPage() {
  const { watchlists, isLoading, createWatchlist, updateWatchlist, deleteWatchlist } = useWatchlists();
  const [selectedList, setSelectedList] = useState<Watchlist | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<Watchlist | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Watchlists</h1>
          <p className="text-muted-foreground">Track instruments & create quick alerts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New List
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
      ) : watchlists.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <Eye className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No watchlists yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create a watchlist to start tracking your favorite instruments.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Watchlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                      <DropdownMenuItem><Edit2 className="w-4 h-4 mr-2" /> Rename</DropdownMenuItem>
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
    </div>
  );
}

// Watchlist detail panel
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

  const filteredItems = searchQuery
    ? items.filter(i => i.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const handleAddInstrument = async (instrument: SelectedInstrument) => {
    // Check duplicate
    if (items.some(i => i.symbol === instrument.symbol && i.exchange === instrument.exchange)) {
      return;
    }
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
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: watchlist.color || "#6366f1" }} />
          <div>
            <h2 className="font-semibold">{watchlist.name}</h2>
            <p className="text-xs text-muted-foreground">{items.length} instruments</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 w-40 text-xs"
            />
          </div>
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
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center">
          <Star className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "No matches" : "No instruments yet. Add one above."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {item.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.symbol}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{item.exchange || "NSE"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Create alert for this symbol">
                  <Bell className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => removeItem.mutate(item.id)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

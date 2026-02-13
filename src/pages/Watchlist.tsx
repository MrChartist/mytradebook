import { Eye, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Watchlist() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-muted-foreground text-sm">Track instruments and create quick actions.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New List
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search symbols..." className="pl-9" />
      </div>

      {/* Empty state */}
      <div className="surface-card p-12 text-center">
        <Eye className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-1">No watchlists yet</h3>
        <p className="text-muted-foreground text-sm mb-4">Create a watchlist to start tracking your favorite instruments.</p>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Create Watchlist
        </Button>
      </div>
    </div>
  );
}

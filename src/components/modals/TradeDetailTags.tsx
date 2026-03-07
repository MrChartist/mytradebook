import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TagSectionProps {
  label: string;
  items: { id: string; name: string; bullish?: boolean | null }[];
  allItems: { id: string; name: string; bullish?: boolean | null }[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  variant?: "secondary" | "destructive";
  getBorderClass?: (item: any) => string;
}

function TagSection({ label, items, allItems, onAdd, onRemove, variant = "secondary", getBorderClass }: TagSectionProps) {
  const available = allItems.filter((a) => !items.find((i) => i.id === a.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {available.map((item) => (
                <Button key={item.id} variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => onAdd(item.id)}>
                  {item.name}
                </Button>
              ))}
              {available.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">No {label.toLowerCase()} available</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge
            key={item.id}
            variant={variant}
            className={cn("text-xs cursor-pointer hover:bg-destructive/20", getBorderClass?.(item))}
            onClick={() => onRemove(item.id)}
          >
            {item.name}
            <X className="w-3 h-3 ml-1" />
          </Badge>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground">No {label.toLowerCase()}</span>
        )}
      </div>
    </div>
  );
}

interface Props {
  tags: {
    patterns: any[];
    allPatterns: any[];
    addPattern: { mutate: (id: string) => void };
    removePattern: { mutate: (id: string) => void };
    candlesticks: any[];
    allCandlesticks: any[];
    addCandlestick: { mutate: (id: string) => void };
    removeCandlestick: { mutate: (id: string) => void };
    volumes: any[];
    allVolumes: any[];
    addVolume: { mutate: (id: string) => void };
    removeVolume: { mutate: (id: string) => void };
    mistakes: any[];
    allMistakes: any[];
    addMistake: { mutate: (id: string) => void };
    removeMistake: { mutate: (id: string) => void };
  };
}

export function TradeDetailTags({ tags }: Props) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Tags</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TagSection
          label="Patterns"
          items={tags.patterns}
          allItems={tags.allPatterns}
          onAdd={(id) => tags.addPattern.mutate(id)}
          onRemove={(id) => tags.removePattern.mutate(id)}
        />
        <TagSection
          label="Candlesticks"
          items={tags.candlesticks}
          allItems={tags.allCandlesticks}
          onAdd={(id) => tags.addCandlestick.mutate(id)}
          onRemove={(id) => tags.removeCandlestick.mutate(id)}
          getBorderClass={(item) => item.bullish ? "border-profit/30" : "border-loss/30"}
        />
        <TagSection
          label="Volume"
          items={tags.volumes}
          allItems={tags.allVolumes}
          onAdd={(id) => tags.addVolume.mutate(id)}
          onRemove={(id) => tags.removeVolume.mutate(id)}
        />
        <TagSection
          label="Mistakes"
          items={tags.mistakes}
          allItems={tags.allMistakes}
          onAdd={(id) => tags.addMistake.mutate(id)}
          onRemove={(id) => tags.removeMistake.mutate(id)}
          variant="destructive"
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Link as LinkIcon, Plus, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

interface ChartLinkInputProps {
  links: string[];
  onLinksChange: (links: string[]) => void;
  maxLinks?: number;
  placeholder?: string;
}

export function ChartLinkInput({
  links,
  onLinksChange,
  maxLinks = 5,
  placeholder = "Paste chart or image URL...",
}: ChartLinkInputProps) {
  const [input, setInput] = useState("");

  const addLink = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (links.length >= maxLinks) {
      toast.error(`Maximum ${maxLinks} links allowed`);
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    if (links.includes(trimmed)) {
      toast.error("Link already added");
      return;
    }

    onLinksChange([...links, trimmed]);
    setInput("");
  };

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Preview cards */}
      {links.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {links.map((url, index) =>
            isImageUrl(url) ? (
              <div
                key={index}
                className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-accent"
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Chart ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                key={index}
                className="relative group flex items-center gap-2 p-3 rounded-lg border border-border bg-accent/50 min-h-[60px]"
              >
                <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate block"
                  >
                    {getDomain(url)}
                  </a>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Input */}
      {links.length < maxLinks && (
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addLink}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {links.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Add image URLs or chart links ({links.length}/{maxLinks})
        </p>
      )}
    </div>
  );
}

export { isImageUrl, getDomain };

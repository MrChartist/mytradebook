import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Tag, TrendingUp, CandlestickChart, BarChart3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TagSection {
  key: string;
  label: string;
  icon: React.ElementType;
  table: "pattern_tags" | "candlestick_tags" | "volume_tags" | "mistake_tags";
  color: string;
  extraFields?: { name: string; label: string; options?: string[] }[];
}

const TAG_SECTIONS: TagSection[] = [
  {
    key: "patterns",
    label: "Classic Patterns",
    icon: TrendingUp,
    table: "pattern_tags",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    extraFields: [
      { name: "category", label: "Category", options: ["Reversal", "Continuation", "Bilateral", "Custom"] },
    ],
  },
  {
    key: "candlesticks",
    label: "Candlestick Patterns",
    icon: CandlestickChart,
    table: "candlestick_tags",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    extraFields: [
      { name: "bullish", label: "Direction", options: ["Bullish", "Bearish"] },
    ],
  },
  {
    key: "volume",
    label: "Volume Signals",
    icon: BarChart3,
    table: "volume_tags",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    key: "mistakes",
    label: "Mistakes / Setup Tags",
    icon: AlertTriangle,
    table: "mistake_tags",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    extraFields: [
      { name: "severity", label: "Severity", options: ["Low", "Medium", "High", "Critical"] },
    ],
  },
];

export default function TagManagementSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Custom Tags Management
          </CardTitle>
          <CardDescription>
            Add your own trading patterns, candlestick setups, volume signals, and mistake categories.
            System tags (shared) cannot be deleted. Your custom tags are private to your account.
          </CardDescription>
        </CardHeader>
      </Card>

      {TAG_SECTIONS.map((section) => (
        <TagSectionCard key={section.key} section={section} />
      ))}
    </div>
  );
}

function TagSectionCard({ section }: { section: TagSection }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});

  const { data: tags = [], isLoading } = useQuery({
    queryKey: [section.table],
    queryFn: async () => {
      const { data, error } = await supabase.from(section.table).select("*");
      if (error) throw error;
      return data;
    },
  });

  const addTag = useMutation({
    mutationFn: async () => {
      if (!user?.id || !newName.trim()) throw new Error("Name is required");

      const record: Record<string, unknown> = {
        name: newName.trim(),
        user_id: user.id,
      };

      // Add extra fields
      if (section.extraFields) {
        for (const field of section.extraFields) {
          const val = extraValues[field.name];
          if (field.name === "bullish") {
            record.bullish = val === "Bullish";
          } else if (val) {
            record[field.name] = val;
          }
        }
      }

      const { error } = await supabase.from(section.table).insert(record as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [section.table] });
      setNewName("");
      setExtraValues({});
      toast.success(`${section.label} tag added`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(section.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [section.table] });
      toast.success("Tag deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const systemTags = tags.filter((t: any) => !t.user_id);
  const userTags = tags.filter((t: any) => t.user_id === user?.id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <section.icon className="w-4 h-4" />
          {section.label}
          <Badge variant="outline" className="ml-auto text-xs">
            {systemTags.length} system · {userTags.length} custom
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing tags */}
        <div className="flex flex-wrap gap-1.5">
          {systemTags.map((tag: any) => (
            <Badge key={tag.id} variant="secondary" className="text-xs opacity-70">
              {tag.name}
              {tag.category && <span className="ml-1 opacity-60">({tag.category})</span>}
            </Badge>
          ))}
          {userTags.map((tag: any) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={`text-xs ${section.color} cursor-pointer group`}
            >
              {tag.name}
              {tag.category && <span className="ml-1 opacity-60">({tag.category})</span>}
              <button
                onClick={() => deleteTag.mutate(tag.id)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {tags.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground">No tags yet</p>
          )}
        </div>

        {/* Add new tag */}
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <Input
              placeholder={`New ${section.label.toLowerCase()} name...`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) addTag.mutate();
              }}
            />
          </div>
          {section.extraFields?.map((field) => (
            <div key={field.name} className="min-w-[120px]">
              <Select
                value={extraValues[field.name] || ""}
                onValueChange={(v) => setExtraValues((prev) => ({ ...prev, [field.name]: v }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={field.label} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <Button
            size="sm"
            onClick={() => addTag.mutate()}
            disabled={!newName.trim() || addTag.isPending}
            className="h-9"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


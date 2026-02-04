import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartImageUpload } from "@/components/ui/chart-image-upload";
import { createStudySchema, type CreateStudyInput, studyCategories } from "@/lib/schemas";
import { useStudies } from "@/hooks/useStudies";
import { Loader2 } from "lucide-react";

interface CreateStudyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStudyModal({ open, onOpenChange }: CreateStudyModalProps) {
  const { createStudy } = useStudies();
  const [tagsInput, setTagsInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateStudyInput>({
    resolver: zodResolver(createStudySchema),
    defaultValues: {
      category: "Technical",
    },
  });

  const category = watch("category");

  const onSubmit = async (data: CreateStudyInput) => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await createStudy.mutateAsync({
      title: data.title,
      symbol: data.symbol,
      category: data.category,
      notes: data.notes,
      tags,
      analysis_date: new Date().toISOString().split("T")[0],
      attachments: attachments,
    });

    reset();
    setTagsInput("");
    setAttachments([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    setTagsInput("");
    setAttachments([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Study</DialogTitle>
          <DialogDescription>
            Log a market analysis with notes and chart images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., RELIANCE Cup & Handle Breakout"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Symbol & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., RELIANCE"
                {...register("symbol")}
              />
              {errors.symbol && (
                <p className="text-sm text-destructive">{errors.symbol.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setValue("category", val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {studyCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Analysis Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe your analysis, key levels, entry/exit criteria..."
              rows={5}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., cup-handle, breakout, volume-spike"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Chart Images Upload */}
          <div className="space-y-2">
            <Label>Chart Images</Label>
            <ChartImageUpload
              images={attachments}
              onImagesChange={setAttachments}
              bucket="study-attachments"
              maxImages={5}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createStudy.isPending}>
              {createStudy.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Study
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

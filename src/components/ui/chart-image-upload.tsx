import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChartAnnotationModal } from "@/components/trade/ChartAnnotationModal";

interface ChartImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  bucket?: "trade-charts" | "study-attachments";
  maxImages?: number;
}

export function ChartImageUpload({
  images,
  onImagesChange,
  bucket = "trade-charts",
  maxImages = 5,
}: ChartImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [annotatingIndex, setAnnotatingIndex] = useState<number | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (publicUrl.publicUrl) {
          newImages.push(publicUrl.publicUrl);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded`);
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleAnnotationSave = async (dataUrl: string) => {
    if (annotatingIndex === null || !user) return;
    // Convert data URL to blob and upload
    setUploading(true);
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `${user.id}/${Date.now()}-annotated.png`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, { contentType: "image/png" });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (publicUrl.publicUrl) {
        const newImages = [...images];
        newImages[annotatingIndex] = publicUrl.publicUrl;
        onImagesChange(newImages);
        toast.success("Annotated image saved");
      }
    } catch (err: any) {
      console.error("Annotation save error:", err);
      toast.error("Failed to save annotated image");
    } finally {
      setUploading(false);
      setAnnotatingIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-accent"
            >
              <img
                src={url}
                alt={`Chart ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setAnnotatingIndex(index)}
                  className="p-1 rounded-full bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground"
                  title="Annotate"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
            "hover:border-primary/50 hover:bg-accent/50",
            uploading && "pointer-events-none opacity-50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">
                {uploading ? "Uploading..." : "Drop chart images here"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 5MB ({images.length}/{maxImages})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Annotation Modal */}
      {annotatingIndex !== null && images[annotatingIndex] && (
        <ChartAnnotationModal
          open={annotatingIndex !== null}
          onOpenChange={(open) => !open && setAnnotatingIndex(null)}
          imageUrl={images[annotatingIndex]}
          onSave={handleAnnotationSave}
        />
      )}
    </div>
  );
}

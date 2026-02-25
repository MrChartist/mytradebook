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

/**
 * Get a signed URL for a storage path. Falls back to constructing a direct path
 * if signing fails (e.g. during upload before RLS propagates).
 */
async function getSignedImageUrl(bucket: string, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour expiry
  if (error || !data?.signedUrl) {
    console.warn("Failed to create signed URL:", error?.message);
    return null;
  }
  return data.signedUrl;
}

/**
 * Extract the storage path from a full public/signed URL.
 * Handles both old public URLs and new signed URLs.
 */
function extractStoragePath(url: string, bucket: string): string | null {
  try {
    // Match pattern: /storage/v1/object/public|sign/<bucket>/<path>
    const regex = new RegExp(`/storage/v1/object/(?:public|sign)/${bucket}/(.+?)(?:\\?|$)`);
    const match = url.match(regex);
    if (match) return decodeURIComponent(match[1]);

    // Also try: /storage/v1/s/<bucket>/<path> (signed URL format)
    const regex2 = new RegExp(`/storage/v1/s/${bucket}/(.+?)(?:\\?|$)`);
    const match2 = url.match(regex2);
    if (match2) return decodeURIComponent(match2[1]);

    return null;
  } catch {
    return null;
  }
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
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // Resolve display URL: use signed URL cache or the original
  const getDisplayUrl = (url: string) => signedUrls[url] || url;

  // Refresh signed URLs for all images
  const refreshSignedUrls = async (imageUrls: string[]) => {
    const newSignedUrls: Record<string, string> = {};
    for (const url of imageUrls) {
      const path = extractStoragePath(url, bucket);
      if (path) {
        const signed = await getSignedImageUrl(bucket, path);
        if (signed) newSignedUrls[url] = signed;
      }
    }
    setSignedUrls((prev) => ({ ...prev, ...newSignedUrls }));
  };

  // Refresh signed URLs when images change
  useState(() => {
    if (images.length > 0) {
      refreshSignedUrls(images);
    }
  });

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

        // Use signed URL instead of public URL
        const signedUrl = await getSignedImageUrl(bucket, fileName);
        if (signedUrl) {
          // Store the path-based reference for persistence
          const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
          newImages.push(publicUrl.publicUrl);
          setSignedUrls((prev) => ({ ...prev, [publicUrl.publicUrl]: signedUrl }));
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
    setUploading(true);
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `${user.id}/${Date.now()}-annotated.png`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, { contentType: "image/png" });
      if (uploadError) throw uploadError;

      const signedUrl = await getSignedImageUrl(bucket, fileName);
      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (publicUrl.publicUrl) {
        const newImages = [...images];
        newImages[annotatingIndex] = publicUrl.publicUrl;
        onImagesChange(newImages);
        if (signedUrl) {
          setSignedUrls((prev) => ({ ...prev, [publicUrl.publicUrl]: signedUrl }));
        }
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
                src={getDisplayUrl(url)}
                alt={`Chart ${index + 1}`}
                className="w-full h-full object-cover"
                onError={async () => {
                  // If signed URL expired, refresh it
                  const path = extractStoragePath(url, bucket);
                  if (path) {
                    const newSigned = await getSignedImageUrl(bucket, path);
                    if (newSigned) {
                      setSignedUrls((prev) => ({ ...prev, [url]: newSigned }));
                    }
                  }
                }}
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
          imageUrl={getDisplayUrl(images[annotatingIndex])}
          onSave={handleAnnotationSave}
        />
      )}
    </div>
  );
}

import { useRef, useState } from "react";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ALLOWED_BANNER_TYPES,
  MAX_BANNER_BYTES,
  slugify,
  uploadBanner,
  useBannerUrl,
} from "@/lib/banner";

type Props = {
  /** Current stored banner path (relative object path, or legacy full URL). */
  value: string | null;
  /** Called with the new stored object path after a successful upload. */
  onChange: (path: string) => void;
  /** Source string used to build the slug for the storage path. */
  slugSource: string;
  label?: string;
};

export default function BannerUpload({ value, onChange, slugSource, label = "Banner image" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const signed = useBannerUrl(value);
  const preview = localPreview || signed;

  const handleFile = async (file: File) => {
    if (!ALLOWED_BANNER_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_BANNER_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    const slug = slugify(slugSource || `event-${Date.now()}`);
    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(10);
    try {
      const path = await uploadBanner(file, slug, setProgress);
      onChange(path);
      toast.success("Banner uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
      setLocalPreview(null);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="relative aspect-video bg-muted/50 grid place-items-center">
          {preview ? (
            <img src={preview} alt="Banner preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground text-sm gap-2">
              <ImageIcon className="h-8 w-8" />
              <span>No banner uploaded yet</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm grid place-items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        {progress > 0 && <Progress value={progress} className="h-1 rounded-none" />}
        <div className="p-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP · up to 5 MB</p>
          <div className="flex gap-2">
            {value && !uploading && (
              <Button type="button" variant="ghost" size="sm" onClick={() => { setLocalPreview(null); onChange(""); }}>
                <X className="h-4 w-4" /> Remove
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> {value ? "Replace" : "Upload"}
            </Button>
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

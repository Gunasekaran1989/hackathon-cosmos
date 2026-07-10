import { supabase } from "@/integrations/supabase/client";

export const BANNERS_BUCKET = "banners";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `event-${Date.now()}`;
}

/** Returns a browser-loadable URL for a stored banner path, or empty string. */
export function bannerUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // legacy full URLs still work
  return supabase.storage.from(BANNERS_BUCKET).getPublicUrl(path).data.publicUrl;
}

export const ALLOWED_BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BANNER_BYTES = 5 * 1024 * 1024;

export function extForType(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

export async function uploadBanner(
  file: File,
  slug: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const path = `hackathons/${slug}/banner.${extForType(file.type)}`;
  onProgress?.(20);
  const { error } = await supabase.storage
    .from(BANNERS_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
  onProgress?.(100);
  if (error) throw error;
  return path;
}

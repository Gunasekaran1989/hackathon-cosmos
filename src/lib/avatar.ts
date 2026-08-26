import { supabase } from "@/integrations/supabase/client";
import { BANNERS_BUCKET, extForType } from "@/lib/banner";

export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/** Upload an avatar into the shared storage bucket under avatars/{uid}/. */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const path = `avatars/${userId}/avatar.${extForType(file.type)}`;
  const { error } = await supabase.storage
    .from(BANNERS_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

/** Resolve a stored avatar path (or legacy full URL) into a loadable URL. */
export async function resolveAvatarUrl(pathOrUrl: string | null | undefined): Promise<string> {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const { data } = await supabase.storage
    .from(BANNERS_BUCKET)
    .createSignedUrl(pathOrUrl, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? "";
}

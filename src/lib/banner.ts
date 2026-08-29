import { useEffect, useState } from "react";
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

export const ALLOWED_BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BANNER_BYTES = 5 * 1024 * 1024;

export function extForType(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

/* ------------------------------------------------------------------ *
 * Signed URL resolution (the `banners` bucket is private)
 * ------------------------------------------------------------------ */

const SIGNED_TTL_SECONDS = 60 * 60; // 1 hour
const REFRESH_MARGIN_MS = 5 * 60 * 1000; // refresh 5 min before expiry

type CacheEntry = { url: string; expiresAt: number };

const urlCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string>>();

/** Returns a cached signed URL if it is still valid, else "". */
export function cachedBannerUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // legacy absolute URLs
  const hit = urlCache.get(path);
  return hit && hit.expiresAt > Date.now() ? hit.url : "";
}

/**
 * Centralized helper: resolve a stored banner object path into a signed,
 * browser-loadable URL. Results are cached in-memory so repeated renders do
 * not create new signed URLs. Missing/invalid paths resolve to "".
 */
export async function resolveBannerUrl(path: string | null | undefined): Promise<string> {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const cached = cachedBannerUrl(path);
  if (cached) return cached;

  const existing = inflight.get(path);
  if (existing) return existing;

  const req = (async () => {
    try {
      const { data, error } = await supabase.storage
        .from(BANNERS_BUCKET)
        .createSignedUrl(path, SIGNED_TTL_SECONDS);
      if (error || !data?.signedUrl) return "";
      urlCache.set(path, {
        url: data.signedUrl,
        expiresAt: Date.now() + SIGNED_TTL_SECONDS * 1000 - REFRESH_MARGIN_MS,
      });
      return data.signedUrl;
    } catch {
      return "";
    } finally {
      inflight.delete(path);
    }
  })();

  inflight.set(path, req);
  return req;
}

/** Batch-resolve several banner paths (deduplicated, cache-aware). */
export async function resolveBannerUrls(
  paths: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean) as string[]));
  const entries = await Promise.all(
    unique.map(async (p) => [p, await resolveBannerUrl(p)] as const),
  );
  return Object.fromEntries(entries);
}

/** React hook returning a signed banner URL for a stored path. */
export function useBannerUrl(path: string | null | undefined): string {
  const [url, setUrl] = useState<string>(() => cachedBannerUrl(path));

  useEffect(() => {
    let active = true;
    const cached = cachedBannerUrl(path);
    setUrl(cached);
    if (!path || cached) return;
    resolveBannerUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}

export async function uploadBanner(
  file: File,
  slug: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  // Uploads are scoped to the signed-in user's own folder (enforced by storage RLS).
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("You must be signed in to upload an image.");
  const path = `submissions/${uid}/${slug}/banner.${extForType(file.type)}`;
  onProgress?.(20);
  const { error } = await supabase.storage
    .from(BANNERS_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
  onProgress?.(100);
  if (error) throw error;
  // A replaced object needs a fresh signed URL.
  urlCache.delete(path);
  return path;
}

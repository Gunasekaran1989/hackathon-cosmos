import { useState } from "react";
import { useBannerUrl } from "@/lib/banner";
import { cn } from "@/lib/utils";

type Props = {
  /** Stored banner object path (or legacy absolute URL). */
  path: string | null | undefined;
  alt?: string;
  className?: string;
  /** Image shown when no banner exists or the signed URL fails. */
  fallback?: string;
  /** Node rendered instead of an image when there is nothing to show. */
  emptyState?: React.ReactNode;
  loading?: "lazy" | "eager";
};

/**
 * Renders a hackathon banner from the private `banners` bucket using a
 * cached signed URL. Handles missing/invalid paths gracefully.
 */
export default function BannerImage({
  path,
  alt = "",
  className,
  fallback,
  emptyState,
  loading = "lazy",
}: Props) {
  const signed = useBannerUrl(path);
  const [failed, setFailed] = useState(false);

  const src = !failed && signed ? signed : fallback;

  if (!src) {
    return (
      <>
        {emptyState ?? (
          <div className={cn("w-full h-full bg-muted", className)} aria-hidden />
        )}
      </>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

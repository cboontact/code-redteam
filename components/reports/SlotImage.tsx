"use client";

import { toDisplayImageUrl } from "@/lib/image-urls";
import { cn } from "@/lib/utils";

interface SlotImageProps {
  src: string;
  alt: string;
  className?: string;
}

function resolveSrc(src: string): string {
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  return toDisplayImageUrl(src);
}

export function SlotImage({ src, alt, className }: SlotImageProps) {
  const displaySrc = resolveSrc(src);
  if (!displaySrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      loading="eager"
      decoding="sync"
      className={cn("max-h-full max-w-full object-contain", className)}
    />
  );
}
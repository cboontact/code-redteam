"use client";

import { useState } from "react";
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === displaySrc;

  if (!displaySrc) return null;

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-red-500">
        ไฟล์รูปเสีย<br />กรุณาอัพใหม่
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      loading="eager"
      decoding="sync"
      onError={() => setFailedSrc(displaySrc)}
      className={cn("max-h-full max-w-full object-contain", className)}
    />
  );
}

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
  const [loaded, setLoaded] = useState(false);

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
    <>
      {/* Skeleton shimmer ขณะรอรูปโหลด */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailedSrc(displaySrc)}
        className={cn(
          "max-h-full max-w-full object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </>
  );
}

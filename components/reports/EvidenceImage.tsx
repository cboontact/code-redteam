"use client";

import { SlotImage } from "./SlotImage";

interface EvidenceImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function EvidenceImage({ src, alt, className }: EvidenceImageProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <SlotImage src={src} alt={alt} className={className} />
    </div>
  );
}
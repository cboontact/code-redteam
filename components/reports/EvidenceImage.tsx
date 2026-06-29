"use client";

import { SlotImage } from "./SlotImage";

interface EvidenceImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function EvidenceImage({ src, alt, className }: EvidenceImageProps) {
  return (
    // absolute inset-0 ทำให้ skeleton เต็มกล่องและ SlotImage อยู่ตรงกลาง
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
      <SlotImage src={src} alt={alt} className={className} />
    </div>
  );
}
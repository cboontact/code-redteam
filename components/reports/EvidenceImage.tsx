"use client";

import { SlotImage } from "./SlotImage";

interface EvidenceImageProps {
  src: string;
  alt: string;
  className?: string;
}

// SlotImage จัดการ absolute positioning ภายในตัวเองแล้ว
// EvidenceImage แค่ pass-through ไม่ต้องห่อ div ซ้ำ
export function EvidenceImage({ src, alt, className }: EvidenceImageProps) {
  return <SlotImage src={src} alt={alt} className={className} />;
}
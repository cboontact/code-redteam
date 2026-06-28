export const REQUIRED_EVIDENCE_IMAGES = 6;

/** คลาสกล่องแสดงรูป — รองรับทั้งแนวนอนและแนวตั้ง */
export const EVIDENCE_SLOT_CLASS =
  "relative h-36 sm:h-44 w-full rounded-xl overflow-hidden bg-gray-100";

export function createImageSlots(existing?: string[]): (string | null)[] {
  const slots = Array<string | null>(REQUIRED_EVIDENCE_IMAGES).fill(null);
  existing?.forEach((url, i) => {
    if (i < REQUIRED_EVIDENCE_IMAGES) slots[i] = url;
  });
  return slots;
}

export function slotsToImages(slots: (string | null)[]): string[] {
  return slots.filter((url): url is string => Boolean(url));
}

export function validateReportImages(
  images: string[] | null | undefined
): string | null {
  if (!images || images.length !== REQUIRED_EVIDENCE_IMAGES) {
    return `กรุณาแนบรูปภาพครบ ${REQUIRED_EVIDENCE_IMAGES} รูป`;
  }
  if (new Set(images).size !== REQUIRED_EVIDENCE_IMAGES) {
    return "พบรูปภาพซ้ำ กรุณาใช้รูปที่แตกต่างกัน";
  }
  return null;
}

export async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createImageHashSlots(): (string | null)[] {
  return Array<string | null>(REQUIRED_EVIDENCE_IMAGES).fill(null);
}
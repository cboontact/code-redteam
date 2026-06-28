import { isHeicLike } from "@/lib/image-formats";

export type PreviewHandle = {
  url: string;
  revoke: () => void;
};

function scaleDimensions(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function bitmapToPreviewUrl(
  bitmap: ImageBitmap
): Promise<PreviewHandle | null> {
  const { width, height } = scaleDimensions(bitmap.width, bitmap.height, 960);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.82);
  });

  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  return { url, revoke: () => URL.revokeObjectURL(url) };
}

async function previewViaImageBitmap(file: File): Promise<PreviewHandle | null> {
  if (typeof createImageBitmap !== "function") return null;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return await bitmapToPreviewUrl(bitmap);
  } catch {
    return null;
  } finally {
    bitmap?.close();
  }
}

/** แสดงทันทีด้วย blob ดิบ — ไม่รอ async */
export function createInstantPreview(file: File): PreviewHandle {
  const url = URL.createObjectURL(file);
  return { url, revoke: () => URL.revokeObjectURL(url) };
}

/** ย่อ/แปลงเป็น JPEG สำหรับ preview ที่เสถียรกว่า (HEIC, รูปใหญ่) */
export async function createPreviewHandle(
  file: File
): Promise<PreviewHandle | null> {
  const viaBitmap = await previewViaImageBitmap(file);
  if (viaBitmap) return viaBitmap;

  if (!isHeicLike(file)) {
    return createInstantPreview(file);
  }

  return null;
}
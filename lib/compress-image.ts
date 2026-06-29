import sharp from "sharp";
import { prepareImageBuffer } from "./preprocess-image-server";

export const MAX_IMAGE_OUTPUT_BYTES = 900 * 1024;

type CompressedImage = {
  buffer: Buffer;
  contentType: string;
  ext: string;
};

type EncodeAttempt = {
  maxDimension: number;
  quality: number;
  format: "jpeg" | "webp";
};

// ลด attempt ให้เหลือ 4 รอบ และปิด mozjpeg (เร็วกว่า ~3x)
const ENCODE_ATTEMPTS: EncodeAttempt[] = [
  { maxDimension: 1600, quality: 80, format: "jpeg" },
  { maxDimension: 1280, quality: 75, format: "jpeg" },
  { maxDimension: 960,  quality: 72, format: "webp" },
  { maxDimension: 720,  quality: 68, format: "jpeg" },
];

function isSmaller(
  current: CompressedImage | null,
  candidate: CompressedImage
): boolean {
  return !current || candidate.buffer.length < current.buffer.length;
}

async function encodeImage(
  input: Buffer,
  attempt: EncodeAttempt
): Promise<CompressedImage> {
  const resized = sharp(input, { failOn: "none", unlimited: true })
    .rotate()
    .resize(attempt.maxDimension, attempt.maxDimension, {
      fit: "inside",
      withoutEnlargement: true,
    });

  if (attempt.format === "webp") {
    return {
      buffer: await resized.webp({ quality: attempt.quality, effort: 2 }).toBuffer(),
      contentType: "image/webp",
      ext: "webp",
    };
  }

  // mozjpeg: false → เร็วกว่ามาก คุณภาพใกล้เคียงกัน
  return {
    buffer: await resized
      .jpeg({ quality: attempt.quality, mozjpeg: false })
      .toBuffer(),
    contentType: "image/jpeg",
    ext: "jpg",
  };
}

export async function compressImageToMaxSize(
  input: Buffer,
  maxBytes = MAX_IMAGE_OUTPUT_BYTES
): Promise<CompressedImage> {
  // ถ้าไฟล์เล็กพอแล้ว → ลอง decode เพื่อ normalize orientation เท่านั้น
  const prepared = await prepareImageBuffer(input);

  // ถ้าหลัง normalize แล้วยังเล็กกว่า maxBytes → ใช้เลย
  if (prepared.length <= maxBytes) {
    return { buffer: prepared, contentType: "image/jpeg", ext: "jpg" };
  }

  let best: CompressedImage | null = null;

  for (const attempt of ENCODE_ATTEMPTS) {
    try {
      const candidate = await encodeImage(prepared, attempt);
      if (isSmaller(best, candidate)) best = candidate;
      // ถ้าขนาดเล็กพอแล้ว หยุดทันที (ไม่ต้องลอง attempt ต่อไป)
      if (candidate.buffer.length <= maxBytes) return candidate;
    } catch {
      // ลอง attempt ถัดไป
    }
  }

  if (best) return best;

  return { buffer: prepared, contentType: "image/jpeg", ext: "jpg" };
}

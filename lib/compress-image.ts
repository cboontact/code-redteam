import sharp from "sharp";

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

/**
 * รายการ attempt เรียงจากขนาดใหญ่→เล็ก
 * หยุดทันทีที่ขนาดเล็กพอ — ไม่ต้องลองทุกรอบ
 */
const ENCODE_ATTEMPTS: EncodeAttempt[] = [
  { maxDimension: 1600, quality: 80, format: "jpeg" },
  { maxDimension: 1280, quality: 75, format: "jpeg" },
  { maxDimension: 960,  quality: 70, format: "webp" },
  { maxDimension: 720,  quality: 65, format: "jpeg" },
];

/**
 * encode รูปครั้งเดียว พร้อม rotate (จัดการ EXIF orientation อัตโนมัติ)
 * mozjpeg: false = เร็วกว่า ~3x โดยคุณภาพต่างกันน้อยมาก
 */
async function encodeImage(
  input: Buffer,
  attempt: EncodeAttempt
): Promise<CompressedImage> {
  const pipeline = sharp(input, { failOn: "none", unlimited: true })
    .rotate() // แก้ EXIF orientation อัตโนมัติ
    .resize(attempt.maxDimension, attempt.maxDimension, {
      fit: "inside",
      withoutEnlargement: true,
    });

  if (attempt.format === "webp") {
    return {
      buffer: await pipeline.webp({ quality: attempt.quality, effort: 1 }).toBuffer(),
      contentType: "image/webp",
      ext: "webp",
    };
  }

  return {
    buffer: await pipeline.jpeg({ quality: attempt.quality, mozjpeg: false }).toBuffer(),
    contentType: "image/jpeg",
    ext: "jpg",
  };
}

/**
 * แปลง HEIC → JPEG ผ่าน heic-convert (เฉพาะ iOS ที่ sharp decode ไม่ได้)
 */
async function heicToJpeg(input: Buffer): Promise<Buffer | null> {
  try {
    const heicConvert = (await import("heic-convert")).default;
    const converted = await heicConvert({ buffer: input, format: "JPEG", quality: 0.88 });
    return Buffer.from(converted);
  } catch {
    return null;
  }
}

/**
 * บีบอัดรูปให้เล็กกว่า maxBytes
 *
 * กลยุทธ์ใหม่ (encode รอบเดียว):
 * 1. ลอง encode โดยตรงจาก raw input ผ่าน sharp (รวม rotate ไว้แล้ว)
 * 2. ถ้า sharp ทำไม่ได้ (เช่น HEIC บางรุ่น) → แปลงผ่าน heic-convert แล้ว encode
 * 3. เลือก attempt ที่เล็กพอ หยุดทันที
 *
 * ข้อดี: ไม่มี double-encode (prepareImageBuffer ถูกตัดออก)
 */
export async function compressImageToMaxSize(
  input: Buffer,
  maxBytes = MAX_IMAGE_OUTPUT_BYTES
): Promise<CompressedImage> {
  let sharpFailed = false;

  // ลอง encode โดยตรงจาก raw buffer (1 รอบเท่านั้น)
  for (const attempt of ENCODE_ATTEMPTS) {
    try {
      const result = await encodeImage(input, attempt);
      if (result.buffer.length <= maxBytes) return result; // พอแล้ว หยุดเลย
      // ยังใหญ่ → ลอง attempt ถัดไป (dimension เล็กลง / quality ต่ำลง)
    } catch {
      sharpFailed = true;
      break; // sharp decode ไม่ได้เลย → น่าจะเป็น HEIC
    }
  }

  // Fallback: HEIC ที่ sharp ไม่รองรับ → แปลงผ่าน heic-convert ก่อน
  if (sharpFailed) {
    const jpeg = await heicToJpeg(input);
    if (!jpeg) throw new Error("UNSUPPORTED_IMAGE");

    for (const attempt of ENCODE_ATTEMPTS) {
      try {
        const result = await encodeImage(jpeg, attempt);
        if (result.buffer.length <= maxBytes) return result;
      } catch {
        // ลอง attempt ถัดไป
      }
    }

    // ถ้า compress ไม่ได้เลย คืน HEIC-converted ที่ยังใหญ่อยู่ดีกว่า error
    const last = await encodeImage(jpeg, ENCODE_ATTEMPTS[ENCODE_ATTEMPTS.length - 1]).catch(() => null);
    if (last) return last;
    throw new Error("UNSUPPORTED_IMAGE");
  }

  // กรณีที่ผ่านทุก attempt แล้วยังใหญ่อยู่ → คืน attempt สุดท้าย (เล็กสุดที่ทำได้)
  const fallback = await encodeImage(input, ENCODE_ATTEMPTS[ENCODE_ATTEMPTS.length - 1]).catch(() => null);
  if (fallback) return fallback;

  throw new Error("UNSUPPORTED_IMAGE");
}

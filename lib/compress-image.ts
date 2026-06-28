import sharp from "sharp";
import { prepareImageBuffer } from "./preprocess-image-server";

export const MAX_IMAGE_OUTPUT_BYTES = 300 * 1024;

type CompressedImage = {
  buffer: Buffer;
  contentType: string;
  ext: string;
};

async function encodeUnderLimit(
  input: Buffer,
  maxDimension: number,
  maxBytes: number
): Promise<CompressedImage | null> {
  const resized = sharp(input).rotate().resize(maxDimension, maxDimension, {
    fit: "inside",
    withoutEnlargement: true,
  });

  for (let quality = 85; quality >= 20; quality -= 5) {
    const webp = await resized.clone().webp({ quality }).toBuffer();
    if (webp.length <= maxBytes) {
      return { buffer: webp, contentType: "image/webp", ext: "webp" };
    }
  }

  for (let quality = 85; quality >= 20; quality -= 5) {
    const jpeg = await resized
      .clone()
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (jpeg.length <= maxBytes) {
      return { buffer: jpeg, contentType: "image/jpeg", ext: "jpg" };
    }
  }

  return null;
}

export async function compressImageToMaxSize(
  input: Buffer,
  maxBytes = MAX_IMAGE_OUTPUT_BYTES
): Promise<CompressedImage> {
  const prepared = await prepareImageBuffer(input);

  if (prepared.length <= maxBytes) {
    return { buffer: prepared, contentType: "image/jpeg", ext: "jpg" };
  }

  const dimensions = [1920, 1600, 1280, 1024, 800, 640, 480, 360];

  for (const dim of dimensions) {
    const result = await encodeUnderLimit(prepared, dim, maxBytes);
    if (result) return result;
  }

  throw new Error("COMPRESS_FAILED");
}
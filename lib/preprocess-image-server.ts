import sharp from "sharp";

async function convertHeicToJpeg(input: Buffer): Promise<Buffer | null> {
  try {
    const heicConvert = (await import("heic-convert")).default;
    const converted = await heicConvert({
      buffer: input,
      format: "JPEG",
      quality: 0.92,
    });
    return Buffer.from(converted);
  } catch {
    return null;
  }
}

async function decodeWithSharp(input: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(input, {
      failOn: "none",
      unlimited: true,
      animated: true,
    })
      .rotate()
      .jpeg({ quality: 92, mozjpeg: false }) // mozjpeg: false → เร็วกว่า สำหรับ decode pass
      .toBuffer();
  } catch {
    return null;
  }
}

export async function prepareImageBuffer(input: Buffer): Promise<Buffer> {
  const fromSharp = await decodeWithSharp(input);
  if (fromSharp) return fromSharp;

  const fromHeic = await convertHeicToJpeg(input);
  if (fromHeic) {
    const jpeg = await decodeWithSharp(fromHeic);
    if (jpeg) return jpeg;
    return fromHeic;
  }

  throw new Error("UNSUPPORTED_IMAGE");
}

export async function validateImageBuffer(input: Buffer): Promise<boolean> {
  try {
    await prepareImageBuffer(input);
    return true;
  } catch {
    return false;
  }
}
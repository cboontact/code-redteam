/**
 * MAX_CLIENT_EDGE — ลดจาก 4096 → 1600
 * เพราะ server จะ resize ซ้ำอีกครั้งอยู่แล้ว (max 1600px)
 * การส่งรูปขนาดเล็กกว่าช่วยลดเวลา transfer และ server processing มาก
 */
const MAX_CLIENT_EDGE = 1600;

/** ขนาดไฟล์ที่ข้ามการ normalize เลย (JPEG เล็ก ไม่ต้องแปลง) */
const SKIP_NORMALIZE_THRESHOLD = 4 * 1024 * 1024; // 4MB

function scaleToMaxEdge(
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

async function fileToJpegViaCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  fileName: string,
  lastModified: number
): Promise<File | null> {
  const scaled = scaleToMaxEdge(width, height, MAX_CLIENT_EDGE);
  const canvas = document.createElement("canvas");
  canvas.width = scaled.width;
  canvas.height = scaled.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, scaled.width, scaled.height);
  ctx.drawImage(source, 0, 0, scaled.width, scaled.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    // quality 0.85 — เร็วกว่าและขนาดเล็กกว่า 0.88 โดยคุณภาพต่างกันน้อยมาก
    canvas.toBlob(resolve, "image/jpeg", 0.85);
  });

  if (!blob) return null;

  const baseName = fileName.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified,
  });
}

async function loadViaImageElement(file: File): Promise<File | null> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("image load failed"));
      image.src = objectUrl;
    });

    return fileToJpegViaCanvas(
      img,
      img.naturalWidth,
      img.naturalHeight,
      file.name,
      file.lastModified
    );
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * แปลงรูปจากมือถือทุกยี่ห้อให้เป็น JPEG ขนาดเล็กลงก่อนอัพโหลด
 *
 * ข้ามการแปลงถ้าเป็น JPEG ที่เล็กพอแล้ว (ไม่เกิน 4MB)
 * เพราะ server จะ compress ซ้ำอีกครั้งอยู่แล้ว
 */
export async function normalizeImageForUpload(file: File): Promise<File> {
  // JPEG ขนาดเล็ก → ส่งตรงๆ ได้เลย ไม่ต้อง re-encode
  if (file.type === "image/jpeg" && file.size <= SKIP_NORMALIZE_THRESHOLD) {
    return file;
  }

  // ใช้ createImageBitmap ถ้าบราวเซอร์รองรับ (เร็วกว่า Image element)
  if (typeof createImageBitmap === "function") {
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      const converted = await fileToJpegViaCanvas(
        bitmap,
        bitmap.width,
        bitmap.height,
        file.name,
        file.lastModified
      );
      if (converted) return converted;
    } catch {
      // fall through
    } finally {
      bitmap?.close();
    }
  }

  const viaImage = await loadViaImageElement(file);
  if (viaImage) return viaImage;

  throw new Error("UNSUPPORTED_IMAGE");
}
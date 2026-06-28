const MAX_CLIENT_EDGE = 4096;

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
    canvas.toBlob(resolve, "image/jpeg", 0.88);
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

    return fileToJpegViaCanvas(img, img.naturalWidth, img.naturalHeight, file.name, file.lastModified);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * แปลงรูปจากมือถือทุกยี่ห้อให้เป็น JPEG ก่อนอัพโหลด
 */
export async function normalizeImageForUpload(file: File): Promise<File> {
  if (file.type === "image/jpeg" && file.size <= 8 * 1024 * 1024) {
    return file;
  }

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
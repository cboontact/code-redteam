export const IMAGE_ACCEPT = "image/*,.heic,.heif,.avif,.jpg,.jpeg,.png,.webp";

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "image/avif",
  "image/bmp",
  "image/gif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "jfif",
  "png",
  "webp",
  "heic",
  "heif",
  "avif",
  "bmp",
  "gif",
]);

export const SUPPORTED_IMAGE_FORMATS_LABEL =
  "รูปถ่ายจากมือถือทุกยี่ห้อ (JPG, PNG, WEBP, HEIC)";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function getFileExtension(filename: string): string | null {
  const parts = filename.split(".");
  if (parts.length < 2) return null;
  return parts.pop()?.toLowerCase() ?? null;
}

export function hasAllowedImageExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext ? ALLOWED_IMAGE_EXTENSIONS.has(ext) : false;
}

export function isHeicLike(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime.includes("heic") || mime.includes("heif")) return true;
  const ext = getFileExtension(file.name);
  return ext === "heic" || ext === "heif";
}

export function isAllowedImageFile(file: File): boolean {
  const mime = file.type.toLowerCase();

  if (mime && ALLOWED_IMAGE_MIME_TYPES.has(mime)) return true;
  if (mime.startsWith("image/")) return true;

  if (!mime || mime === "application/octet-stream") {
    return hasAllowedImageExtension(file.name);
  }

  return false;
}
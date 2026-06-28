export const REPORT_IMAGES_BUCKET = "report-images";

export function buildReportImageFolder(
  reportDate: string,
  roomId: string
): string {
  return `${reportDate}/${roomId}`;
}

export function buildReportImagePath(
  reportDate: string,
  roomId: string,
  slot: number,
  ext: string
): string {
  return `${buildReportImageFolder(reportDate, roomId)}/slot-${slot}.${ext}`;
}

export function getStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${REPORT_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

export function getStoragePathFromProxyUrl(url: string): string | null {
  if (!url.startsWith("/api/images")) return null;

  try {
    const parsed = new URL(url, "http://localhost");
    const path = parsed.searchParams.get("path");
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}
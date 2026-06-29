import {
  getStoragePathFromPublicUrl,
  getStoragePathFromProxyUrl,
} from "@/lib/storage-paths";

const IMAGE_PROXY_CACHE_VERSION = "20260629-2";

export function buildImageProxyUrl(storagePath: string): string {
  return `/api/images?path=${encodeURIComponent(storagePath)}&v=${IMAGE_PROXY_CACHE_VERSION}`;
}

export function toDisplayImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  const proxyPath = getStoragePathFromProxyUrl(url);
  if (proxyPath) return resolveImageSrc(buildImageProxyUrl(proxyPath));

  const storagePath = getStoragePathFromPublicUrl(url);
  if (storagePath) return resolveImageSrc(buildImageProxyUrl(storagePath));

  return resolveImageSrc(url);
}

export function resolveImageSrc(url: string): string {
  if (!url) return url;
  if (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/") && typeof window !== "undefined") {
    return `${window.location.origin}${url}`;
  }

  return url;
}

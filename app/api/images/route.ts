import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { REPORT_IMAGES_BUCKET } from "@/lib/storage-paths";

function contentTypeForPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function isValidStoragePath(path: string): boolean {
  if (!path || path.includes("..") || path.startsWith("/")) return false;
  return /^[\w./-]+$/.test(path);
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path || !isValidStoragePath(path)) {
    return NextResponse.json({ error: "พาธรูปไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(REPORT_IMAGES_BUCKET)
    .download(path);

  if (error || !data) {
    return new NextResponse("ไม่พบรูป", { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentTypeForPath(path),
      // URL รูปมี path + version อยู่แล้ว → cache ได้นาน
      // browser กดดูรูปซ้ำไม่ต้องโหลดใหม่จาก server
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
    },
  });
}

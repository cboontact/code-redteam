import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";
import {
  REPORT_IMAGES_BUCKET,
  buildReportImageFolder,
  getStoragePathFromPublicUrl,
} from "@/lib/storage-paths";
import { buildImageProxyUrl, toDisplayImageUrl } from "@/lib/image-urls";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const roomId = searchParams.get("room_id");

  if (!date || !roomId) {
    return NextResponse.json(
      { error: "กรุณาระบุวันที่และห้อง" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const folderPath = buildReportImageFolder(date, roomId);

  const { data: files, error } = await supabase.storage
    .from(REPORT_IMAGES_BUCKET)
    .list(folderPath, { sortBy: { column: "name", order: "asc" } });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const storageImages =
    files
      ?.filter((file) => file.name && !file.name.startsWith("."))
      .map((file) => {
        const path = `${folderPath}/${file.name}`;

        return {
          name: file.name,
          url: buildImageProxyUrl(path),
          path,
        };
      }) ?? [];

  if (storageImages.length > 0) {
    return NextResponse.json({
      folder: folderPath,
      images: storageImages,
    });
  }

  const { data: report } = await supabase
    .from("reports")
    .select("images")
    .eq("report_date", date)
    .eq("room_id", roomId)
    .maybeSingle();

  const fallbackImages =
    report?.images?.map((url: string, index: number) => {
      const path = getStoragePathFromPublicUrl(url);
      const name = path?.split("/").pop() ?? `image-${index + 1}`;

      return {
        name,
        url: toDisplayImageUrl(url),
        path: path ?? url,
      };
    }) ?? [];

  return NextResponse.json({
    folder: folderPath,
    images: fallbackImages,
  });
}
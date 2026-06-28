import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { getBangkokDate } from "@/lib/utils";
import { compressImageToMaxSize } from "@/lib/compress-image";
import {
  isAllowedImageFile,
  MAX_UPLOAD_BYTES,
  SUPPORTED_IMAGE_FORMATS_LABEL,
} from "@/lib/image-formats";
import { validateImageBuffer } from "@/lib/preprocess-image-server";
import { buildReportImagePath, REPORT_IMAGES_BUCKET } from "@/lib/storage-paths";
import { buildImageProxyUrl } from "@/lib/image-urls";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { success } = rateLimit(`upload:${ip}`, 20, 60_000);

  if (!success) {
    return NextResponse.json(
      { error: "อัพโหลดบ่อยเกินไป กรุณารอสักครู่" },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const roomId = formData.get("room_id")?.toString();
  const reportDate =
    formData.get("report_date")?.toString() || getBangkokDate();
  const slot = Number(formData.get("slot"));

  if (!files.length) {
    return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }

  if (!roomId) {
    return NextResponse.json({ error: "กรุณาเลือกห้องก่อนอัพโหลดรูป" }, { status: 400 });
  }

  if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
    return NextResponse.json({ error: "ช่องรูปไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const urls: string[] = [];
  const seenHashes = new Set<string>();

  for (const file of files) {
    if (!isAllowedImageFile(file)) {
      return NextResponse.json(
        {
          error: `รองรับเฉพาะไฟล์รูป (${SUPPORTED_IMAGE_FORMATS_LABEL})`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "ไฟล์ต้นฉบับต้องไม่เกิน 20MB" },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    const readable = await validateImageBuffer(rawBuffer);
    if (!readable) {
      return NextResponse.json(
        {
          error: `ไม่สามารถอ่านไฟล์รูปได้ กรุณาใช้ ${SUPPORTED_IMAGE_FORMATS_LABEL}`,
        },
        { status: 400 }
      );
    }

    let compressed;
    try {
      compressed = await compressImageToMaxSize(rawBuffer);
    } catch {
      return NextResponse.json(
        {
          error:
            "บีบอัดรูปไม่สำเร็จ ลองเลือกรูปใหม่หรือถ่ายใหม่ (ระบบรองรับรูปจากมือถือทุกยี่ห้อ)",
        },
        { status: 400 }
      );
    }

    const hash = createHash("sha256").update(compressed.buffer).digest("hex");

    if (seenHashes.has(hash)) {
      return NextResponse.json(
        { error: "พบรูปภาพซ้ำในไฟล์ที่อัพโหลด" },
        { status: 400 }
      );
    }
    seenHashes.add(hash);

    const fileName = buildReportImagePath(
      reportDate,
      roomId,
      slot,
      compressed.ext
    );

    const { error } = await supabase.storage
      .from(REPORT_IMAGES_BUCKET)
      .upload(fileName, compressed.buffer, {
        contentType: compressed.contentType,
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    urls.push(buildImageProxyUrl(fileName));
  }

  return NextResponse.json({ urls });
}
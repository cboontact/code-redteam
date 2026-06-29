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
import {
  buildReportImageFolder,
  buildReportImagePath,
  REPORT_IMAGES_BUCKET,
} from "@/lib/storage-paths";
import { buildImageProxyUrl } from "@/lib/image-urls";

function hashBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function fileBelongsToSlot(fileName: string, slot: number): boolean {
  const match = fileName.match(/^slot-(\d+)\./);
  if (!match) return false;
  return Number(match[1]) === slot;
}

/**
 * list โฟลเดอร์ครั้งเดียว แล้วลบเฉพาะไฟล์ของ slot นั้น
 */
async function removeExistingSlotFiles(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  folder: string,
  slot: number
): Promise<void> {
  const { data: files, error } = await supabase.storage
    .from(REPORT_IMAGES_BUCKET)
    .list(folder);

  if (error) {
    throw new Error(error.message);
  }

  const pathsToRemove =
    files
      ?.filter((file) => fileBelongsToSlot(file.name, slot))
      .map((file) => `${folder}/${file.name}`) ?? [];

  if (pathsToRemove.length > 0) {
    await supabase.storage.from(REPORT_IMAGES_BUCKET).remove(pathsToRemove);
  }
}

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
    return NextResponse.json(
      { error: "กรุณาเลือกห้องก่อนอัพโหลดรูป" },
      { status: 400 }
    );
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
        { error: `รองรับเฉพาะไฟล์รูป (${SUPPORTED_IMAGE_FORMATS_LABEL})` },
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

    let compressed;
    try {
      compressed = await compressImageToMaxSize(rawBuffer);
    } catch (err) {
      if (err instanceof Error && err.message === "UNSUPPORTED_IMAGE") {
        return NextResponse.json(
          {
            error: `ไม่สามารถอ่านไฟล์รูปได้ กรุณาใช้ ${SUPPORTED_IMAGE_FORMATS_LABEL}`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error:
            "บีบอัดรูปไม่สำเร็จ ลองเลือกรูปใหม่หรือถ่ายใหม่ (ระบบรองรับรูปจากมือถือทุกยี่ห้อ)",
        },
        { status: 400 }
      );
    }

    const hash = hashBuffer(compressed.buffer);

    if (seenHashes.has(hash)) {
      return NextResponse.json(
        { error: "พบรูปภาพซ้ำในไฟล์ที่อัพโหลด" },
        { status: 400 }
      );
    }
    seenHashes.add(hash);

    // ลบไฟล์เก่าของ slot นี้ออกก่อน (1 รอบ list เท่านั้น)
    // การตรวจ duplicate hash ข้าม slot ทำฝั่ง client ผ่าน imageHashes state แล้ว
    const folder = buildReportImageFolder(reportDate, roomId);
    await removeExistingSlotFiles(supabase, folder, slot);

    const fileName = buildReportImagePath(
      reportDate,
      roomId,
      slot,
      compressed.ext
    );

    const uploadBody = new Blob([new Uint8Array(compressed.buffer)], {
      type: compressed.contentType,
    });

    const { error } = await supabase.storage
      .from(REPORT_IMAGES_BUCKET)
      .upload(fileName, uploadBody, {
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

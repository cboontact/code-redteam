import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";
import {
  getBangkokDate,
  isBeforeEditCutoff,
  isValidPhone,
  normalizePhone,
} from "@/lib/utils";
import { validateReportImages } from "@/lib/images";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("reports")
    .select("*, room:rooms(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "ไม่พบรายงาน" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "ไม่พบรายงาน" }, { status: 404 });
  }

  if (!session) {
    const { verify_phone } = body;
    if (
      !verify_phone ||
      normalizePhone(verify_phone) !== existing.reporter_phone
    ) {
      return NextResponse.json(
        { error: "เบอร์โทรไม่ตรงกับที่ใช้ส่งรายงาน" },
        { status: 403 }
      );
    }

    if (!isBeforeEditCutoff(existing.report_date)) {
      return NextResponse.json(
        { error: "แก้ไขได้เฉพาะก่อน 19:00 น. ของวันที่ส่งรายงาน" },
        { status: 403 }
      );
    }
  }

  const {
    reporter_name,
    reporter_phone,
    description,
    clean_status,
    images,
    room_id,
  } = body;

  if (reporter_phone && !isValidPhone(reporter_phone)) {
    return NextResponse.json(
      { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  if (images) {
    const imageError = validateReportImages(images);
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (reporter_name) updateData.reporter_name = reporter_name.trim();
  if (reporter_phone) updateData.reporter_phone = normalizePhone(reporter_phone);
  if (description) updateData.description = description.trim();
  if (clean_status) updateData.clean_status = clean_status;
  if (images) updateData.images = images;
  if (session && room_id) updateData.room_id = room_id;

  const { data, error } = await supabase
    .from("reports")
    .update(updateData)
    .eq("id", id)
    .select("*, room:rooms(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("reports").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
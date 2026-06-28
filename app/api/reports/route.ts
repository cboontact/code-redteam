import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import {
  getBangkokDate,
  isValidPhone,
  normalizePhone,
  isDevBypassReportRules,
  isWeekday,
  isBeforeReportCutoff,
} from "@/lib/utils";
import { validateReportImages } from "@/lib/images";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("room_id");
  const today = searchParams.get("today") === "true";
  const date = searchParams.get("date") || (today ? getBangkokDate() : null);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");

  const supabase = getSupabaseAdmin();

  if (roomId && today) {
    const { data } = await supabase
      .from("reports")
      .select("id")
      .eq("room_id", roomId)
      .eq("report_date", getBangkokDate())
      .maybeSingle();

    return NextResponse.json({ exists: !!data, report_id: data?.id || null });
  }

  let query = supabase
    .from("reports")
    .select("*, room:rooms(*)")
    .order("submitted_at", { ascending: false });

  if (date) query = query.eq("report_date", date);
  if (from) query = query.gte("report_date", from);
  if (to) query = query.lte("report_date", to);
  if (roomId) query = query.eq("room_id", roomId);
  if (search) {
    query = query.or(
      `reporter_name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { success } = rateLimit(`report:${ip}`, 3, 60_000);

  if (!success) {
    return NextResponse.json(
      { error: "ส่งรายงานบ่อยเกินไป กรุณารอสักครู่" },
      { status: 429 }
    );
  }

  if (!isDevBypassReportRules() && !isWeekday()) {
    return NextResponse.json(
      { error: "ส่งรายงานได้เฉพาะวันจันทร์-ศุกร์" },
      { status: 400 }
    );
  }

  if (!isDevBypassReportRules() && !isBeforeReportCutoff()) {
    return NextResponse.json(
      { error: "ส่งรายงานได้ถึง 19:00 น. เท่านั้น" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    room_id,
    reporter_name,
    reporter_phone,
    description,
    clean_status,
    images,
  } = body;

  if (!room_id || !reporter_name?.trim() || !reporter_phone || !description?.trim()) {
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบ" },
      { status: 400 }
    );
  }

  if (!isValidPhone(reporter_phone)) {
    return NextResponse.json(
      { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const imageError = validateReportImages(images);
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 400 });
  }

  const reportDate = getBangkokDate();
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("room_id", room_id)
    .eq("report_date", reportDate)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "ห้องนี้ส่งรายงานวันนี้แล้ว" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      room_id,
      report_date: reportDate,
      reporter_name: reporter_name.trim(),
      reporter_phone: normalizePhone(reporter_phone),
      description: description.trim(),
      clean_status,
      images,
    })
    .select("*, room:rooms(*)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "ห้องนี้ส่งรายงานวันนี้แล้ว" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
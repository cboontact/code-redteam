import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") !== "false";

  const supabase = getSupabaseAdmin();
  let query = supabase.from("rooms").select("*").order("name");

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // เรียงลำดับแบบ Natural Sort (ให้ ม.1/2 มาก่อน ม.1/11)
  const sortedData = data.sort((a, b) =>
    a.name.localeCompare(b.name, "th-TH", { numeric: true })
  );

  return NextResponse.json(sortedData);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    area_description,
    advisor_name,
    advisor_phone,
    is_active = true,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "กรุณาระบุชื่อห้อง" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      name: name.trim(),
      area_description,
      advisor_name: advisor_name?.trim() || null,
      advisor_phone: advisor_phone?.trim() || null,
      is_active,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
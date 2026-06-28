import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";
import { CLEAN_STATUS_LABELS, formatThaiDateTime } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("reports")
    .select("*, room:rooms(name)")
    .order("report_date", { ascending: false });

  if (from) query = query.gte("report_date", from);
  if (to) query = query.lte("report_date", to);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "วันที่",
    "ห้อง/พื้นที่",
    "ผู้รายงาน",
    "เบอร์โทร",
    "สถานะความสะอาด",
    "รายละเอียด",
    "จำนวนรูป",
    "เวลาส่ง",
  ];

  const rows = (data || []).map((r) => {
    const room = r.room as { name: string } | null;
    return [
      r.report_date,
      room?.name || "",
      r.reporter_name,
      r.reporter_phone,
      CLEAN_STATUS_LABELS[r.clean_status as keyof typeof CLEAN_STATUS_LABELS],
      `"${r.description.replace(/"/g, '""')}"`,
      r.images?.length || 0,
      formatThaiDateTime(r.submitted_at),
    ].join(",");
  });

  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reports-${from || "all"}-${to || "all"}.csv"`,
    },
  });
}
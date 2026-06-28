import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { ReportForm } from "@/components/reports/ReportForm";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getBangkokDate,
  formatThaiDate,
  isWeekday,
  canSubmitReportToday,
  isBeforeReportCutoff,
  isDevBypassReportRules,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getRooms() {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const rooms = await getRooms();
  const today = getBangkokDate();
  const devBypass = isDevBypassReportRules();
  const weekday = isWeekday();
  const withinSubmitTime = isBeforeReportCutoff();
  const canSubmit = canSubmitReportToday();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 rounded-xl">
            <FontAwesomeIcon
              icon={faClipboardList}
              className="text-red-600 text-xl"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">ส่งรายงานวันนี้</h2>
            <p className="text-sm text-gray-500">{formatThaiDate(today)}</p>
          </div>
        </div>

        {devBypass && (
          <div className="mb-6 p-3 bg-violet-50 border border-violet-200 rounded-xl text-violet-800 text-sm">
            โหมดทดสอบ — เปิดส่งรายงานได้ทุกวัน (เฉพาะเครื่อง dev)
          </div>
        )}

        {!devBypass && !weekday && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            วันนี้เป็นวันหยุด — ส่งรายงานได้เฉพาะวันจันทร์-ศุกร์
          </div>
        )}

        {!devBypass && weekday && !withinSubmitTime && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            หมดเวลาส่งรายงานวันนี้แล้ว — ส่งได้ถึง 19:00 น. เท่านั้น
          </div>
        )}

        {!devBypass && weekday && withinSubmitTime && (
          <div className="mb-6 p-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-700 text-xs">
            ส่งรายงานได้ถึง 19:00 น. ของวันนี้
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>ยังไม่มีห้อง/พื้นที่ในระบบ</p>
            <p className="text-sm mt-1">กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        ) : (
          <ReportForm rooms={rooms} canSubmit={canSubmit} />
        )}
      </div>
    </div>
  );
}
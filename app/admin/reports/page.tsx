"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faSearch,
  faTrash,
  faEye,
  faFolderOpen,
  faCheckCircle,
  faBroom,
  faFaceMeh,
  faTriangleExclamation,
  faCalendarDays,
  faChartBar,
  faDoorOpen,
  faDownload,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { ImageFolderView } from "@/components/reports/ImageFolderView";
import { ReportWithRoom, Room, CleanStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { ReportDetail } from "@/components/reports/ReportDetail";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatThaiDate, formatThaiDateTime, getBangkokDate, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { CLEAN_STATUS_CONFIG } from "@/lib/clean-status";

type ViewMode = "overview" | "room" | "list";

function getDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const start = new Date(from + "T12:00:00");
  const end = new Date(to + "T12:00:00");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 13);
  return d.toISOString().split("T")[0];
}

// ─── Mini bar chart ─────────────────────────────────────────────────
function TrendBar({ data }: { data: { date: string; submitted: number; total: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const pct = maxVal > 0 ? (d.submitted / maxVal) * 100 : 0;
        const isToday = d.date === getBangkokDate();
        const dateLabel = new Date(d.date + "T12:00:00").toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="w-full bg-gray-100 rounded-t relative h-16">
              <div
                className={cn(
                  "absolute bottom-0 w-full rounded-t transition-all duration-500",
                  pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"
                )}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className={cn("text-[9px] leading-none", isToday ? "text-red-600 font-bold" : "text-gray-400")}>
              {dateLabel}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d.submitted}/{d.total} ห้อง
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Room Compliance Grid ─────────────────────────────────────────────
function RoomComplianceGrid({
  rooms,
  reports,
  dates,
  onSelectReport,
}: {
  rooms: Room[];
  reports: ReportWithRoom[];
  dates: string[];
  onSelectReport: (r: ReportWithRoom) => void;
}) {
  const reportMap = useMemo(() => {
    const m = new Map<string, ReportWithRoom>();
    reports.forEach((r) => m.set(`${r.room_id}:${r.report_date}`, r));
    return m;
  }, [reports]);

  const visibleDates = dates.slice(-14);

  const statusDot: Record<CleanStatus, string> = {
    clean: "bg-emerald-400",
    partially_clean: "bg-amber-400",
    needs_attention: "bg-red-500",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10 px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-100 min-w-[120px]">
              ห้อง
            </th>
            {visibleDates.map((date) => {
              const isToday = date === getBangkokDate();
              const label = new Date(date + "T12:00:00").toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              });
              return (
                <th
                  key={date}
                  className={cn(
                    "px-1 py-2 text-center font-medium border-b border-gray-100 min-w-[40px]",
                    isToday ? "text-red-600" : "text-gray-400"
                  )}
                >
                  {label}
                </th>
              );
            })}
            <th className="px-3 py-2 text-center font-semibold text-gray-700 border-b border-gray-100 min-w-[60px]">
              อัตรา
            </th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => {
            const submitted = visibleDates.filter((d) => reportMap.has(`${room.id}:${d}`)).length;
            const rate = visibleDates.length > 0 ? Math.round((submitted / visibleDates.length) * 100) : 0;
            return (
              <tr key={room.id} className="hover:bg-gray-50/60">
                <td className="sticky left-0 bg-white z-10 px-3 py-2 font-medium text-gray-800 border-b border-gray-50 truncate max-w-[140px]">
                  {room.name}
                </td>
                {visibleDates.map((date) => {
                  const report = reportMap.get(`${room.id}:${date}`);
                  return (
                    <td key={date} className="px-1 py-2 text-center border-b border-gray-50">
                      {report ? (
                        <button
                          onClick={() => onSelectReport(report)}
                          className={cn(
                            "w-5 h-5 rounded-full inline-flex items-center justify-center mx-auto hover:scale-125 transition-transform",
                            statusDot[report.clean_status]
                          )}
                          title={`${room.name} — ${CLEAN_STATUS_CONFIG[report.clean_status].label}`}
                        />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-100 inline-block" />
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center border-b border-gray-50">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      rate >= 80 ? "text-emerald-600" : rate >= 50 ? "text-amber-600" : "text-red-500"
                    )}
                  >
                    {rate}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // Data
  const [reports, setReports] = useState<ReportWithRoom[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(getBangkokDate());
  const [search, setSearch] = useState("");

  // Modals
  const [selected, setSelected] = useState<ReportWithRoom | null>(null);
  const [folderReport, setFolderReport] = useState<ReportWithRoom | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Selected room drill-down ──
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      if (search) params.set("search", search);

      const [reportsRes, roomsRes] = await Promise.all([
        fetch(`/api/reports?${params}`),
        fetch("/api/rooms?active=false"),
      ]);
      const reportsData: ReportWithRoom[] = await reportsRes.json();
      const roomsData: Room[] = await roomsRes.json();

      setReports(Array.isArray(reportsData) ? reportsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData.filter((r) => r.is_active) : []);
    } catch {
      showToast("โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  }, [from, to, search, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบรายงานนี้?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("ลบรายงานสำเร็จ", "success");
      loadData();
    } catch {
      showToast("ลบรายงานไม่สำเร็จ", "error");
    } finally {
      setDeleting(null);
    }
  };

  // ─── Derived stats ─────────────────────────────────────────────────
  const dates = useMemo(() => getDateRange(from, to), [from, to]);

  const trendData = useMemo(() =>
    dates.slice(-14).map((date) => ({
      date,
      submitted: reports.filter((r) => r.report_date === date).length,
      total: rooms.length,
    })), [dates, reports, rooms]);

  const totalReports = reports.length;
  const cleanCount = reports.filter((r) => r.clean_status === "clean").length;
  const partialCount = reports.filter((r) => r.clean_status === "partially_clean").length;
  const needsCount = reports.filter((r) => r.clean_status === "needs_attention").length;

  // per-day compliance rate
  const avgRate = useMemo(() => {
    if (!rooms.length || !dates.length) return 0;
    const totalPossible = rooms.length * Math.min(dates.length, 14);
    return totalPossible > 0 ? Math.round((Math.min(trendData.reduce((s, d) => s + d.submitted, 0), totalPossible) / totalPossible) * 100) : 0;
  }, [trendData, rooms.length, dates.length]);

  // Room drill-down reports
  const roomReports = useMemo(() =>
    selectedRoom ? reports.filter((r) => r.room_id === selectedRoom.id) : [],
    [selectedRoom, reports]);

  const setPreset = (days: number) => {
    const d = new Date();
    const f = new Date(d);
    f.setDate(d.getDate() - (days - 1));
    setFrom(f.toISOString().split("T")[0]);
    setTo(d.toISOString().split("T")[0]);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 rounded-xl">
            <FontAwesomeIcon icon={faClipboardList} className="text-red-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
            <p className="text-sm text-gray-500">
              {formatThaiDate(from)} — {formatThaiDate(to)}
            </p>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {([
            { mode: "overview" as ViewMode, label: "ภาพรวม", icon: faChartBar },
            { mode: "room" as ViewMode, label: "รายห้อง", icon: faDoorOpen },
            { mode: "list" as ViewMode, label: "รายการ", icon: faClipboardList },
          ]).map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); setSelectedRoom(null); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                viewMode === mode
                  ? "bg-white text-red-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <FontAwesomeIcon icon={icon} className="text-xs" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Date filter ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          <FontAwesomeIcon icon={faCalendarDays} className="text-red-400" />
          <button onClick={() => setPreset(7)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-red-50 hover:text-red-700 transition-colors">7 วัน</button>
          <button onClick={() => setPreset(14)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-red-50 hover:text-red-700 transition-colors">14 วัน</button>
          <button onClick={() => setPreset(30)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-red-50 hover:text-red-700 transition-colors">30 วัน</button>
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:border-red-400 outline-none" />
            <span className="text-gray-400 text-sm">—</span>
            <input type="date" value={to} min={from} max={getBangkokDate()} onChange={(e) => setTo(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:border-red-400 outline-none" />
          </div>
          <a
            href={`/api/export?from=${from}&to=${to}`}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* ══════════════════════ OVERVIEW ══════════════════════ */}
          {viewMode === "overview" && (
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "รายงานทั้งหมด", value: totalReports, icon: faCheckCircle, bg: "bg-blue-50", ic: "text-blue-500", vc: "text-blue-700" },
                  { label: "สะอาดดี", value: cleanCount, icon: faBroom, bg: "bg-emerald-50", ic: "text-emerald-500", vc: "text-emerald-700" },
                  { label: "สะอาดพอใช้", value: partialCount, icon: faFaceMeh, bg: "bg-amber-50", ic: "text-amber-500", vc: "text-amber-700" },
                  { label: "ต้องปรับปรุง", value: needsCount, icon: faTriangleExclamation, bg: "bg-red-50", ic: "text-red-500", vc: "text-red-700" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                      <FontAwesomeIcon icon={s.icon} className={cn(s.ic)} />
                    </div>
                    <div>
                      <p className={cn("text-2xl font-bold tabular-nums", s.vc)}>{s.value}</p>
                      <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend + compliance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">แนวโน้มการส่งรายงาน</h3>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />ครบ</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />พอใช้</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />น้อย</span>
                    </div>
                  </div>
                  <TrendBar data={trendData} />
                </div>

                {/* Summary donut-style card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center gap-3">
                  <h3 className="font-semibold text-gray-800">อัตราการส่ง (14 วัน)</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={avgRate >= 80 ? "#10b981" : avgRate >= 50 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="3"
                          strokeDasharray={`${avgRate} ${100 - avgRate}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{avgRate}%</span>
                        <span className="text-[10px] text-gray-400">เฉลี่ย</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: "สะอาดดี", count: cleanCount, color: "bg-emerald-400" },
                      { label: "สะอาดพอใช้", count: partialCount, color: "bg-amber-400" },
                      { label: "ต้องปรับปรุง", count: needsCount, color: "bg-red-400" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full shrink-0", item.color)} />
                          <span className="text-gray-600">{item.label}</span>
                        </div>
                        <span className="font-semibold text-gray-700 tabular-nums">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Room quick stats */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-3">สรุปรายห้อง — คลิกเพื่อดูรายละเอียด</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {rooms.map((room) => {
                    const roomReps = reports.filter((r) => r.room_id === room.id);
                    const rRate = dates.length > 0 ? Math.round((roomReps.length / Math.min(dates.length, 14)) * 100) : 0;
                    const cleanR = roomReps.filter((r) => r.clean_status === "clean").length;
                    const needsR = roomReps.filter((r) => r.clean_status === "needs_attention").length;
                    return (
                      <button
                        key={room.id}
                        onClick={() => { setSelectedRoom(room); setViewMode("room"); }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 text-left transition-all"
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold",
                          rRate >= 80 ? "bg-emerald-50 text-emerald-600" : rRate >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                        )}>
                          {rRate}%
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">{room.name}</p>
                          <p className="text-xs text-gray-400">{roomReps.length} รายงาน · ดี {cleanR} · ต้องปรับ {needsR}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════ ROOM VIEW ══════════════════════ */}
          {viewMode === "room" && !selectedRoom && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-1">ตารางการส่งรายห้อง</h3>
                <p className="text-xs text-gray-400 mb-4">
                  <span className="inline-flex items-center gap-1 mr-3"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />สะอาดดี</span>
                  <span className="inline-flex items-center gap-1 mr-3"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />สะอาดพอใช้</span>
                  <span className="inline-flex items-center gap-1 mr-3"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />ต้องปรับปรุง</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-100 inline-block" />ไม่ได้ส่ง</span>
                </p>
                <RoomComplianceGrid
                  rooms={rooms}
                  reports={reports}
                  dates={dates}
                  onSelectReport={setSelected}
                />
              </div>
            </div>
          )}

          {/* ── Room drill-down ── */}
          {viewMode === "room" && selectedRoom && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedRoom(null)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                กลับไปตาราง
              </button>

              {/* Room header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedRoom.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {roomReports.length} รายงาน ใน {dates.length} วัน —{" "}
                      <span className={cn(
                        "font-semibold",
                        Math.round((roomReports.length / Math.max(dates.length, 1)) * 100) >= 80 ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {Math.round((roomReports.length / Math.max(dates.length, 1)) * 100)}% อัตราการส่ง
                      </span>
                    </p>
                  </div>
                </div>

                {/* Room stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "สะอาดดี", count: roomReports.filter((r) => r.clean_status === "clean").length, color: "text-emerald-700", bg: "bg-emerald-50" },
                    { label: "สะอาดพอใช้", count: roomReports.filter((r) => r.clean_status === "partially_clean").length, color: "text-amber-700", bg: "bg-amber-50" },
                    { label: "ต้องปรับปรุง", count: roomReports.filter((r) => r.clean_status === "needs_attention").length, color: "text-red-700", bg: "bg-red-50" },
                  ].map((s) => (
                    <div key={s.label} className={cn("rounded-xl p-3 text-center", s.bg)}>
                      <p className={cn("text-2xl font-bold", s.color)}>{s.count}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Room reports table */}
                <div className="divide-y divide-gray-50">
                  {roomReports.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">ไม่มีรายงานในช่วงนี้</p>
                  )}
                  {roomReports.map((report) => (
                    <div key={report.id} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{formatThaiDate(report.report_date)}</p>
                        <p className="text-xs text-gray-500">{report.reporter_name} · {formatThaiDateTime(report.submitted_at)}</p>
                      </div>
                      <StatusBadge status={report.clean_status} />
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setFolderReport(report)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600" title="โฟลเดอร์รูป">
                          <FontAwesomeIcon icon={faFolderOpen} className="text-xs" />
                        </button>
                        <button onClick={() => setSelected(report)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="ดูรายละเอียด">
                          <FontAwesomeIcon icon={faEye} className="text-xs" />
                        </button>
                        <button onClick={() => handleDelete(report.id)} disabled={deleting === report.id} className="p-2 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-50">
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════ LIST VIEW ══════════════════════ */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {/* Search */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อผู้รายงาน, รายละเอียด..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                </div>
                <Button onClick={loadData}>ค้นหา</Button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">{reports.length} รายการ</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-left">
                        <th className="px-4 py-3 font-medium">วันที่</th>
                        <th className="px-4 py-3 font-medium">ห้อง</th>
                        <th className="px-4 py-3 font-medium">ผู้รายงาน</th>
                        <th className="px-4 py-3 font-medium">สถานะ</th>
                        <th className="px-4 py-3 font-medium">เวลาส่ง</th>
                        <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-600">{formatThaiDate(report.report_date)}</td>
                          <td className="px-4 py-3 font-medium">
                            <button
                              onClick={() => { setSelectedRoom(rooms.find((r) => r.id === report.room_id) ?? null); setViewMode("room"); }}
                              className="hover:text-red-600 transition-colors text-left"
                            >
                              {report.room?.name}
                            </button>
                          </td>
                          <td className="px-4 py-3">{report.reporter_name}</td>
                          <td className="px-4 py-3"><StatusBadge status={report.clean_status} /></td>
                          <td className="px-4 py-3 text-gray-500">{formatThaiDateTime(report.submitted_at)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setFolderReport(report)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600" title="เปิดโฟลเดอร์รูป">
                                <FontAwesomeIcon icon={faFolderOpen} />
                              </button>
                              <button onClick={() => setSelected(report)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="ดูรายละเอียด">
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button onClick={() => handleDelete(report.id)} disabled={deleting === report.id} className="p-2 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-50">
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {reports.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-gray-400">ไม่พบรายงาน</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="รายละเอียดรายงาน" size="lg">
        {selected && (
          <ReportDetail
            report={selected}
            onOpenFolder={() => { setFolderReport(selected); setSelected(null); }}
          />
        )}
      </Modal>

      <Modal open={!!folderReport} onClose={() => setFolderReport(null)} title="โฟลเดอร์รูป" size="lg">
        {folderReport && (
          <ImageFolderView
            reportDate={folderReport.report_date}
            roomId={folderReport.room_id}
            roomName={folderReport.room?.name ?? "ไม่ระบุห้อง"}
          />
        )}
      </Modal>
    </div>
  );
}
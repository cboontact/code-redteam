"use client";

import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faCheckCircle,
  faClock,
  faEye,
  faCalendarDays,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons";
import { Room, ReportWithRoom } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { ReportDetail } from "@/components/reports/ReportDetail";
import { ImageFolderView } from "@/components/reports/ImageFolderView";
import { Spinner } from "@/components/ui/Spinner";
import { AdvisorInfo } from "@/components/rooms/AdvisorInfo";
import { getSupabaseClient } from "@/lib/supabase";
import {
  formatThaiDate,
  formatThaiDateTime,
  getBangkokDate,
  cn,
} from "@/lib/utils";

type StatusFilter = "all" | "submitted" | "pending";

interface RoomStatus {
  room: Room;
  report: ReportWithRoom | null;
}

interface ReportStatusViewProps {
  /** ถ้าเป็น admin จะแสดงปุ่มเปิดโฟลเดอร์รูปด้วย */
  isAdmin?: boolean;
}

export function ReportStatusView({ isAdmin = false }: ReportStatusViewProps) {
  const today = getBangkokDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportWithRoom | null>(null);
  const [folderReport, setFolderReport] = useState<ReportWithRoom | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const isToday = selectedDate === today;

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, reportsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch(`/api/reports?date=${selectedDate}`),
      ]);

      const roomsData: Room[] = await roomsRes.json();
      const reportsData: ReportWithRoom[] = await reportsRes.json();

      const reportMap = new Map(reportsData.map((r) => [r.room_id, r]));

      setRooms(
        roomsData.map((room) => ({
          room,
          report: reportMap.get(room.id) || null,
        }))
      );
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    setFilter("all");
  }, [selectedDate]);

  useEffect(() => {
    if (!isToday) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("reports-realtime-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        () => fetchStatus()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isToday, fetchStatus]);

  const submitted = rooms.filter((r) => r.report).length;
  const total = rooms.length;
  const pending = total - submitted;

  const filteredRooms = rooms.filter(({ report }) => {
    if (filter === "submitted") return !!report;
    if (filter === "pending") return !report;
    return true;
  });

  const filterLabels: Record<StatusFilter, string> = {
    all: "ทั้งหมด",
    submitted: "ส่งแล้ว",
    pending: "ยังไม่ส่ง",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-xl">
              <FontAwesomeIcon
                icon={faChartBar}
                className="text-red-600 text-xl"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isToday ? "สถานะวันนี้" : "สถานะรายงาน"}
              </h2>
              <p className="text-sm text-gray-500">
                {formatThaiDate(selectedDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 text-sm pointer-events-none"
              />
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none bg-white"
              />
            </div>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(today)}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                วันนี้
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                {
                  key: "submitted" as const,
                  count: submitted,
                  label: "ส่งแล้ว",
                  icon: faCheckCircle,
                  iconBg: "bg-emerald-50",
                  iconColor: "text-emerald-500",
                  countColor: "text-emerald-700",
                  labelColor: "text-emerald-600",
                  active: "ring-2 ring-emerald-200 border-emerald-300 bg-emerald-50/40",
                },
                {
                  key: "pending" as const,
                  count: pending,
                  label: "ยังไม่ส่ง",
                  icon: faClock,
                  iconBg: "bg-amber-50",
                  iconColor: "text-amber-500",
                  countColor: "text-amber-700",
                  labelColor: "text-amber-600",
                  active: "ring-2 ring-amber-200 border-amber-300 bg-amber-50/40",
                },
                {
                  key: "all" as const,
                  count: total,
                  label: "ทั้งหมด",
                  icon: faDoorOpen,
                  iconBg: "bg-gray-100",
                  iconColor: "text-gray-500",
                  countColor: "text-gray-700",
                  labelColor: "text-gray-500",
                  active: "ring-2 ring-gray-200 border-gray-300 bg-gray-50",
                },
              ] as const
            ).map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setFilter(card.key)}
                className={cn(
                  "flex items-center justify-center rounded-xl border px-3 py-4 min-h-[5.5rem] transition-all hover:shadow-md",
                  filter === card.key
                    ? card.active
                    : "border-gray-100 bg-white shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-11 h-11 shrink-0 rounded-xl flex items-center justify-center",
                      card.iconBg
                    )}
                  >
                    <FontAwesomeIcon
                      icon={card.icon}
                      className={cn(card.iconColor, "text-lg")}
                    />
                  </div>
                  <div className="text-center leading-tight">
                    <span
                      className={cn(
                        "block text-2xl sm:text-3xl font-bold tabular-nums leading-none",
                        card.countColor
                      )}
                    >
                      {card.count}
                    </span>
                    <span
                      className={cn(
                        "block text-xs font-semibold mt-1",
                        card.labelColor
                      )}
                    >
                      {card.label}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Room List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 px-1">
            แสดง {filteredRooms.length} รายการ —{" "}
            <span className="font-medium text-gray-700">
              {filterLabels[filter]}
            </span>
          </p>

          {filteredRooms.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
              ไม่มีรายการในหมวด {filterLabels[filter]}
            </div>
          )}

          {filteredRooms.map(({ room, report }) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  report ? "bg-emerald-50" : "bg-amber-50"
                }`}
              >
                <FontAwesomeIcon
                  icon={report ? faCheckCircle : faClock}
                  className={report ? "text-emerald-600" : "text-amber-500"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{room.name}</p>
                <AdvisorInfo
                  name={room.advisor_name}
                  phone={room.advisor_phone}
                  compact
                />
                {report ? (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {report.reporter_name} •{" "}
                      {formatThaiDateTime(report.submitted_at)}
                    </span>
                    <StatusBadge status={report.clean_status} />
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">ยังไม่ส่งรายงาน</p>
                )}
              </div>

              {report && (
                <button
                  onClick={() => setSelectedReport(report)}
                  className="p-2.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors shrink-0"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal รายละเอียดรายงาน */}
      <Modal
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="รายละเอียดรายงาน"
        size="lg"
      >
        {selectedReport && (
          <ReportDetail
            report={selectedReport}
            onOpenFolder={
              isAdmin
                ? () => {
                    setFolderReport(selectedReport);
                    setSelectedReport(null);
                  }
                : undefined
            }
          />
        )}
      </Modal>

      {/* Modal โฟลเดอร์รูป (admin only) */}
      {isAdmin && (
        <Modal
          open={!!folderReport}
          onClose={() => setFolderReport(null)}
          title="รูปภาพในโฟลเดอร์"
          size="lg"
        >
          {folderReport && (
            <ImageFolderView
              reportDate={folderReport.report_date}
              roomId={folderReport.room_id}
              roomName={folderReport.room?.name ?? ""}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

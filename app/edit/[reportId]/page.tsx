"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { ReportForm } from "@/components/reports/ReportForm";
import { Spinner } from "@/components/ui/Spinner";
import { Room, ReportWithRoom } from "@/lib/types";
import {
  formatThaiDate,
  isBeforeEditCutoff,
} from "@/lib/utils";

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  const [report, setReport] = useState<ReportWithRoom | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [reportRes, roomsRes] = await Promise.all([
          fetch(`/api/reports/${reportId}`),
          fetch("/api/rooms"),
        ]);

        if (!reportRes.ok) {
          setError("ไม่พบรายงาน");
          return;
        }

        const reportData: ReportWithRoom = await reportRes.json();
        const roomsData: Room[] = await roomsRes.json();

        if (!isBeforeEditCutoff(reportData.report_date)) {
          setError("แก้ไขได้เฉพาะก่อน 19:00 น. ของวันที่ส่งรายงาน");
          return;
        }

        setReport(reportData);
        setRooms(roomsData);
      } catch {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
          <p className="text-red-600 font-medium">{error || "ไม่พบรายงาน"}</p>
          <button
            onClick={() => router.push("/status")}
            className="mt-4 text-sm text-gray-500 hover:text-red-600"
          >
            กลับไปหน้าสถานะ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 rounded-xl">
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="text-red-600 text-xl"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">แก้ไขรายงาน</h2>
            <p className="text-sm text-gray-500">
              {report.room?.name} — {formatThaiDate(report.report_date)}
            </p>
          </div>
        </div>

        <ReportForm
          rooms={rooms}
          reportId={reportId}
          mode="edit"
          initialData={{
            room_id: report.room_id,
            report_date: report.report_date,
            reporter_name: report.reporter_name,
            reporter_phone: report.reporter_phone,
            description: report.description,
            clean_status: report.clean_status,
            images: report.images,
          }}
          onSuccess={() => router.push("/status")}
        />
      </div>
    </div>
  );
}
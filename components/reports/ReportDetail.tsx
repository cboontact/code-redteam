"use client";

import { EvidenceImage } from "./EvidenceImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faClock,
  faPenToSquare,
  faFolderOpen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ReportWithRoom } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatThaiDate,
  formatThaiDateTime,
  isBeforeEditCutoff,
} from "@/lib/utils";
import { EVIDENCE_SLOT_CLASS } from "@/lib/images";
import { AdvisorInfo } from "@/components/rooms/AdvisorInfo";
import Link from "next/link";

interface ReportDetailProps {
  report: ReportWithRoom;
  onOpenFolder?: () => void;
  isAdmin?: boolean;
  onDelete?: () => void;
}

export function ReportDetail({ report, onOpenFolder, isAdmin, onDelete }: ReportDetailProps) {
  const canEdit = isBeforeEditCutoff(report.report_date);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {report.room?.name}
          </h3>
          <p className="text-sm text-gray-500">
            {formatThaiDate(report.report_date)}
          </p>
          <AdvisorInfo
            name={report.room?.advisor_name}
            phone={report.room?.advisor_phone}
          />
        </div>
        <StatusBadge status={report.clean_status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <FontAwesomeIcon icon={faUser} className="text-red-400 w-4" />
          {report.reporter_name}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FontAwesomeIcon icon={faPhone} className="text-red-400 w-4" />
          {report.reporter_phone}
        </div>
        <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
          <FontAwesomeIcon icon={faClock} className="text-red-400 w-4" />
          ส่งเมื่อ {formatThaiDateTime(report.submitted_at)}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">
        {report.description}
      </div>

      {onOpenFolder && (
        <button
          type="button"
          onClick={onOpenFolder}
          className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-medium"
        >
          <FontAwesomeIcon icon={faFolderOpen} />
          เปิดโฟลเดอร์รูปของห้องนี้
        </button>
      )}

      {report.images?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {report.images.map((url, i) => (
            <div key={url} className={EVIDENCE_SLOT_CLASS}>
              <EvidenceImage src={url} alt={`รูป ${i + 1}`} />
              <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {canEdit && !isAdmin && (
        <Link
          href={`/edit/${report.id}`}
          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
          แก้ไขรายงาน (ก่อน 19:00 น.)
        </Link>
      )}

      {isAdmin && onDelete && (
        <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("ยืนยันการลบรายงานนี้? (รูปภาพทั้งหมดจะถูกลบด้วย)")) {
                onDelete();
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} />
            ลบรายงาน
          </button>
        </div>
      )}
    </div>
  );
}
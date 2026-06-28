"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faDoorOpen,
  faBroom,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { Room, CleanStatus } from "@/lib/types";
import {
  CLEAN_STATUS_CONFIG,
  CLEAN_STATUS_ORDER,
} from "@/lib/clean-status";
import { cn } from "@/lib/utils";
import {
  createImageSlots,
  createImageHashSlots,
  slotsToImages,
  validateReportImages,
  getFileHash,
} from "@/lib/images";
import {
  isAllowedImageFile,
  MAX_UPLOAD_BYTES,
  SUPPORTED_IMAGE_FORMATS_LABEL,
} from "@/lib/image-formats";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "./ImageUpload";
import { AdvisorInfo } from "@/components/rooms/AdvisorInfo";
import { useToast } from "@/components/ui/Toast";
import { getBangkokDate } from "@/lib/utils";

interface ReportFormProps {
  rooms: Room[];
  initialData?: {
    room_id: string;
    report_date?: string;
    reporter_name: string;
    reporter_phone: string;
    description: string;
    clean_status: CleanStatus;
    images: string[];
  };
  reportId?: string;
  mode?: "create" | "edit";
  canSubmit?: boolean;
  onSuccess?: () => void;
}

export function ReportForm({
  rooms,
  initialData,
  reportId,
  mode = "create",
  canSubmit = true,
  onSuccess,
}: ReportFormProps) {
  const { showToast } = useToast();
  const [roomId, setRoomId] = useState(initialData?.room_id || "");
  const [reporterName, setReporterName] = useState(
    initialData?.reporter_name || ""
  );
  const [reporterPhone, setReporterPhone] = useState(
    initialData?.reporter_phone || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [cleanStatus, setCleanStatus] = useState<CleanStatus>(
    initialData?.clean_status || "clean"
  );
  const [imageSlots, setImageSlots] = useState<(string | null)[]>(() =>
    createImageSlots(initialData?.images)
  );
  const [imageHashes, setImageHashes] = useState<(string | null)[]>(() =>
    createImageHashSlots()
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [verifyPhone, setVerifyPhone] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const resetForm = () => {
    setRoomId("");
    setReporterName("");
    setReporterPhone("");
    setDescription("");
    setCleanStatus("clean");
    setImageSlots(createImageSlots());
    setImageHashes(createImageHashSlots());
    setAlreadySubmitted(false);
    setUploadingSlot(null);
    setFormKey((key) => key + 1);
  };

  useEffect(() => {
    if (mode === "create" && roomId) {
      checkDuplicate(roomId);
    }
  }, [roomId, mode]);

  const checkDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/reports?room_id=${id}&today=true`);
      const data = await res.json();
      setAlreadySubmitted(data.exists);
    } catch {
      setAlreadySubmitted(false);
    }
  };

  const handleSlotChange = (slots: (string | null)[]) => {
    slots.forEach((url, index) => {
      if (!url) {
        setImageHashes((prev) => {
          const next = [...prev];
          next[index] = null;
          return next;
        });
      }
    });
    setImageSlots(slots);
  };

  const handleUpload = async (file: File, slotIndex: number) => {
    if (!roomId) {
      showToast("กรุณาเลือกห้องก่อนอัพโหลดรูป", "error");
      return;
    }

    if (!isAllowedImageFile(file)) {
      showToast(
        `รองรับเฉพาะไฟล์รูป (${SUPPORTED_IMAGE_FORMATS_LABEL})`,
        "error"
      );
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      showToast("ไฟล์ใหญ่เกินไป กรุณาใช้รูปไม่เกิน 20MB", "error");
      return;
    }

    setUploadingSlot(slotIndex);

    try {
      const hash = await getFileHash(file);
      const isDuplicate = imageHashes.some(
        (h, i) => i !== slotIndex && h === hash
      );
      if (isDuplicate) {
        showToast("รูปนี้ซ้ำกับช่องอื่น กรุณาเลือกรูปอื่น", "error");
        return;
      }

      const formData = new FormData();
      formData.append("files", file);
      formData.append("room_id", roomId);
      formData.append("slot", String(slotIndex + 1));
      formData.append(
        "report_date",
        initialData?.report_date || getBangkokDate()
      );

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "อัพโหลดไม่สำเร็จ");

      const remoteUrl = data.urls[0] as string;

      setImageSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = remoteUrl;
        return next;
      });

      setImageHashes((prev) => {
        const next = [...prev];
        next[slotIndex] = hash;
        return next;
      });

      showToast(`อัพโหลดรูปช่อง ${slotIndex + 1} สำเร็จ`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "อัพโหลดไม่สำเร็จ",
        "error"
      );
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !canSubmit) {
      showToast("ส่งรายงานได้ถึง 19:00 น. เท่านั้น", "error");
      return;
    }

    if (mode === "create" && alreadySubmitted) {
      showToast("ห้องนี้ส่งรายงานวันนี้แล้ว", "error");
      return;
    }

    const images = slotsToImages(imageSlots);
    const imageError = validateReportImages(images);
    if (imageError) {
      showToast(imageError, "error");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        room_id: roomId,
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        description,
        clean_status: cleanStatus,
        images,
        ...(mode === "edit" ? { verify_phone: verifyPhone } : {}),
      };

      const url = mode === "edit" ? `/api/reports/${reportId}` : "/api/reports";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ส่งรายงานไม่สำเร็จ");

      showToast(
        mode === "edit" ? "แก้ไขรายงานสำเร็จ" : "ส่งรายงานสำเร็จ",
        "success"
      );

      if (mode === "create") {
        resetForm();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      onSuccess?.();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "create" && alreadySubmitted && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ห้องนี้ส่งรายงานวันนี้แล้ว ไม่สามารถส่งซ้ำได้
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <FontAwesomeIcon icon={faDoorOpen} className="text-red-500 mr-2" />
          เลือกห้อง/พื้นที่
        </label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          disabled={mode === "edit"}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-white"
        >
          <option value="">-- เลือกห้อง/พื้นที่ --</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
              {room.area_description ? ` — ${room.area_description}` : ""}
            </option>
          ))}
        </select>
        {roomId && (
          <AdvisorInfo
            name={rooms.find((r) => r.id === roomId)?.advisor_name}
            phone={rooms.find((r) => r.id === roomId)?.advisor_phone}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <FontAwesomeIcon icon={faUser} className="text-red-500 mr-2" />
            ชื่อผู้รายงาน
          </label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            required
            placeholder="ชื่อ-นามสกุล"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <FontAwesomeIcon icon={faPhone} className="text-red-500 mr-2" />
            เบอร์โทรศัพท์
          </label>
          <input
            type="tel"
            value={reporterPhone}
            onChange={(e) => setReporterPhone(e.target.value)}
            required
            placeholder="08xxxxxxxx"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>
      </div>

      {mode === "edit" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <FontAwesomeIcon icon={faPhone} className="text-red-500 mr-2" />
            ยืนยันเบอร์โทรเพื่อแก้ไข
          </label>
          <input
            type="tel"
            value={verifyPhone}
            onChange={(e) => setVerifyPhone(e.target.value)}
            required
            placeholder="กรอกเบอร์ที่ใช้ส่งรายงาน"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FontAwesomeIcon icon={faBroom} className="text-red-500 mr-2" />
          สถานะความสะอาด
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CLEAN_STATUS_ORDER.map((status) => {
            const config = CLEAN_STATUS_CONFIG[status];
            const selected = cleanStatus === status;
            return (
              <label
                key={status}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium",
                  selected ? config.optionActive : config.option
                )}
              >
                <input
                  type="radio"
                  name="clean_status"
                  value={status}
                  checked={selected}
                  onChange={() => setCleanStatus(status)}
                  className="sr-only"
                />
                <FontAwesomeIcon
                  icon={config.icon}
                  className={cn("text-2xl", config.iconColor)}
                />
                {config.label}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <FontAwesomeIcon icon={faPen} className="text-red-500 mr-2" />
          รายละเอียดการทำความสะอาด
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="บรรยายสิ่งที่ทำ เช่น กวาดพื้น ถูบันได จุดไหนสะอาด/ไม่สะอาด"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none resize-none"
        />
      </div>

      <ImageUpload
        key={formKey}
        slots={imageSlots}
        onChange={handleSlotChange}
        uploadingSlot={uploadingSlot}
        onUpload={handleUpload}
      />

      <Button
        type="submit"
        loading={submitting}
        disabled={mode === "create" && (alreadySubmitted || !canSubmit)}
        className="w-full py-3.5 text-base"
      >
        {mode === "edit" ? "บันทึกการแก้ไข" : "ส่งรายงาน"}
      </Button>
    </form>
  );
}
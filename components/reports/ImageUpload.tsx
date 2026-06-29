"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SlotImage } from "./SlotImage";
import {
  faCamera,
  faTrash,
  faImage,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { REQUIRED_EVIDENCE_IMAGES, EVIDENCE_SLOT_CLASS } from "@/lib/images";
import { IMAGE_ACCEPT, isHeicLike } from "@/lib/image-formats";
import {
  createInstantPreview,
  createPreviewHandle,
  type PreviewHandle,
} from "@/lib/preview-image-client";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  slots: (string | null)[];
  onChange: (slots: (string | null)[]) => void;
  uploadingSlots: number[];
  onUpload: (file: File, slotIndex: number) => Promise<boolean>;
}

export function ImageUpload({
  slots,
  onChange,
  uploadingSlots,
  onUpload,
}: ImageUploadProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const previewHandles = useRef<(PreviewHandle | null)[]>(
    Array(REQUIRED_EVIDENCE_IMAGES).fill(null)
  );
  // generation counter ต่อ slot — เพิ่มทุกครั้งที่เลือกไฟล์ใหม่ เพื่อ abort async preview เก่า
  const previewGen = useRef<number[]>(Array(REQUIRED_EVIDENCE_IMAGES).fill(0));
  const [localPreviews, setLocalPreviews] = useState<(string | null)[]>(() =>
    Array<string | null>(REQUIRED_EVIDENCE_IMAGES).fill(null)
  );
  const filledCount = slots.filter(Boolean).length;

  const clearPreview = (index: number) => {
    previewHandles.current[index]?.revoke();
    previewHandles.current[index] = null;
    setLocalPreviews((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const setPreview = (index: number, handle: PreviewHandle) => {
    previewHandles.current[index]?.revoke();
    previewHandles.current[index] = handle;
    setLocalPreviews((prev) => {
      const next = [...prev];
      next[index] = handle.url;
      return next;
    });
  };

  const openSlot = (index: number) => {
    inputRefs.current[index]?.click();
  };

  const handleFile = async (index: number, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    // เพิ่ม generation ก่อนเริ่ม เพื่อ cancel async preview รอบก่อนหน้า
    const gen = ++previewGen.current[index];

    clearPreview(index);

    if (!isHeicLike(file)) {
      const instant = createInstantPreview(file);
      setPreview(index, instant);
    }

    // สร้าง optimized preview แบบ async โดยไม่บล็อก upload
    void createPreviewHandle(file).then((optimized) => {
      // ยกเลิกถ้า user เลือกไฟล์ใหม่ในช่องนี้แล้ว
      if (previewGen.current[index] !== gen) return;
      if (!optimized) return;
      setPreview(index, optimized);
    });

    try {
      const uploaded = await onUpload(file, index);
      if (!uploaded && previewGen.current[index] === gen) {
        clearPreview(index);
      }
    } finally {
      const input = inputRefs.current[index];
      if (input) input.value = "";
    }
  };

  const removeImage = (index: number) => {
    clearPreview(index);
    const next = [...slots];
    next[index] = null;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <FontAwesomeIcon icon={faCamera} className="text-red-500" />
        รูปภาพหลักฐาน ({filledCount}/{REQUIRED_EVIDENCE_IMAGES})
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: REQUIRED_EVIDENCE_IMAGES }, (_, index) => {
          const remoteUrl = slots[index];
          const displayUrl = localPreviews[index] ?? remoteUrl;
          const isUploading = uploadingSlots.includes(index);
          const hasImage = Boolean(displayUrl);
          const isUploaded = Boolean(remoteUrl);

          return (
            <div key={index} className="relative">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                onChange={(e) => handleFile(index, e.target.files)}
              />

              {hasImage || isUploading ? (
                <div
                  className={cn(
                    EVIDENCE_SLOT_CLASS,
                    "border-2 group flex items-center justify-center",
                    isUploaded ? "border-emerald-200" : "border-amber-200"
                  )}
                >
                  {displayUrl ? (
                    <SlotImage
                      src={displayUrl}
                      alt={`รูปที่ ${index + 1}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-amber-600 px-2 text-center">
                      <FontAwesomeIcon icon={faImage} className="text-lg" />
                      <span className="text-[10px] font-medium">
                        กำลังอัพโหลด...
                      </span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="text-xl text-red-500 animate-spin"
                      />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md z-10">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg z-10"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openSlot(index)}
                  className="h-36 sm:h-44 w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 hover:bg-red-50 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faImage} className="text-xl" />
                  <span className="text-[10px] font-medium">
                    ช่อง {index + 1}
                  </span>
                  <span className="text-[9px] text-red-400">จำเป็น</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderOpen,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@/components/ui/Spinner";
import { EVIDENCE_SLOT_CLASS } from "@/lib/images";
import { formatThaiDate } from "@/lib/utils";

interface FolderImage {
  name: string;
  url: string;
  path: string;
}

interface ImageFolderViewProps {
  reportDate: string;
  roomId: string;
  roomName: string;
}

export function ImageFolderView({
  reportDate,
  roomId,
  roomName,
}: ImageFolderViewProps) {
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("");
  const [images, setImages] = useState<FolderImage[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFolder() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          date: reportDate,
          room_id: roomId,
        });
        const res = await fetch(`/api/reports/images/folder?${params}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "โหลดโฟลเดอร์ไม่สำเร็จ");
        if (cancelled) return;

        setFolder(data.folder);
        setImages(data.images ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "โหลดโฟลเดอร์ไม่สำเร็จ"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFolder();
    return () => {
      cancelled = true;
    };
  }, [reportDate, roomId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600 text-center py-8">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <div className="p-2.5 bg-amber-50 rounded-lg shrink-0">
          <FontAwesomeIcon icon={faFolderOpen} className="text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{roomName}</p>
          <p className="text-sm text-gray-500">{formatThaiDate(reportDate)}</p>
          <p className="text-xs text-gray-400 mt-1 break-all font-mono">
            {folder}
          </p>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          ยังไม่มีรูปในโฟลเดอร์นี้
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((image, index) => (
            <a
              key={image.path}
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${EVIDENCE_SLOT_CLASS} group`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.name}
                className="absolute inset-0 w-full h-full object-contain p-1"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                {image.name.match(/^slot-(\d+)/)?.[1] ?? index + 1}
              </span>
              <span className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="text-[10px]"
                />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
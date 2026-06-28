"use client";

import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDoorOpen,
  faPlus,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Room } from "@/lib/types";
import { AdvisorInfo } from "@/components/rooms/AdvisorInfo";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

export default function AdminRoomsPage() {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [advisorName, setAdvisorName] = useState("");
  const [advisorPhone, setAdvisorPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms?active=false");
      const data = await res.json();
      setRooms(data);
    } catch {
      showToast("โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setAdvisorName("");
    setAdvisorPhone("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setName(room.name);
    setDescription(room.area_description || "");
    setAdvisorName(room.advisor_name || "");
    setAdvisorPhone(room.advisor_phone || "");
    setIsActive(room.is_active);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("กรุณาระบุชื่อห้อง", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/rooms/${editing.id}` : "/api/rooms";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          area_description: description || null,
          advisor_name: advisorName || null,
          advisor_phone: advisorPhone || null,
          is_active: isActive,
        }),
      });

      if (!res.ok) throw new Error();
      showToast(editing ? "แก้ไขสำเร็จ" : "เพิ่มห้องสำเร็จ", "success");
      setModalOpen(false);
      loadRooms();
    } catch {
      showToast("บันทึกไม่สำเร็จ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบห้องนี้?")) return;

    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("ลบห้องสำเร็จ", "success");
      loadRooms();
    } catch {
      showToast("ลบห้องไม่สำเร็จ", "error");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 rounded-xl">
            <FontAwesomeIcon icon={faDoorOpen} className="text-red-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง/พื้นที่</h1>
            <p className="text-sm text-gray-500">{rooms.length} ห้อง</p>
          </div>
        </div>
        <Button onClick={openCreate} icon={<FontAwesomeIcon icon={faPlus} />}>
          เพิ่มห้อง
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{room.name}</p>
                  {!room.is_active && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      ปิดใช้งาน
                    </span>
                  )}
                </div>
                {room.area_description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {room.area_description}
                  </p>
                )}
                <AdvisorInfo
                  name={room.advisor_name}
                  phone={room.advisor_phone}
                  compact
                />
              </div>
              <button
                onClick={() => openEdit(room)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "แก้ไขห้อง" : "เพิ่มห้องใหม่"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              ชื่อห้อง/พื้นที่
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              placeholder="เช่น ม.4/1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              คำอธิบายพื้นที่
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              placeholder="เช่น ห้องเรียนชั้น ม.4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              ชื่อครูที่ปรึกษา
            </label>
            <input
              type="text"
              value={advisorName}
              onChange={(e) => setAdvisorName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              placeholder="เช่น ครูสมชาย ใจดี"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              เบอร์โทรครูที่ปรึกษา
            </label>
            <input
              type="tel"
              value={advisorPhone}
              onChange={(e) => setAdvisorPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              placeholder="08xxxxxxxx"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            เปิดใช้งาน
          </label>
          <Button onClick={handleSave} loading={saving} className="w-full">
            บันทึก
          </Button>
        </div>
      </Modal>
    </div>
  );
}
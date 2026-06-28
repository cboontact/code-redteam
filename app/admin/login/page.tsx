"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faUser,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");

      showToast("เข้าสู่ระบบสำเร็จ", "success");
      router.push("/admin/dashboard");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <FontAwesomeIcon icon={faShieldHalved} className="text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">เข้าสู่ระบบผู้ดูแล</p>
              <p className="text-xs text-gray-400">คณะสีแดง โรงเรียนจอมทอง</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <FontAwesomeIcon icon={faUser} className="text-red-400 mr-2" />
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <FontAwesomeIcon icon={faLock} className="text-red-400 mr-2" />
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full py-3.5">
            เข้าสู่ระบบ
          </Button>
        </form>
      </div>
    </div>
  );
}
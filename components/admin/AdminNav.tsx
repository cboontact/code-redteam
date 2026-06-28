"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faClipboardList,
  faDoorOpen,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const navItems = [
  { href: "/admin/dashboard", label: "แดชบอร์ด", icon: faChartPie },
  { href: "/admin/reports", label: "รายงาน", icon: faClipboardList },
  { href: "/admin/rooms", label: "ห้อง/พื้นที่", icon: faDoorOpen },
];

function NavLink({
  href,
  label,
  icon,
  pathname,
  compact,
}: {
  href: string;
  label: string;
  icon: typeof faChartPie;
  pathname: string;
  compact?: boolean;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center whitespace-nowrap rounded-xl font-medium transition-colors",
        compact ? "gap-2 px-3 py-2 text-xs" : "gap-2.5 px-3 py-2.5 text-sm",
        active
          ? "bg-red-600 text-white shadow-sm shadow-red-200"
          : "text-gray-600 hover:bg-red-50 hover:text-red-700"
      )}
    >
      <FontAwesomeIcon icon={icon} className="shrink-0" />
      {label}
    </Link>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    showToast("ออกจากระบบแล้ว", "success");
    router.push("/admin/login");
  };

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 self-start flex-col border-r border-gray-100 bg-white shadow-sm md:flex">
        <div className="border-b border-gray-100 px-4 py-4 text-center">
          <Image
            src="/logo.png"
            alt="โรงเรียนจอมทอง"
            width={48}
            height={48}
            className="rounded-xl mb-2.5 mx-auto"
          />
          <h2 className="text-base font-bold text-red-700">
            ผู้ดูแลระบบ
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            คณะสีแดง โรงเรียนจอมทอง
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="shrink-0" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Mobile */}
      <header className="sticky top-0 z-40 shrink-0 border-b border-gray-100 bg-white md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Image
            src="/logo.png"
            alt="โรงเรียนจอมทอง"
            width={32}
            height={32}
            className="rounded-lg shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-red-700">ผู้ดูแลระบบ</p>
            <p className="text-[10px] text-gray-400">คณะสีแดง จอมทอง</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-50"
            aria-label="ออกจากระบบ"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} compact />
          ))}
        </nav>
      </header>
    </>
  );
}
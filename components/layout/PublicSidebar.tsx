"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faChartBar,
  faBookOpen,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ส่งรายงาน", icon: faClipboardList },
  { href: "/status", label: "สถานะรายงาน", icon: faChartBar },
  { href: "/guide", label: "คู่มือ", icon: faBookOpen },
  { href: "/admin/login", label: "ผู้ดูแล", icon: faShieldHalved },
];

function NavLink({
  href,
  label,
  icon,
  active,
  compact,
}: {
  href: string;
  label: string;
  icon: typeof faClipboardList;
  active: boolean;
  compact?: boolean;
}) {
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

export function PublicSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop — กว้างพอดีเนื้อหา */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 self-start flex-col border-r border-gray-100 bg-white shadow-sm md:flex">
        <div className="border-b border-gray-100 px-4 py-4 text-center">
          <Image
            src="/logo.png"
            alt="โรงเรียนจอมทอง"
            width={48}
            height={48}
            className="rounded-xl mb-2.5 mx-auto"
          />
          <h1 className="text-sm font-bold text-red-700 leading-snug">
            ระบบรายงานการทำความสะอาด
          </h1>
          <p className="text-xs text-gray-500 mt-1.5">
            คณะสีแดง โรงเรียนจอมทอง
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile */}
      <header className="sticky top-0 z-40 shrink-0 border-b border-gray-100 bg-white md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Image
            src="/logo.png"
            alt="โรงเรียนจอมทอง"
            width={36}
            height={36}
            className="rounded-lg shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-red-700 leading-snug">
              ระบบรายงานการทำความสะอาด
            </p>
            <p className="text-xs text-gray-500">
              คณะสีแดง โรงเรียนจอมทอง
            </p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
              compact
            />
          ))}
        </nav>
      </header>
    </>
  );
}
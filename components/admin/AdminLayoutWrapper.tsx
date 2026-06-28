"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "./AdminNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <AdminNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-w-0 flex-1">{children}</div>
        <SiteFooter />
      </div>
    </div>
  );
}
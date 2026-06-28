"use client";

import { usePathname } from "next/navigation";
import { PublicSidebar } from "./PublicSidebar";
import { SiteFooter } from "./SiteFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminApp =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminApp) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] md:flex-row">
      <PublicSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-w-0 flex-1">{children}</div>
        <SiteFooter />
      </div>
    </div>
  );
}
"use client";

import { ReportStatusView } from "@/components/reports/ReportStatusView";

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <ReportStatusView isAdmin />
    </div>
  );
}
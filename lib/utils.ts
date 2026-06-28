import { CleanStatus } from "./types";
import { CLEAN_STATUS_CONFIG } from "./clean-status";

export const REPORT_CUTOFF_HOUR = 19;

/** เปิดใน .env.local เฉพาะตอนทดสอบบนเครื่อง dev (npm run dev) */
export function isDevBypassReportRules(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_REPORT_RULES === "true"
  );
}

export function getBangkokDate(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}

export function getBangkokDateTime(date = new Date()): Date {
  const str = date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
  return new Date(str);
}

export function isBeforeReportCutoff(forDate?: string): boolean {
  const now = getBangkokDateTime();
  const today = getBangkokDate(now);
  const date = forDate || today;
  if (date !== today) return false;
  return now.getHours() < REPORT_CUTOFF_HOUR;
}

export function canSubmitReportToday(): boolean {
  if (isDevBypassReportRules()) return true;
  return isWeekday() && isBeforeReportCutoff();
}

export function isReportSubmissionOpen(): boolean {
  return canSubmitReportToday();
}

export function isBeforeEditCutoff(reportDate: string): boolean {
  return isBeforeReportCutoff(reportDate);
}

export function isWeekday(dateStr?: string): boolean {
  const date = dateStr
    ? new Date(dateStr + "T12:00:00")
    : getBangkokDateTime();
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export const CLEAN_STATUS_LABELS: Record<CleanStatus, string> = {
  clean: CLEAN_STATUS_CONFIG.clean.label,
  partially_clean: CLEAN_STATUS_CONFIG.partially_clean.label,
  needs_attention: CLEAN_STATUS_CONFIG.needs_attention.label,
};

export const CLEAN_STATUS_COLORS: Record<CleanStatus, string> = {
  clean: CLEAN_STATUS_CONFIG.clean.badge,
  partially_clean: CLEAN_STATUS_CONFIG.partially_clean.badge,
  needs_attention: CLEAN_STATUS_CONFIG.needs_attention.badge,
};

export function formatThaiDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function formatThaiDateTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length >= 9 && digits.length <= 10;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
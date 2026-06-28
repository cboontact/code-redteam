export type CleanStatus = "clean" | "partially_clean" | "needs_attention";

export interface Room {
  id: string;
  name: string;
  area_description: string | null;
  advisor_name: string | null;
  advisor_phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  room_id: string;
  report_date: string;
  reporter_name: string;
  reporter_phone: string;
  description: string;
  clean_status: CleanStatus;
  images: string[];
  submitted_at: string;
  updated_at: string | null;
  room?: Room;
}

export interface ReportWithRoom extends Report {
  room: Room;
}

export interface AdminSession {
  username: string;
  isAdmin: true;
}
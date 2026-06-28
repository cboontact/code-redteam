-- ระบบรายงานการทำความสะอาด คณะสีแดง โรงเรียนจอมทอง

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area_description text,
  advisor_name text,
  advisor_phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  reporter_name text NOT NULL,
  reporter_phone text NOT NULL,
  description text NOT NULL,
  clean_status text NOT NULL CHECK (clean_status IN ('clean', 'partially_clean', 'needs_attention')),
  images text[] DEFAULT '{}',
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  UNIQUE(room_id, report_date)
);

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_room ON reports(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);

-- Storage bucket: report-images (สร้างใน Supabase Dashboard หรือใช้คำสั่งด้านล่าง)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true);
-- โครงสร้างโฟลเดอร์: YYYY-MM-DD/{room_id}/slot-1.webp ... slot-6.webp

-- ข้อมูลตัวอย่างห้อง
INSERT INTO rooms (name, area_description) VALUES
  ('ม.1/1', 'ห้องเรียนชั้นมัธยมศึกษาปีที่ 1'),
  ('ม.1/2', 'ห้องเรียนชั้นมัธยมศึกษาปีที่ 1'),
  ('ม.2/1', 'ห้องเรียนชั้นมัธยมศึกษาปีที่ 2'),
  ('ม.3/1', 'ห้องเรียนชั้นมัธยมศึกษาปีที่ 3'),
  ('ม.4/1', 'ห้องเรียนชั้นมัธยมศึกษาปีที่ 4'),
  ('บริเวณโรงอาหาร', 'พื้นที่รอบโรงอาหารและทางเดิน'),
  ('ลานกีฬา', 'ลานกีฬาหน้าอาคารเรียน')
ON CONFLICT DO NOTHING;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
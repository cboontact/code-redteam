#!/usr/bin/env node
// scripts/seed-rooms.mjs
// รัน: node scripts/seed-rooms.mjs
// จะ upsert ข้อมูลเวรรับผิดชอบพื้นที่คณะสีแดงเข้า Supabase

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// โหลด .env.local
const envPath = resolve(__dirname, "../.env.local");
const env = {};
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match) {
      env[match[1]] = match[2].replace(/\\\$/g, "$");
    }
  }
} catch {
  console.error("❌ ไม่พบ .env.local");
  process.exit(1);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── ข้อมูลเวรรับผิดชอบพื้นที่คณะสีแดง ───────────────────────────────────
const rooms = [
  {
    name: "ม.1/2",
    area_description:
      "หน้าอาคาร 6 (แนวถนนถึงห้องน้ำหญิง ไม่รวมทางเดินคอปเปอร์เวย์) และหน้าอาคาร 2 (ไม่รวมถนนหน้าอาคาร 2)",
    is_active: true,
  },
  {
    name: "ม.1/5",
    area_description:
      "สนามหญ้าหน้าอาคาร 6 และพื้นที่โดยรอบอาคารอ่างกาหลวง (ไม่รวมถนน)",
    is_active: true,
  },
  {
    name: "ม.2/2",
    area_description:
      "ภายในอาคาร 6 ฝั่งซ้าย (ห้อง 6004 เป็นต้นไป) และสนามด้านหลังอาคาร 6 (ไม่รวมพื้นที่หน้าโรงอาหาร)",
    is_active: true,
  },
  {
    name: "ม.2/6",
    area_description:
      "ถนนหน้าอาคารผาหมอนและบริเวณโดมผาดอกเสี้ยว จนถึงแนวขอบหอประชุม",
    is_active: true,
  },
  {
    name: "ม.2/11",
    area_description:
      "พื้นที่ด้านหลังตรงข้ามอาคาร 6 ครึ่งหนึ่งของอาคารดอยหลวง รวมทั้งถนนด้านซ้ายและด้านขวา",
    is_active: true,
  },
  {
    name: "ม.3/1",
    area_description:
      "บันไดทางลงเวทีเถาวัลย์ จนถึงทางข้ามไปยังศาลาริมน้ำ",
    is_active: true,
  },
  {
    name: "ม.3/4",
    area_description:
      "ภายในอาคาร 6 ฝั่งขวา (ห้อง 6005 เป็นต้นไป) และสนามด้านหลังอาคาร 6 (ไม่รวมพื้นที่หน้าโรงอาหาร)",
    is_active: true,
  },
  {
    name: "ม.3/12",
    area_description:
      "โดมผาดอกเสี้ยว ตั้งแต่แนวหอประชุมอินทนนท์ไปจนถึงพื้นที่ด้านหลัง",
    is_active: true,
  },
  {
    name: "ม.4/7",
    area_description:
      "พื้นที่ด้านหน้าครึ่งหนึ่งของอาคารดอยหลวง รวมทั้งถนนด้านซ้ายและด้านขวา ตลอดจนบริเวณโต๊ะปิงปอง",
    is_active: true,
  },
  {
    name: "ม.4/12",
    area_description:
      "สวนหน้าห้องพละ พื้นที่ออกกำลังกาย ศาลาน้ำดื่ม และสนามวอลเลย์บอล (ไม่รวมถนน)",
    is_active: true,
  },
  {
    name: "ม.5/1",
    area_description:
      "ด้านข้างฝั่งซ้ายของอาคารอ่างกาหลวง และทางเดินคอปเปอร์เวย์ตลอดแนวจนถึงเวทีเถาวัลย์",
    is_active: true,
  },
  {
    name: "ม.5/5",
    area_description:
      "หน้าห้องนาฏศิลป์ ห้องคอมพิวเตอร์ 6002 ทางเดิน ถนน จนถึงแนวขอบอาคารดอยหลวง รวมทั้งห้องน้ำชายและห้องน้ำหญิง",
    is_active: true,
  },
  {
    name: "ม.5/10",
    area_description:
      "อาคารจีนและพื้นที่สนามครึ่งหนึ่ง (ใช้แนวสนามฟุตบอลเป็นเส้นแบ่ง) รวมทั้งทางเดินคอปเปอร์เวย์และบริเวณโต๊ะฮอต",
    is_active: true,
  },
  {
    name: "ม.6/3",
    area_description:
      "ถนนหน้าอาคารอ่างกาหลวง บริเวณโต๊ะฮอต และพื้นที่สนามฟุตซอลครึ่งหนึ่ง (ใช้แนวสนามฟุตบอลเป็นเส้นแบ่ง)",
    is_active: true,
  },
  {
    name: "ม.6/11 และ ม.6/12",
    area_description:
      "ทางเดินตั้งแต่ขอบโดมผาดอกเสี้ยว สวนหย่อมทางขึ้นหอประชุม ถนนหน้าสนามวอลเลย์บอล ศาลาก๊อกน้ำ และพื้นที่โดยรอบหอประชุมอินทนนท์",
    is_active: true,
  },
];

async function main() {
  console.log("🔄 กำลัง upsert ข้อมูลเวรรับผิดชอบพื้นที่คณะสีแดง...\n");

  // ดึงห้องที่มีอยู่แล้ว
  const { data: existing } = await supabase.from("rooms").select("id, name");
  const existingMap = new Map((existing ?? []).map((r) => [r.name, r.id]));

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const room of rooms) {
    const existingId = existingMap.get(room.name);

    if (existingId) {
      // อัพเดท
      const { error } = await supabase
        .from("rooms")
        .update({
          area_description: room.area_description,
          is_active: room.is_active,
        })
        .eq("id", existingId);

      if (error) {
        console.error(`  ❌ อัพเดท ${room.name}: ${error.message}`);
        errors++;
      } else {
        console.log(`  ✏️  อัพเดท  ${room.name}`);
        updated++;
      }
    } else {
      // แทรกใหม่
      const { error } = await supabase.from("rooms").insert(room);

      if (error) {
        console.error(`  ❌ แทรก ${room.name}: ${error.message}`);
        errors++;
      } else {
        console.log(`  ✅ แทรกใหม่ ${room.name}`);
        inserted++;
      }
    }
  }

  console.log(`
────────────────────────────────
✅ แทรกใหม่  : ${inserted} ห้อง
✏️  อัพเดท   : ${updated} ห้อง
❌ ผิดพลาด  : ${errors} ห้อง
────────────────────────────────
  `);

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

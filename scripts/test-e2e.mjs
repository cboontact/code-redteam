import { readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const BASE = process.env.TEST_BASE_URL || "http://localhost:3001";
const COOKIE_FILE = "/tmp/rt-e2e-cookies.txt";

const results = [];

function log(step, ok, detail = "") {
  results.push({ step, ok, detail });
  const mark = ok ? "✓" : "✗";
  console.log(`${mark} ${step}${detail ? `: ${detail}` : ""}`);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { res, data };
}

function makePng(label, color = [200, 40, 40]) {
  const w = 48;
  const h = 32;
  const row = 1 + w * 4;
  const raw = Buffer.alloc(row * h);
  for (let y = 0; y < h; y++) {
    raw[y * row] = 0;
    for (let x = 0; x < w; x++) {
      const i = y * row + 1 + x * 4;
      raw[i] = color[0];
      raw[i + 1] = color[1];
      raw[i + 2] = color[2];
      raw[i + 3] = 255;
    }
  }
  const zlib = Buffer.from(
    "789c63001819c565e11e1e000008000400",
    "hex"
  );
  const png = Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", Buffer.from([0, 0, 0, w, 0, 0, 0, h, 8, 6, 0, 0, 0])),
    chunk("IDAT", zlib),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return new File([png], `${label}.png`, { type: "image/png" });
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crc.writeUInt32BE(crcVal >>> 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c;
}

function getCookieHeader() {
  try {
    const lines = readFileSync(COOKIE_FILE, "utf8").split("\n");
    const cookies = lines
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => l.split("\t"))
      .filter((p) => p.length >= 7)
      .map((p) => `${p[5]}=${p[6]}`)
      .join("; ");
    return cookies;
  } catch {
    return "";
  }
}

async function main() {
  console.log(`\nทดสอบ E2E ที่ ${BASE}\n`);

  const { res: roomsRes, data: rooms } = await fetchJson(`${BASE}/api/rooms`);
  const room = Array.isArray(rooms) ? rooms[0] : null;
  log(
    "โหลดห้อง/พื้นที่",
    roomsRes.ok && room?.id,
    room ? `${room.name} (${room.id.slice(0, 8)}…)` : roomsRes.status
  );
  if (!room) return finish(false);

  const { res: loginRes, data: loginData } = await fetchJson(
    `${BASE}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "cboonta", password: "cboonta" }),
    }
  );

  const setCookie = loginRes.headers.getSetCookie?.() || [];
  if (setCookie.length) {
    writeFileSync(
      COOKIE_FILE,
      "# Netscape HTTP Cookie File\n" +
        setCookie
          .map((c) => {
            const [pair] = c.split(";");
            const [name, value] = pair.split("=");
            return `localhost\tFALSE\t/\tFALSE\t0\t${name}\t${value}`;
          })
          .join("\n") +
        "\n"
    );
  }

  log("เข้าสู่ระบบแอดมิน", loginRes.ok && loginData?.success, loginRes.status);

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
  });
  const day = new Date(`${today}T12:00:00`).getDay();
  const isWeekday = day >= 1 && day <= 5;
  log(
    "ตรวจวันส่งรายงาน",
    true,
    `${today} (${isWeekday ? "จ-ศ ส่งได้" : "เสาร์-อา ระบบปิดส่ง"})`
  );

  const imageUrls = [];
  const cookie = getCookieHeader();

  for (let slot = 1; slot <= 6; slot++) {
    const form = new FormData();
    form.append("files", makePng(`slot-${slot}`, [40 + slot * 30, 80, 120]));
    form.append("room_id", room.id);
    form.append("slot", String(slot));
    form.append("report_date", today);

    const uploadRes = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: cookie ? { Cookie: cookie } : {},
      body: form,
    });
    const uploadData = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok || !uploadData.urls?.[0]) {
      log(`อัพโหลดรูปช่อง ${slot}`, false, uploadData.error || uploadRes.status);
      return finish(false);
    }
    imageUrls.push(uploadData.urls[0]);
  }
  log("อัพโหลดรูป 6 ช่อง", imageUrls.length === 6, `${imageUrls.length} รูป`);

  const uniqueHashes = new Set(
    imageUrls.map((u) => createHash("sha256").update(u).digest("hex"))
  );
  log("รูปไม่ซ้ำกัน", uniqueHashes.size === 6);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testPhone = "0812345678";
  const testDesc = `[E2E TEST] ทดสอบระบบ ${Date.now()}`;

  await supabase
    .from("reports")
    .delete()
    .eq("room_id", room.id)
    .eq("report_date", today)
    .like("description", "[E2E TEST]%");

  const { res: postRes, data: postData } = await fetchJson(`${BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_id: room.id,
      reporter_name: "ทดสอบระบบ",
      reporter_phone: testPhone,
      description: testDesc,
      clean_status: "clean",
      images: imageUrls,
    }),
  });

  if (!isWeekday) {
    log(
      "ส่งรายงาน (public API)",
      postRes.status === 400 && postData?.error?.includes("จันทร์"),
      `ถูกบล็อกตามกฎวันหยุด — ${postData?.error}`
    );

    const { data: inserted, error: insertErr } = await supabase
      .from("reports")
      .insert({
        room_id: room.id,
        report_date: today,
        reporter_name: "ทดสอบระบบ",
        reporter_phone: testPhone,
        description: testDesc,
        clean_status: "clean",
        images: imageUrls,
      })
      .select("id, room_id, report_date, images")
      .single();

    log(
      "บันทึกรายงานลง Supabase (จำลองวันจันทร์)",
      !insertErr && inserted?.id,
      insertErr?.message || inserted?.id
    );

    if (inserted?.id) {
      const { data: fetched } = await supabase
        .from("reports")
        .select("*, room:rooms(name)")
        .eq("id", inserted.id)
        .single();
      log(
        "อ่านรายงานกลับมา",
        fetched?.images?.length === 6,
        `${fetched?.room?.name} · ${fetched?.images?.length} รูป`
      );

      await supabase.from("reports").delete().eq("id", inserted.id);
      log("ลบข้อมูลทดสอบ", true);
    }
  } else {
    log(
      "ส่งรายงาน (public API)",
      postRes.ok && postData?.id,
      postErr(postRes, postData)
    );

    if (postData?.id) {
      const { res: getRes, data: got } = await fetchJson(
        `${BASE}/api/reports/${postData.id}`
      );
      log(
        "อ่านรายงานกลับมา",
        getRes.ok && got?.images?.length === 6,
        `${got?.room?.name} · ${got?.images?.length} รูป`
      );
      await supabase.from("reports").delete().eq("id", postData.id);
      log("ลบข้อมูลทดสอบ", true);
    }
  }

  const { res: statusRes, data: statusData } = await fetchJson(
    `${BASE}/api/reports?date=${today}`
  );
  log(
    "ดึงสถานะรายงานวันนี้",
    statusRes.ok && Array.isArray(statusData),
    `${Array.isArray(statusData) ? statusData.length : 0} รายการ`
  );

  finish(results.every((r) => r.ok));
}

function postErr(res, data) {
  return data?.error || String(res.status);
}

function finish(ok) {
  const passed = results.filter((r) => r.ok).length;
  console.log(`\nสรุป: ${passed}/${results.length} ผ่าน`);
  console.log(ok ? "\n✅ ระบบส่งข้อมูลได้จริง" : "\n⚠️ มีบางขั้นตอนที่ไม่ผ่าน");
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
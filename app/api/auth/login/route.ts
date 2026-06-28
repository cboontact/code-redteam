import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminToken,
  getSessionCookieOptions,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { success } = rateLimit(`login:${ip}`, 5, 300_000);

  if (!success) {
    return NextResponse.json(
      { error: "ลองเข้าสู่ระบบบ่อยเกินไป" },
      { status: 429 }
    );
  }

  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
      { status: 400 }
    );
  }

  const valid = await verifyAdminCredentials(username, password);

  if (!valid) {
    return NextResponse.json(
      { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  const token = await createAdminToken(username);
  const cookieOptions = getSessionCookieOptions();
  const response = NextResponse.json({ success: true, username });

  response.cookies.set(cookieOptions.name, token, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    maxAge: cookieOptions.maxAge,
  });

  return response;
}
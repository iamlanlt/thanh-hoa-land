import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { clearAdminSession, createAdminSession } from "@/lib/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.toLowerCase().trim() || "unknown";
  const rate = checkRateLimit(
    `admin-login:${getClientIp(request)}:${email}`,
    5,
    15 * 60 * 1000,
  );

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  if (!body?.email || !body.password) {
    return NextResponse.json(
      { error: "Email và mật khẩu là bắt buộc" },
      { status: 400 },
    );
  }

  let valid = false;
  try {
    if (isDatabaseConfigured) {
      const admin = await prisma.adminUser.findUnique({ where: { email } });
      valid = Boolean(
        admin && (await compare(body.password, admin.passwordHash)),
      );
    } else {
      valid =
        email === (process.env.ADMIN_EMAIL || "admin@example.com") &&
        body.password === process.env.ADMIN_PASSWORD;
    }
  } catch {
    return NextResponse.json(
      { error: "Không thể kiểm tra đăng nhập lúc này." },
      { status: 503 },
    );
  }

  if (!valid) {
    return NextResponse.json(
      { error: "Email hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}

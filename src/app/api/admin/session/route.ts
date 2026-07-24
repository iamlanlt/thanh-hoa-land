import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { clearAdminSession, createAdminSession } from "@/lib/auth";
import { canUseEnvironmentAdminFallback } from "@/lib/auth-policy";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logServerError } from "@/lib/api-errors";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.toLowerCase().trim() || "unknown";
  if (process.env.NODE_ENV === "production" && !isDatabaseConfigured) {
    return NextResponse.json(
      { error: "Đăng nhập quản trị chưa được cấu hình." },
      { status: 503 },
    );
  }

  let rate;
  try {
    rate = await checkRateLimit(
      `admin-login:${getClientIp(request)}:${email}`,
      5,
      15 * 60 * 1000,
    );
  } catch (error) {
    logServerError("admin.session.rate-limit", error);
    return NextResponse.json(
      { error: "Không thể kiểm tra giới hạn đăng nhập lúc này." },
      { status: 503 },
    );
  }

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
    } else if (
      canUseEnvironmentAdminFallback(process.env.NODE_ENV, isDatabaseConfigured)
    ) {
      const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      valid =
        Boolean(adminEmail) &&
        email === adminEmail &&
        body.password === process.env.ADMIN_PASSWORD;
    }
  } catch (error) {
    logServerError("admin.session.authenticate", error);
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

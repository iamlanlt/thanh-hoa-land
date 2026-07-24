import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function requireAdmin() {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function requireDatabase() {
  if (isDatabaseConfigured) return null;
  return NextResponse.json(
    { error: "Chưa cấu hình DATABASE_URL" },
    { status: 503 },
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  errorMessage = "Dữ liệu không hợp lệ",
) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (parsed.success) return { data: parsed.data, error: null } as const;
  return {
    data: null,
    error: NextResponse.json(
      { error: errorMessage, details: z.flattenError(parsed.error) },
      { status: 400 },
    ),
  } as const;
}

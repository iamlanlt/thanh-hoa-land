import { NextResponse } from "next/server";
import { requireAdmin, requireDatabase } from "@/lib/api-guards";
import { getPublicSettings, updateSettings } from "@/services/setting.service";
import { settingsSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await getPublicSettings());
}
export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const unconfigured = requireDatabase();
  if (unconfigured) return unconfigured;
  const parsed = settingsSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Thông tin cài đặt không hợp lệ" },
      { status: 400 },
    );
  try {
    const settings = await updateSettings(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Không thể lưu cài đặt" },
      { status: 500 },
    );
  }
}

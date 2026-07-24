import { NextResponse } from "next/server";
import { requireAdmin, requireDatabase } from "@/lib/api-guards";
import { getPublicSettings, updateSettings } from "@/services/setting.service";
import { settingsSchema } from "@/lib/validations";
import { revalidatePath, revalidateTag } from "next/cache";
import { apiErrorResponse } from "@/lib/api-errors";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json(await getPublicSettings());
  } catch (error) {
    return apiErrorResponse(
      "admin.settings.get",
      error,
      "Không thể tải cài đặt",
    );
  }
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
    revalidateTag("public-settings", { expire: 0 });
    revalidatePath("/", "layout");
    return NextResponse.json(settings);
  } catch (error) {
    return apiErrorResponse(
      "admin.settings.update",
      error,
      "Không thể lưu cài đặt",
    );
  }
}

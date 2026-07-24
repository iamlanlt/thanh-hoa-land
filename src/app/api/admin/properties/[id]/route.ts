import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseJsonBody, requireAdmin, requireDatabase } from "@/lib/api-guards";
import { propertySchema } from "@/lib/validations";
import {
  deleteProperty,
  getProperty,
  updateProperty,
} from "@/services/property.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const property = await getProperty(id);
  return property
    ? NextResponse.json(property)
    : NextResponse.json({ error: "Không tìm thấy tin" }, { status: 404 });
}

export async function PATCH(request: Request, context: Context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const unconfigured = requireDatabase();
  if (unconfigured) return unconfigured;

  const { id } = await context.params;
  const { data, error } = await parseJsonBody(request, propertySchema);
  if (error) return error;

  try {
    const property = await updateProperty(id, data);
    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath(`/properties/${property.slug}`);
    return NextResponse.json(property);
  } catch {
    return NextResponse.json(
      { error: "Không thể cập nhật tin" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: Context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const unconfigured = requireDatabase();
  if (unconfigured) return unconfigured;

  const { id } = await context.params;
  try {
    await deleteProperty(id);
    revalidatePath("/");
    revalidatePath("/properties");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không thể xóa tin" }, { status: 500 });
  }
}

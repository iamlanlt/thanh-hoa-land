import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-errors";
import { parseJsonBody, requireAdmin, requireDatabase } from "@/lib/api-guards";
import { revalidatePublicPropertyPaths } from "@/lib/revalidation";
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
  try {
    const property = await getProperty(id);
    return property
      ? NextResponse.json(property)
      : NextResponse.json({ error: "Không tìm thấy tin" }, { status: 404 });
  } catch (error) {
    return apiErrorResponse(
      "admin.properties.get",
      error,
      "Không thể tải tin đăng",
      { propertyId: id },
    );
  }
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
    revalidatePublicPropertyPaths(property.slug);
    return NextResponse.json(property);
  } catch (error) {
    return apiErrorResponse(
      "admin.properties.update",
      error,
      "Không thể cập nhật tin",
      { propertyId: id },
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
    const property = await deleteProperty(id);
    revalidatePublicPropertyPaths(property.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(
      "admin.properties.delete",
      error,
      "Không thể xóa tin",
      { propertyId: id },
    );
  }
}

import { NextResponse } from "next/server";
import { parseJsonBody, requireAdmin, requireDatabase } from "@/lib/api-guards";
import {
  adminPropertyQuerySchema,
  searchParamsToObject,
} from "@/lib/admin-query";
import { apiErrorResponse } from "@/lib/api-errors";
import { revalidatePublicPropertyPaths } from "@/lib/revalidation";
import { propertySchema } from "@/lib/validations";
import {
  createProperty,
  listAdminProperties,
} from "@/services/property.service";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = adminPropertyQuerySchema.safeParse(
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bộ lọc danh sách không hợp lệ" },
      { status: 400 },
    );
  }
  try {
    const { featured, ...filters } = parsed.data;
    return NextResponse.json(
      await listAdminProperties({
        ...filters,
        featured: featured === undefined ? undefined : featured === "true",
      }),
    );
  } catch (error) {
    return apiErrorResponse(
      "admin.properties.list",
      error,
      "Không thể tải danh sách tin đăng",
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const unconfigured = requireDatabase();
  if (unconfigured) return unconfigured;

  const { data, error } = await parseJsonBody(request, propertySchema);
  if (error) return error;

  try {
    const property = await createProperty(data);
    revalidatePublicPropertyPaths(property.slug);
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    return apiErrorResponse(
      "admin.properties.create",
      error,
      "Không thể tạo tin đăng",
    );
  }
}

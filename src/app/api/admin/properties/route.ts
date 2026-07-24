import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseJsonBody, requireAdmin, requireDatabase } from "@/lib/api-guards";
import { propertySchema } from "@/lib/validations";
import {
  createProperty,
  listAdminProperties,
} from "@/services/property.service";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const params = new URL(request.url).searchParams;
  const visibility = params.get("visibility");
  const result = await listAdminProperties({
    query: params.get("query") || undefined,
    type: params.get("type") || undefined,
    status: params.get("status") || undefined,
    visibility:
      visibility === "VISIBLE" || visibility === "HIDDEN"
        ? visibility
        : undefined,
    featured:
      params.get("featured") === null
        ? undefined
        : params.get("featured") === "true",
    page: Number(params.get("page")) || 1,
    pageSize: Number(params.get("pageSize")) || 10,
  });
  return NextResponse.json(result);
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
    revalidatePath("/");
    revalidatePath("/properties");
    return NextResponse.json(property, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Không thể tạo tin đăng" },
      { status: 500 },
    );
  }
}

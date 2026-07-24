import { NextResponse } from "next/server";
import { updateLead } from "@/services/lead.service";
import { leadUpdateSchema } from "@/lib/validations";
import { parseJsonBody, requireAdmin } from "@/lib/api-guards";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const { data, error } = await parseJsonBody(request, leadUpdateSchema);
  if (error) return error;
  try {
    return NextResponse.json(await updateLead(id, data));
  } catch {
    return NextResponse.json(
      { error: "Không thể cập nhật khách hàng" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { createLead } from "@/services/lead.service";
import { leadSchema } from "@/lib/validations";
import { parseJsonBody, requireDatabase } from "@/lib/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { apiErrorResponse, logServerError } from "@/lib/api-errors";

export async function POST(request: Request) {
  const unconfigured = requireDatabase();
  if (unconfigured) return unconfigured;

  let rate;
  try {
    rate = await checkRateLimit(
      `lead-create:${getClientIp(request)}`,
      5,
      60 * 1000,
    );
  } catch (error) {
    logServerError("leads.rate-limit", error);
    return NextResponse.json(
      { error: "Không thể tiếp nhận thông tin lúc này" },
      { status: 503 },
    );
  }
  if (!rate.allowed)
    return NextResponse.json(
      { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  const { data, error } = await parseJsonBody(
    request,
    leadSchema,
    "Vui lòng kiểm tra lại thông tin",
  );
  if (error) return error;
  if (data.website) return NextResponse.json({ ok: true }, { status: 201 });
  try {
    return NextResponse.json(await createLead(data), { status: 201 });
  } catch (error) {
    return apiErrorResponse(
      "leads.create",
      error,
      "Không thể lưu thông tin tư vấn",
    );
  }
}

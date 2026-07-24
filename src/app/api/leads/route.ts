import { NextResponse } from "next/server";
import { createLead } from "@/services/lead.service";
import { leadSchema } from "@/lib/validations";
import { parseJsonBody } from "@/lib/api-guards";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(
    `lead-create:${getClientIp(request)}`,
    5,
    60 * 1000,
  );
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
  } catch {
    return NextResponse.json(
      { error: "Không thể lưu thông tin tư vấn" },
      { status: 500 },
    );
  }
}

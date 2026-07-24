import { NextResponse } from "next/server";
import { listPublishedProperties } from "@/services/property.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const properties = await listPublishedProperties({
      district: searchParams.get("district") || undefined,
      type: searchParams.get("type") || undefined,
      featured:
        searchParams.get("featured") === null
          ? undefined
          : searchParams.get("featured") === "true",
    });
    return NextResponse.json(properties);
  } catch {
    return NextResponse.json(
      { error: "Không thể tải tin đăng" },
      { status: 500 },
    );
  }
}

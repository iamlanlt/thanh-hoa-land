import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { logServerError } from "@/lib/api-errors";
import {
  getAllowedUploadFormats,
  validateUploadFile,
  type MediaResourceType,
} from "@/lib/media-policy";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    resourceType?: MediaResourceType;
    fileType?: string;
    fileSize?: number;
  } | null;
  const resourceType =
    body?.resourceType === "video"
      ? "video"
      : body?.resourceType === "image"
        ? "image"
        : null;
  if (
    !resourceType ||
    typeof body?.fileType !== "string" ||
    typeof body.fileSize !== "number"
  ) {
    return NextResponse.json(
      { error: "Thông tin file upload không hợp lệ." },
      { status: 400 },
    );
  }
  const validationError = validateUploadFile(
    { type: body.fileType, size: body.fileSize },
    resourceType,
  );
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim();
  if (!cloudName || !apiKey || !apiSecret || !folder) {
    return NextResponse.json(
      {
        error:
          "Cloudinary chưa được cấu hình. Bạn có thể dùng URL ảnh trực tiếp.",
      },
      { status: 503 },
    );
  }
  if (process.env.NODE_ENV === "production" && !uploadPreset) {
    logServerError(
      "admin.upload.signature",
      new Error("CLOUDINARY_UPLOAD_PRESET is missing in production."),
    );
    return NextResponse.json(
      { error: "Chính sách upload production chưa được cấu hình." },
      { status: 503 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const allowedFormats = getAllowedUploadFormats(resourceType);
  const signedParameters = [
    `allowed_formats=${allowedFormats.join(",")}`,
    `folder=${folder}`,
    `timestamp=${timestamp}`,
    ...(uploadPreset ? [`upload_preset=${uploadPreset}`] : []),
  ];
  const parameters = signedParameters.join("&");
  const signature = createHash("sha1")
    .update(`${parameters}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    allowedFormats,
    uploadPreset,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    resourceType,
  });
}

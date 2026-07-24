import { validateUploadFile } from "@/lib/media-policy";

export type CloudinaryResourceType = "image" | "video";

type UploadPayload = {
  apiKey?: string;
  timestamp?: number;
  folder?: string;
  signature?: string;
  uploadUrl?: string;
  allowedFormats?: string[];
  uploadPreset?: string;
  secure_url?: string;
  error?: string | { message?: string };
};

function getErrorMessage(payload: UploadPayload, fallback: string) {
  if (typeof payload.error === "string") return payload.error;
  return payload.error?.message || fallback;
}

export async function uploadToCloudinary(
  file: File,
  resourceType: CloudinaryResourceType = "image",
) {
  const validationError = validateUploadFile(file, resourceType);
  if (validationError) throw new Error(validationError);

  const configResponse = await fetch("/api/admin/uploads/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceType,
      fileType: file.type,
      fileSize: file.size,
    }),
  });
  const config = (await configResponse.json().catch(() => ({}))) as UploadPayload;
  if (!configResponse.ok) {
    throw new Error(getErrorMessage(config, "Không thể khởi tạo upload"));
  }
  if (
    !config.apiKey ||
    !config.timestamp ||
    !config.folder ||
    !config.signature ||
    !config.uploadUrl ||
    !config.allowedFormats?.length
  ) {
    throw new Error("Cấu hình upload không hợp lệ");
  }

  const data = new FormData();
  data.append("file", file);
  data.append("api_key", config.apiKey);
  data.append("timestamp", String(config.timestamp));
  data.append("folder", config.folder);
  data.append("allowed_formats", config.allowedFormats.join(","));
  if (config.uploadPreset) data.append("upload_preset", config.uploadPreset);
  data.append("signature", config.signature);

  const uploadResponse = await fetch(config.uploadUrl, {
    method: "POST",
    body: data,
  });
  const result = (await uploadResponse.json().catch(() => ({}))) as UploadPayload;
  if (!uploadResponse.ok || !result.secure_url) {
    const mediaLabel = resourceType === "video" ? "video" : "ảnh";
    throw new Error(getErrorMessage(result, `Upload ${mediaLabel} thất bại`));
  }
  return result.secure_url;
}

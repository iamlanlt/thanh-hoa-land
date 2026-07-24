export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const VIDEO_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;

export const IMAGE_UPLOAD_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
] as const;
export const VIDEO_UPLOAD_FORMATS = ["mp4", "webm", "mov"] as const;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
const IMAGE_HOSTS = new Set(["res.cloudinary.com", "images.unsplash.com"]);

export type MediaResourceType = "image" | "video";

export function isAllowedImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && IMAGE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function validateUploadFile(
  file: Pick<File, "size" | "type">,
  resourceType: MediaResourceType,
) {
  const isImage = resourceType === "image";
  const allowedTypes = isImage ? IMAGE_MIME_TYPES : VIDEO_MIME_TYPES;
  const maxBytes = isImage ? IMAGE_UPLOAD_MAX_BYTES : VIDEO_UPLOAD_MAX_BYTES;
  if (!allowedTypes.has(file.type.toLowerCase())) {
    return isImage
      ? "Ảnh phải có định dạng JPG, PNG, WebP, AVIF hoặc GIF."
      : "Video phải có định dạng MP4, WebM hoặc MOV.";
  }
  if (file.size < 1 || file.size > maxBytes) {
    return isImage
      ? "Ảnh phải nhỏ hơn hoặc bằng 10 MB."
      : "Video phải nhỏ hơn hoặc bằng 100 MB.";
  }
  return null;
}

export function getAllowedUploadFormats(resourceType: MediaResourceType) {
  return resourceType === "image"
    ? [...IMAGE_UPLOAD_FORMATS]
    : [...VIDEO_UPLOAD_FORMATS];
}

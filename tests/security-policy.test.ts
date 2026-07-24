import assert from "node:assert/strict";
import test from "node:test";
import { canUseEnvironmentAdminFallback } from "../src/lib/auth-policy";
import {
  IMAGE_UPLOAD_MAX_BYTES,
  VIDEO_UPLOAD_MAX_BYTES,
  isAllowedImageUrl,
  validateUploadFile,
} from "../src/lib/media-policy";
import { checkInMemoryRateLimit } from "../src/lib/rate-limit";
import { settingsSchema } from "../src/lib/validations";

test("environment admin fallback is disabled in production", () => {
  assert.equal(canUseEnvironmentAdminFallback("production", false), false);
  assert.equal(canUseEnvironmentAdminFallback("production", true), false);
});

test("environment admin fallback is only available without a development database", () => {
  assert.equal(canUseEnvironmentAdminFallback("development", false), true);
  assert.equal(canUseEnvironmentAdminFallback("test", false), true);
  assert.equal(canUseEnvironmentAdminFallback("development", true), false);
});

test("image URLs only allow configured HTTPS media hosts", () => {
  assert.equal(
    isAllowedImageUrl("https://res.cloudinary.com/demo/image/upload/a.jpg"),
    true,
  );
  assert.equal(
    isAllowedImageUrl("https://images.unsplash.com/photo-123"),
    true,
  );
  assert.equal(isAllowedImageUrl("http://images.unsplash.com/photo-123"), false);
  assert.equal(isAllowedImageUrl("https://example.com/a.jpg"), false);
  assert.equal(
    isAllowedImageUrl("https://images.unsplash.com.evil.example/a.jpg"),
    false,
  );
});

test("upload validation enforces MIME type and size", () => {
  assert.equal(
    validateUploadFile(
      { type: "image/jpeg", size: IMAGE_UPLOAD_MAX_BYTES },
      "image",
    ),
    null,
  );
  assert.match(
    validateUploadFile(
      { type: "image/svg+xml", size: 100 },
      "image",
    ) || "",
    /định dạng/,
  );
  assert.match(
    validateUploadFile(
      { type: "image/jpeg", size: IMAGE_UPLOAD_MAX_BYTES + 1 },
      "image",
    ) || "",
    /10 MB/,
  );
  assert.equal(
    validateUploadFile(
      { type: "video/mp4", size: VIDEO_UPLOAD_MAX_BYTES },
      "video",
    ),
    null,
  );
  assert.match(
    validateUploadFile({ type: "video/mp4", size: 0 }, "video") || "",
    /100 MB/,
  );
});

test("local development rate limit allows up to the configured limit", () => {
  const key = `test:${Date.now()}:${Math.random()}`;
  const first = checkInMemoryRateLimit(key, 2, 60_000);
  const second = checkInMemoryRateLimit(key, 2, 60_000);
  const third = checkInMemoryRateLimit(key, 2, 60_000);

  assert.equal(first.allowed, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
});

test("settings only accept Google Maps URLs", () => {
  const base = {
    brandName: "Example",
    email: "contact@example.com",
    phone: "0901234567",
    zaloUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    logoUrl: "",
    faviconUrl: "",
    seoTitle: "",
    seoDescription: "",
    ogImageUrl: "",
    address: "Example address",
    workingHours: "",
    mapQuery: "",
    mapLat: null,
    mapLng: null,
  };
  assert.equal(
    settingsSchema.safeParse({
      ...base,
      mapEmbedUrl: "https://maps.google.com/maps?q=example",
    }).success,
    true,
  );
  assert.equal(
    settingsSchema.safeParse({
      ...base,
      mapEmbedUrl: "https://example.com/map",
    }).success,
    false,
  );
});

import { z } from "zod";
import { LEAD_STATUS_VALUES } from "@/lib/lead-status";
import { PROPERTY_STATUS_VALUES } from "@/lib/property-options";
import { isAllowedImageUrl } from "@/lib/media-policy";
import { isGoogleMapsUrl } from "@/lib/maps";

function httpUrlSchema(maxLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .url(message)
    .refine((url) => /^https?:\/\//i.test(url), message);
}

function optionalHttpUrlSchema(maxLength: number, message: string) {
  return httpUrlSchema(maxLength, message).or(z.literal(""));
}

function imageUrlSchema(maxLength: number, message: string) {
  return httpUrlSchema(maxLength, message).refine(isAllowedImageUrl, message);
}

function optionalImageUrlSchema(maxLength: number, message: string) {
  return imageUrlSchema(maxLength, message).or(z.literal(""));
}

function optionalGoogleMapsUrlSchema(maxLength: number, message: string) {
  return httpUrlSchema(maxLength, message).refine(isGoogleMapsUrl, message).or(
    z.literal(""),
  );
}

function phoneSchema(message = "Số điện thoại chưa đúng") {
  return z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9 .-]{8,14}$/, message);
}

const imageSchema = z.object({
  url: imageUrlSchema(
    1000,
    "Ảnh phải thuộc Cloudinary hoặc images.unsplash.com",
  ),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const videoUrlSchema = httpUrlSchema(
  1000,
  "Video cần là liên kết http hoặc https",
);

export const propertySchema = z.object({
  title: z.string().trim().min(3, "Tên tin tối thiểu 3 ký tự").max(160),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug chỉ gồm chữ thường, số và dấu gạch ngang",
    ),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  location: z.string().trim().min(2).max(180),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  area: z.coerce.number().positive().optional().or(z.literal("")),
  price: z.string().trim().max(80).optional().or(z.literal("")),
  priceValue: z.coerce.number().nonnegative().optional().or(z.literal("")),
  priceUnit: z.string().trim().max(30).optional().or(z.literal("")),
  type: z.string().trim().max(80).optional().or(z.literal("")),
  legalStatus: z.string().trim().max(160).optional().or(z.literal("")),
  frontage: z.coerce.number().positive().optional().or(z.literal("")),
  accessRoadWidth: z.coerce.number().positive().optional().or(z.literal("")),
  direction: z.string().trim().max(40).optional().or(z.literal("")),
  floors: z.coerce.number().int().positive().max(100).optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().nonnegative().max(100).optional().or(z.literal("")),
  bathrooms: z.coerce.number().int().nonnegative().max(100).optional().or(z.literal("")),
  furniture: z.string().trim().max(160).optional().or(z.literal("")),
  status: z.enum(PROPERTY_STATUS_VALUES),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  coverImage: optionalImageUrlSchema(
    1000,
    "Ảnh phải thuộc Cloudinary hoặc images.unsplash.com",
  ).optional(),
  images: z.array(imageSchema).max(20).default([]),
  videoUrls: z.array(videoUrlSchema).max(8).default([]),
});

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100),
  phone: phoneSchema(),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  budget: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  propertyId: z.string().cuid().optional().or(z.literal("")),
  consent: z.boolean().refine(Boolean, "Bạn cần đồng ý để được liên hệ"),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUS_VALUES).optional(),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const settingsSchema = z
  .object({
    brandName: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(160),
    phone: phoneSchema(),
    zaloUrl: optionalHttpUrlSchema(300, "URL Zalo không hợp lệ"),
    facebookUrl: optionalHttpUrlSchema(300, "URL Facebook không hợp lệ"),
    tiktokUrl: optionalHttpUrlSchema(300, "URL TikTok không hợp lệ"),
    logoUrl: optionalImageUrlSchema(
      500,
      "Logo phải thuộc Cloudinary hoặc images.unsplash.com",
    ),
    faviconUrl: optionalImageUrlSchema(
      500,
      "Favicon phải thuộc Cloudinary hoặc images.unsplash.com",
    ),
    seoTitle: z.string().trim().max(160),
    seoDescription: z.string().trim().max(320),
    ogImageUrl: optionalImageUrlSchema(
      500,
      "Ảnh SEO phải thuộc Cloudinary hoặc images.unsplash.com",
    ),
    address: z.string().trim().min(2).max(240),
    workingHours: z.string().trim().max(120),
    mapQuery: z.string().trim().max(240),
    mapEmbedUrl: optionalGoogleMapsUrlSchema(
      1000,
      "URL phải thuộc Google Maps",
    ),
    mapLat: z.number().min(-90).max(90).nullable().optional(),
    mapLng: z.number().min(-180).max(180).nullable().optional(),
  })
  .strict();

export type PropertyInput = z.infer<typeof propertySchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

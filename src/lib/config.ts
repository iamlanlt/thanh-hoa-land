import { getGoogleMapsEmbedUrl } from "@/lib/maps";

const DEFAULT_MAP_QUERY = "Thanh Hóa, Việt Nam";

export const siteConfig = {
  name: "Thanh Hóa Land",
  phone: process.env.NEXT_PUBLIC_PHONE || "0374170474",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "thelaniq@gmail.com",
  zaloUrl: process.env.NEXT_PUBLIC_ZALO_URL || "https://zalo.me/0374170474",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
  tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL || "",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || "",
  seoTitle: process.env.NEXT_PUBLIC_SEO_TITLE || "",
  seoDescription: process.env.NEXT_PUBLIC_SEO_DESCRIPTION || "",
  ogImageUrl: process.env.NEXT_PUBLIC_OG_IMAGE_URL || "",
  mapEmbedUrl:
    process.env.NEXT_PUBLIC_MAP_EMBED_URL ||
    getGoogleMapsEmbedUrl(DEFAULT_MAP_QUERY),
  mapQuery: process.env.NEXT_PUBLIC_MAP_QUERY || DEFAULT_MAP_QUERY,
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

import { cache } from "react";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { siteConfig } from "@/lib/config";
import type { SettingsInput } from "@/lib/validations";

const fallbackSettings = {
  brandName: siteConfig.name,
  email: siteConfig.email,
  phone: siteConfig.phone,
  zaloUrl: siteConfig.zaloUrl,
  facebookUrl: siteConfig.facebookUrl,
  tiktokUrl: siteConfig.tiktokUrl,
  logoUrl: siteConfig.logoUrl,
  faviconUrl: siteConfig.faviconUrl,
  seoTitle: siteConfig.seoTitle,
  seoDescription: siteConfig.seoDescription,
  ogImageUrl: siteConfig.ogImageUrl,
  address: "Thanh Hóa, Việt Nam",
  workingHours: "Thứ 2 – Thứ 7, 08:00 – 18:00",
  mapQuery: siteConfig.mapQuery,
  mapEmbedUrl: "",
  mapLat: "",
  mapLng: "",
};
const publicSettingKeys = [
  "brandName",
  "email",
  "phone",
  "zaloUrl",
  "facebookUrl",
  "tiktokUrl",
  "logoUrl",
  "faviconUrl",
  "seoTitle",
  "seoDescription",
  "ogImageUrl",
  "address",
  "workingHours",
  "mapQuery",
  "mapEmbedUrl",
  "mapLat",
  "mapLng",
] as const;
const publicSettingKeySet = new Set<string>(publicSettingKeys);

function onlyPublicSettings(settings: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(settings).filter(([key]) => publicSettingKeySet.has(key)),
  );
}

async function readPublicSettings() {
  if (!isDatabaseConfigured) return fallbackSettings;
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [...publicSettingKeys],
      },
    },
  });
  return {
    ...fallbackSettings,
    ...onlyPublicSettings(
      rows.reduce<Record<string, string>>((settings, row) => {
        settings[row.key] = row.value;
        return settings;
      }, {}),
    ),
  };
}

export const getPublicSettings = cache(readPublicSettings);

export async function updateSettings(settings: SettingsInput) {
  const { mapLat, mapLng, ...rest } = settings;
  const safeSettings = onlyPublicSettings({
    ...rest,
    mapLat: mapLat != null ? String(mapLat) : "",
    mapLng: mapLng != null ? String(mapLng) : "",
  });
  await prisma.$transaction(
    Object.entries(safeSettings).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: value.slice(0, 500) },
        create: { key, value: value.slice(0, 500) },
      }),
    ),
  );
  return readPublicSettings();
}

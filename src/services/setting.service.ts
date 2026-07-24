import { unstable_cache } from "next/cache";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type { SettingsInput } from "@/lib/validations";
import { assertPublicDataAvailable } from "@/lib/data-mode";

export const PUBLIC_SETTING_DEFAULTS = {
  brandName: "",
  email: "",
  phone: "",
  zaloUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  logoUrl: "",
  faviconUrl: "",
  seoTitle: "",
  seoDescription: "",
  ogImageUrl: "",
  address: "",
  workingHours: "",
  mapQuery: "",
  mapEmbedUrl: "",
  mapLat: "",
  mapLng: "",
} as const satisfies Record<keyof SettingsInput, string>;
const publicSettingKeys = Object.keys(
  PUBLIC_SETTING_DEFAULTS,
) as Array<keyof typeof PUBLIC_SETTING_DEFAULTS>;
const publicSettingKeySet = new Set<string>(publicSettingKeys);

function onlyPublicSettings(settings: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(settings).filter(([key]) => publicSettingKeySet.has(key)),
  );
}

async function readPublicSettings() {
  assertPublicDataAvailable();
  if (!isDatabaseConfigured) return PUBLIC_SETTING_DEFAULTS;
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [...publicSettingKeys],
      },
    },
  });
  return {
    ...PUBLIC_SETTING_DEFAULTS,
    ...onlyPublicSettings(
      rows.reduce<Record<string, string>>((settings, row) => {
        settings[row.key] = row.value;
        return settings;
      }, {}),
    ),
  };
}

export const getPublicSettings = unstable_cache(
  readPublicSettings,
  ["public-settings"],
  { revalidate: 60, tags: ["public-settings"] },
);

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

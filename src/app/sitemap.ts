import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { listPublishedProperties } from "@/services/property.service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await listPublishedProperties();
  const baseUrl = siteConfig.siteUrl;
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...properties.map((property) => ({
      url: `${baseUrl}/properties/${property.slug}`,
      changeFrequency: "weekly" as const,
      priority: property.featured ? 0.85 : 0.7,
    })),
  ];
}

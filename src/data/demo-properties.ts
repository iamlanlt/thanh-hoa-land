import { galleryForType, seedProperties } from "@/data/seed-data";
import type { PublicProperty } from "@/types/property";

export const demoProperties: PublicProperty[] = seedProperties.map(
  (property, propertyIndex) => {
    const published = "published" in property ? property.published : true;
    const gallery = galleryForType(property.type, propertyIndex);

    return {
      ...property,
      id: `demo-property-${propertyIndex + 1}`,
      shortDescription: property.description.slice(0, 180),
      status: "status" in property ? property.status : "AVAILABLE",
      published,
      publishedAt: published
        ? new Date(Date.UTC(2026, 6, 12 - propertyIndex, 2, 0, 0))
        : null,
      sortOrder: propertyIndex,
      coverImage: gallery[0],
      images: gallery.map((url, imageIndex) => ({
        id: `demo-property-${propertyIndex + 1}-image-${imageIndex + 1}`,
        url,
        sortOrder: imageIndex,
        alt: `${property.title} - ảnh ${imageIndex + 1}`,
      })),
      videoUrls: [],
    };
  },
);

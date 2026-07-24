import { galleryForType, seedProperties } from "@/data/seed-data";

export type PublicProperty = {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  location: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  area: number | null;
  price: string | null;
  priceValue?: number | null;
  priceUnit?: string | null;
  type: string | null;
  legalStatus?: string | null;
  frontage?: number | null;
  accessRoadWidth?: number | null;
  direction?: string | null;
  floors?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furniture?: string | null;
  coverImage?: string | null;
  status: string;
  featured: boolean;
  published: boolean;
  publishedAt: Date | string | null;
  sortOrder: number;
  images: Array<{
    id: string;
    url: string;
    sortOrder: number;
    alt?: string | null;
  }>;
  videoUrls?: string[];
};

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

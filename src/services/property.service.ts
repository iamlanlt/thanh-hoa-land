import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoProperties } from "@/data/demo-properties";
import { buildPropertySearchHaystack } from "@/lib/property-display";
import type { PropertyInput } from "@/lib/validations";

const publicListSelect = {
  id: true,
  title: true,
  slug: true,
  location: true,
  address: true,
  area: true,
  price: true,
  priceValue: true,
  priceUnit: true,
  type: true,
  status: true,
  featured: true,
  published: true,
  sortOrder: true,
  coverImage: true,
  publishedAt: true,
  images: {
    select: { id: true, url: true, alt: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
  },
};

const publicPropertyWhere = {
  published: true,
  status: "AVAILABLE",
  deletedAt: null,
} satisfies Prisma.PropertyWhereInput;

const publicPropertyOrderBy = [
  { featured: "desc" },
  { sortOrder: "asc" },
  { publishedAt: "desc" },
] satisfies Prisma.PropertyOrderByWithRelationInput[];

type AdminPropertyQuery = {
  query?: string;
  type?: string;
  status?: string;
  visibility?: "VISIBLE" | "HIDDEN";
  featured?: boolean;
  page?: number;
  pageSize?: number;
};

function isPublicProperty(property: {
  published: boolean;
  status: string;
}) {
  return property.published && property.status === "AVAILABLE";
}

function comparePublicPropertyOrder(
  a: Pick<(typeof demoProperties)[number], "featured" | "sortOrder" | "publishedAt">,
  b: Pick<(typeof demoProperties)[number], "featured" | "sortOrder" | "publishedAt">,
) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  return bTime - aTime;
}

function getPropertyWriteData(
  input: PropertyInput,
  publishedAt: Date | null,
): Prisma.PropertyCreateInput {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description || null,
    shortDescription: input.shortDescription || null,
    location: input.location,
    address: input.address || null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    area: input.area === "" ? null : input.area,
    price: input.price || null,
    priceValue: input.priceValue === "" ? null : input.priceValue,
    priceUnit: input.priceUnit || null,
    type: input.type || null,
    legalStatus: input.legalStatus || null,
    frontage: input.frontage === "" ? null : input.frontage,
    accessRoadWidth:
      input.accessRoadWidth === "" ? null : input.accessRoadWidth,
    direction: input.direction || null,
    floors: input.floors === "" ? null : input.floors,
    bedrooms: input.bedrooms === "" ? null : input.bedrooms,
    bathrooms: input.bathrooms === "" ? null : input.bathrooms,
    furniture: input.furniture || null,
    status: input.status,
    featured: input.featured,
    published: input.published,
    publishedAt,
    sortOrder: input.sortOrder,
    coverImage: input.coverImage || input.images[0]?.url || null,
    videoUrls: input.videoUrls,
    images: { create: input.images },
  };
}

export async function listPublishedProperties(filters?: {
  district?: string;
  type?: string;
  featured?: boolean;
  limit?: number;
}) {
  const limit = filters?.limit
    ? Math.min(100, Math.max(1, filters.limit))
    : undefined;
  if (!isDatabaseConfigured) {
    const properties = demoProperties
      .filter(
        (property) =>
          isPublicProperty(property) &&
          (!filters?.district || property.location.includes(filters.district)) &&
          (!filters?.type || property.type === filters.type) &&
          (filters?.featured === undefined ||
            property.featured === filters.featured),
      )
      .sort(comparePublicPropertyOrder);
    return limit ? properties.slice(0, limit) : properties;
  }
  return prisma.property.findMany({
    where: {
      ...publicPropertyWhere,
      ...(filters?.district
        ? { location: { contains: filters.district, mode: "insensitive" } }
        : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.featured === undefined
        ? {}
        : { featured: filters.featured }),
    },
    select: publicListSelect,
    orderBy: publicPropertyOrderBy,
    take: limit,
  });
}

export async function countPublishedProperties() {
  if (!isDatabaseConfigured) {
    return demoProperties.filter(isPublicProperty).length;
  }
  return prisma.property.count({
    where: publicPropertyWhere,
  });
}

export async function listRecentProperties(limit = 5) {
  const take = Math.min(20, Math.max(1, limit));
  if (!isDatabaseConfigured) return demoProperties.slice(0, take);
  return prisma.property.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true, location: true, status: true },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function listAdminProperties(filters: AdminPropertyQuery = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, filters.pageSize ?? 10));
  const normalizedQuery = filters.query?.trim();

  if (!isDatabaseConfigured) {
    const filtered = demoProperties.filter((property) => {
      const haystack = buildPropertySearchHaystack(property);
      return (
        (!normalizedQuery ||
          haystack.includes(normalizedQuery.toLocaleLowerCase("vi"))) &&
        (!filters.type || property.type === filters.type) &&
        (!filters.status || property.status === filters.status) &&
        (!filters.visibility ||
          property.published === (filters.visibility === "VISIBLE")) &&
        (filters.featured === undefined ||
          property.featured === filters.featured)
      );
    });
    const total = filtered.length;
    return {
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  const where: Prisma.PropertyWhereInput = {
    deletedAt: null,
    ...(normalizedQuery
      ? {
          OR: ["title", "location", "address", "type"].map((field) => ({
            [field]: { contains: normalizedQuery, mode: "insensitive" },
          })),
        }
      : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.visibility
      ? { published: filters.visibility === "VISIBLE" }
      : {}),
    ...(filters.featured === undefined
      ? {}
      : { featured: filters.featured }),
  };
  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProperty(id: string) {
  if (!isDatabaseConfigured)
    return demoProperties.find((property) => property.id === id) ?? null;
  return prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createProperty(input: PropertyInput) {
  return prisma.property.create({
    data: getPropertyWriteData(input, input.published ? new Date() : null),
    include: { images: true },
  });
}

export async function updateProperty(id: string, input: PropertyInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.property.findUniqueOrThrow({
      where: { id },
      select: { publishedAt: true },
    });
    await tx.propertyImage.deleteMany({ where: { propertyId: id } });
    const publishedAt =
      input.published && !current.publishedAt
        ? new Date()
        : current.publishedAt;
    return tx.property.update({
      where: { id },
      data: getPropertyWriteData(input, publishedAt),
      include: { images: true },
    });
  });
}

export async function deleteProperty(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.lead.updateMany({
      where: { propertyId: id },
      data: { propertyId: null },
    });
    return tx.property.update({
      where: { id },
      data: { deletedAt: new Date(), published: false },
    });
  });
}

export async function getDashboardStats() {
  if (!isDatabaseConfigured)
    return {
      properties: demoProperties.length,
      published: demoProperties.filter(isPublicProperty).length,
      hidden: demoProperties.filter((p) => !p.published).length,
      sold: demoProperties.filter((p) => p.status === "SOLD").length,
      featured: demoProperties.filter(
        (p) => p.featured && isPublicProperty(p),
      ).length,
      leads: 0,
      newLeads: 0,
    };
  const [propertyGroups, leadGroups] = await Promise.all([
    prisma.property.groupBy({
      by: ["status", "published", "featured"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);
  let properties = 0;
  let published = 0;
  let hidden = 0;
  let sold = 0;
  let featured = 0;
  for (const group of propertyGroups) {
    const count = group._count._all;
    properties += count;
    if (group.published && group.status === "AVAILABLE") published += count;
    if (!group.published) hidden += count;
    if (group.status === "SOLD") sold += count;
    if (group.featured && group.published && group.status === "AVAILABLE")
      featured += count;
  }
  const leads = leadGroups.reduce(
    (total, group) => total + group._count._all,
    0,
  );
  const newLeads =
    leadGroups.find((group) => group.status === "NEW")?._count._all ?? 0;
  return { properties, published, hidden, sold, featured, leads, newLeads };
}

export const getPropertyBySlug = cache(async (slug: string) => {
  if (!isDatabaseConfigured)
    return (
      demoProperties.find(
        (property) => property.slug === slug && isPublicProperty(property),
      ) ?? null
    );
  return prisma.property.findFirst({
    where: { ...publicPropertyWhere, slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
});

export async function listRelatedProperties(
  property: { id: string; type?: string | null; location: string },
  limit = 3,
) {
  const take = Math.min(12, Math.max(1, limit));
  const district = property.location.split(",")[0];
  if (!isDatabaseConfigured) {
    return demoProperties
      .filter((item) => item.id !== property.id && isPublicProperty(item))
      .sort((a, b) => {
        const score = (item: (typeof demoProperties)[number]) =>
          Number(item.type === property.type) * 3 +
          Number(item.location.startsWith(district)) * 2 +
          Number(item.featured);
        return score(b) - score(a);
      })
      .slice(0, take);
  }
  return prisma.property.findMany({
    where: {
      ...publicPropertyWhere,
      id: { not: property.id },
      OR: [
        ...(property.type ? [{ type: property.type }] : []),
        { location: { startsWith: district, mode: "insensitive" } },
      ],
    },
    select: publicListSelect,
    orderBy: publicPropertyOrderBy,
    take,
  });
}

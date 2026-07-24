import type { Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type { z } from "zod";
import type { leadSchema, leadUpdateSchema } from "@/lib/validations";

type AdminLeadQuery = {
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export async function createLead(input: z.infer<typeof leadSchema>) {
  if (!isDatabaseConfigured)
    return { id: `demo-${Date.now()}`, ...input, status: "NEW" };
  return prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone.replace(/[ .-]/g, ""),
      location: input.location || null,
      budget: input.budget || null,
      message: input.message || null,
      consent: input.consent,
      propertyId: input.propertyId || null,
    },
  });
}

export async function listAdminLeads(filters: AdminLeadQuery = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, filters.pageSize ?? 6));
  const normalizedQuery = filters.query?.trim();

  if (!isDatabaseConfigured) {
    return { items: [], total: 0, page, pageSize, pageCount: 1 };
  }

  const where: Prisma.LeadWhereInput = {
    ...(normalizedQuery
      ? {
          OR: [
            ...(["name", "phone", "location", "budget", "message"] as const).map(
              (field) => ({
                [field]: { contains: normalizedQuery, mode: "insensitive" as const },
              }),
            ),
            { property: { title: { contains: normalizedQuery, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { property: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLeadStats() {
  if (!isDatabaseConfigured) return { total: 0, newCount: 0, activeCount: 0 };
  const groups = await prisma.lead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  let total = 0;
  let newCount = 0;
  let activeCount = 0;
  for (const group of groups) {
    total += group._count._all;
    if (group.status === "NEW") newCount += group._count._all;
    if (group.status === "CONTACTED" || group.status === "QUALIFIED") {
      activeCount += group._count._all;
    }
  }
  return { total, newCount, activeCount };
}

export async function listRecentLeads(limit = 5) {
  const take = Math.min(20, Math.max(1, limit));
  if (!isDatabaseConfigured) return [];
  return prisma.lead.findMany({
    select: { id: true, name: true, phone: true, status: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function updateLead(
  id: string,
  input: z.infer<typeof leadUpdateSchema>,
) {
  return prisma.lead.update({ where: { id }, data: input });
}

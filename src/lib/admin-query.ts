import { z } from "zod";
import { LEAD_STATUS_VALUES } from "@/lib/lead-status";
import { PROPERTY_STATUS_VALUES } from "@/lib/property-options";

const finitePage = z.coerce.number().int().finite().min(1).max(100_000);
const pageSize = z.coerce.number().int().finite().min(5).max(50);
const optionalText = z.string().trim().max(160).optional();

export const adminPropertyQuerySchema = z.object({
  query: optionalText,
  type: optionalText,
  status: z.enum(PROPERTY_STATUS_VALUES).optional(),
  visibility: z.enum(["VISIBLE", "HIDDEN"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  page: finitePage.default(1),
  pageSize: pageSize.default(10),
});

export const adminLeadQuerySchema = z.object({
  query: optionalText,
  status: z.enum(LEAD_STATUS_VALUES).optional(),
  page: finitePage.default(1),
  pageSize: pageSize.default(10),
});

export function searchParamsToObject(searchParams: URLSearchParams) {
  return Object.fromEntries(
    [...searchParams.entries()].filter(([, value]) => value !== ""),
  );
}

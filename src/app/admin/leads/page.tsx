import { getLeadStats, listAdminLeads } from "@/services/lead.service";
import { LeadManager } from "@/components/admin/LeadManager";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Khách hàng" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const params = await searchParams;
  const filters = {
    query: valueOf(params.query),
    status: valueOf(params.status),
  };
  const [result, stats] = await Promise.all([
    listAdminLeads({
      ...filters,
      page: Number(valueOf(params.page)) || 1,
    }),
    getLeadStats(),
  ]);
  return (
    <>
      <AdminPageHeader
        eyebrow="Khách hàng"
        title="Khách tư vấn"
        description="Theo dõi nhu cầu và cập nhật trạng thái chăm sóc."
      />
      <LeadManager
        filters={filters}
        pagination={{ page: result.page, pageCount: result.pageCount, total: result.total }}
        stats={stats}
        leads={result.items.map((lead) => ({
          ...lead,
          createdAt: lead.createdAt.toISOString(),
        }))}
      />
    </>
  );
}

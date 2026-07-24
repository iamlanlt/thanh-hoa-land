import Link from "next/link";
import { getDashboardStats, listAdminProperties } from "@/services/property.service";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building2, Eye, Plus, Sparkles } from "lucide-react";
import { AdminPropertyList } from "@/components/admin/AdminPropertyList";
import { AdminMetricGrid, AdminPageHeader } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tin đăng" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AdminPropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const params = await searchParams;
  const filters = {
    query: valueOf(params.query),
    type: valueOf(params.type),
    status: valueOf(params.status),
    visibility: valueOf(params.visibility) as "VISIBLE" | "HIDDEN" | undefined,
    featured: valueOf(params.featured),
  };
  const featured =
    filters.featured === "true"
      ? true
      : filters.featured === "false"
        ? false
        : undefined;
  const [result, stats] = await Promise.all([
    listAdminProperties({
      ...filters,
      featured,
      page: Number(valueOf(params.page)) || 1,
      pageSize: 8,
    }),
    getDashboardStats(),
  ]);
  return (
    <>
      <AdminPageHeader
        eyebrow="Nội dung"
        title="Tin đăng"
        description="Quản lý thông tin hiển thị trên trang chủ."
        action={
          <Link className="button adminCreateButton" href="/admin/properties/new">
            <Plus size={18} aria-hidden="true" />
            Thêm tin mới
          </Link>
        }
      />
      <AdminMetricGrid
        className="leadSummary propertySummary"
        label="Tổng quan tin đăng"
        metrics={[
          { label: "Tổng tin đăng", value: stats.properties, icon: <Building2 size={20} aria-hidden="true" /> },
          { label: "Đang hiển thị", value: stats.published, icon: <Eye size={20} aria-hidden="true" /> },
          { label: "Tin nổi bật", value: stats.featured, icon: <Sparkles size={20} aria-hidden="true" /> },
        ]}
      />
      {result.total === 0 && !Object.values(filters).some(Boolean) && (
        <div className="emptyState adminEmptyState">
          <strong>Chưa có tin đăng</strong>
          <span>Tạo tin đầu tiên để bắt đầu hiển thị sản phẩm.</span>
          <Link className="button" href="/admin/properties/new">
            + Tạo tin đầu tiên
          </Link>
        </div>
      )}
      {(result.total > 0 || Object.values(filters).some(Boolean)) && (
        <AdminPropertyList
          filters={filters}
          pagination={{ page: result.page, pageCount: result.pageCount, total: result.total }}
          properties={result.items.map((property) => ({
            id: property.id,
            title: property.title,
            type: property.type,
            area: property.area,
            location: property.location,
            price: property.price,
            priceValue: property.priceValue ?? null,
            priceUnit: property.priceUnit ?? null,
            status: property.status,
            featured: property.featured,
            published: property.published,
            publishedAt: property.publishedAt,
            coverImage: property.coverImage ?? null,
            images: property.images,
          }))}
        />
      )}
    </>
  );
}

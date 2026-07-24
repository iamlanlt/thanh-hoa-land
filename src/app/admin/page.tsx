import Link from "next/link";
import {
  getDashboardStats,
  listRecentProperties,
} from "@/services/property.service";
import { listRecentLeads } from "@/services/lead.service";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Building2,
  CircleCheckBig,
  Eye,
  EyeOff,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { AdminMetricGrid, AdminPageHeader } from "@/components/admin/AdminPage";
import { getLeadStatusLabel } from "@/lib/lead-status";
import { getPropertyStatusLabel } from "@/lib/property-options";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tổng quan" };

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const [stats, properties, leads] = await Promise.all([
    getDashboardStats(),
    listRecentProperties(),
    listRecentLeads(),
  ]);
  return (
    <>
      <AdminPageHeader
        eyebrow="Quản trị"
        title="Tổng quan"
        description="Theo dõi tin đăng và khách hàng mới."
        action={
          <Link className="button" href="/admin/properties/new">
            <Plus size={18} aria-hidden="true" />
            Thêm tin
          </Link>
        }
      />
      <AdminMetricGrid
        className="statGrid"
        label="Tổng quan quản trị"
        metrics={[
          { label: "Tổng tin đăng", value: stats.properties, icon: <Building2 size={20} aria-hidden="true" /> },
          { label: "Đang hiển thị", value: stats.published, icon: <Eye size={20} aria-hidden="true" /> },
          { label: "Đang ẩn", value: stats.hidden, icon: <EyeOff size={20} aria-hidden="true" /> },
          { label: "Nổi bật", value: stats.featured, icon: <Sparkles size={20} aria-hidden="true" /> },
          { label: "Đã bán", value: stats.sold, icon: <CircleCheckBig size={20} aria-hidden="true" /> },
          { label: "Tổng khách", value: stats.leads, icon: <Users size={20} aria-hidden="true" /> },
        ]}
      />
      <div className="adminCallout">
        <div>
          <h2>Bắt đầu quản lý tin đăng</h2>
          <p>
            Thêm ảnh, cập nhật giá và bật tin nổi bật để hiển thị trên landing
            page.
          </p>
        </div>
        <Link href="/admin/properties">Xem danh sách →</Link>
      </div>
      <div className="adminLowerGrid">
        <section className="adminPanel">
          <div className="panelHeader">
            <h2>Tin đăng gần đây</h2>
            <Link href="/admin/properties">Xem tất cả</Link>
          </div>
          {properties.length > 0 ? (
            properties.map((property) => (
              <div className="panelRow" key={property.id}>
                <div>
                  <strong>{property.title}</strong>
                  <small>{property.location}</small>
                </div>
                <span
                  className={`statusPill ${property.status === "SOLD" ? "sold" : "available"}`}
                >
                  {getPropertyStatusLabel(property.status)}
                </span>
              </div>
            ))
          ) : (
            <p className="panelEmpty">Chưa có tin đăng nào.</p>
          )}
        </section>
        <section className="adminPanel">
          <div className="panelHeader">
            <h2>Khách hàng mới</h2>
            <Link href="/admin/leads">Xem tất cả</Link>
          </div>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <div className="panelRow" key={lead.id}>
                <div>
                  <strong>{lead.name}</strong>
                  <small>{lead.phone}</small>
                </div>
                <span className={`leadStatus ${lead.status.toLowerCase()}`}>
                  {getLeadStatusLabel(lead.status)}
                </span>
              </div>
            ))
          ) : (
            <p className="panelEmpty">Chưa có khách liên hệ mới.</p>
          )}
        </section>
      </div>
    </>
  );
}

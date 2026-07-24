import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getPublicSettings } from "@/services/setting.service";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminPageHeader } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cài đặt website" };

export default async function AdminSettingsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const settings = await getPublicSettings();
  return (
    <>
      <AdminPageHeader
        eyebrow="Cấu hình website"
        title="Cấu hình website"
        description="Quản lý thương hiệu, SEO, mạng xã hội, bản đồ và thông tin liên hệ."
      />
      <SettingsForm
        initial={{
          ...settings,
          mapLat: settings.mapLat ? Number(settings.mapLat) : null,
          mapLng: settings.mapLng ? Number(settings.mapLng) : null,
        }}
      />
    </>
  );
}

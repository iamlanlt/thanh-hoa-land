import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getPublicSettings } from "@/services/setting.service";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { parseMapCoordinates } from "@/lib/maps";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cài đặt website" };

export default async function AdminSettingsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const settings = await getPublicSettings();
  const coordinates = parseMapCoordinates(settings.mapLat, settings.mapLng);
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
          mapLat: coordinates?.[0] ?? null,
          mapLng: coordinates?.[1] ?? null,
        }}
      />
    </>
  );
}

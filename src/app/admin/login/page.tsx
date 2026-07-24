import { getPublicSettings } from "@/services/setting.service";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const settings = await getPublicSettings();
  return <AdminLoginForm brandName={settings.brandName} logoUrl={settings.logoUrl} />;
}

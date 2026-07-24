import { PrivacyPolicy } from "@/components/landing/PrivacyPolicy";
import { PublicShell } from "@/components/landing/PublicShell";
import { getPublicSettings } from "@/services/setting.service";

export async function generateMetadata() {
  const settings = await getPublicSettings();
  return {
    title: `Chính sách bảo mật | ${settings.brandName}`,
    description: `Chính sách bảo mật và sử dụng thông tin tư vấn của ${settings.brandName}.`,
  };
}

export default async function PrivacyPage() {
  const settings = await getPublicSettings();
  return (
    <PublicShell settings={settings}>
      <PrivacyPolicy
        brandName={settings.brandName}
        email={settings.email}
        phone={settings.phone}
        analyticsEnabled={Boolean(process.env.NEXT_PUBLIC_GA_ID)}
      />
    </PublicShell>
  );
}

import Link from "next/link";
import { PropertyExplorer } from "@/components/landing/PropertyExplorer";
import { getPublicSettings } from "@/services/setting.service";
import { listPublishedProperties } from "@/services/property.service";
import { siteConfig } from "@/lib/config";
import { createBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/json-ld";
import { PublicShell } from "@/components/landing/PublicShell";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getPublicSettings();
  return {
    title: `Tất cả bất động sản | ${settings.brandName}`,
    description:
      settings.seoDescription ||
      `Danh sách nhà đất đang hiển thị tại ${settings.brandName}.`,
    alternates: { canonical: "/properties" },
  };
}

export default async function PropertiesPage() {
  const [properties, settings] = await Promise.all([
    listPublishedProperties(),
    getPublicSettings(),
  ]);
  const siteUrl = siteConfig.siteUrl;
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Trang chủ", item: siteUrl },
    { name: "Bất động sản", item: `${siteUrl}/properties` },
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps(breadcrumbJsonLd)}
      />
      <PublicShell settings={settings}>
        <section className="listingHero">
          <div className="container">
            <nav className="breadcrumbs" aria-label="Đường dẫn trang">
              <Link href="/">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <span>Bất động sản</span>
            </nav>
            <span className="eyebrow dark">{settings.brandName}</span>
            <h1>Nhà đất đang hiển thị</h1>
            <p>
              Khám phá sản phẩm được chọn lọc với giá, diện tích và đặc điểm rõ
              ràng để bạn dễ dàng so sánh.
            </p>
          </div>
        </section>

        <section id="danh-sach" className="section container listingSection">
          <PropertyExplorer properties={properties} />
        </section>
      </PublicShell>
    </main>
  );
}

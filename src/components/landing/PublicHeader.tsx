import { PhoneCall } from "lucide-react";
import { Brand } from "@/components/landing/Brand";
import { SiteNav } from "@/components/landing/SiteNav";

export function PublicHeader({
  brandName,
  logoUrl,
  phone,
  home = false,
}: {
  brandName: string;
  logoUrl?: string;
  phone: string;
  home?: boolean;
}) {
  const links = home
    ? [
        { href: "/", label: "Trang chủ" },
        { href: "/properties", label: "Bất động sản" },
        { href: "#quy-trinh", label: "Quy trình" },
        { href: "#lien-he", label: "Liên hệ" },
      ]
    : [
        { href: "/", label: "Trang chủ" },
        { href: "/properties", label: "Bất động sản" },
        { href: "/#quy-trinh", label: "Quy trình" },
        { href: "/#lien-he", label: "Liên hệ" },
      ];

  return (
    <header className="header">
      <div className="headerInner container">
        <Brand brandName={brandName} logoUrl={logoUrl} href="/" />
        <SiteNav callHref={`tel:${phone}`} links={links} />
        <a className="button small headerCall" href={`tel:${phone}`}>
          <PhoneCall size={17} aria-hidden="true" />
          Gọi tư vấn
        </a>
      </div>
    </header>
  );
}

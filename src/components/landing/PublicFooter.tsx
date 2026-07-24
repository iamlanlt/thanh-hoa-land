import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Mail, PhoneCall } from "lucide-react";
import { Brand } from "@/components/landing/Brand";
import { FloatingActions } from "@/components/landing/FloatingActions";

type PublicFooterProps = {
  brandName: string;
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  zaloUrl: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  home?: boolean;
};

export function PublicFooter({
  brandName,
  logoUrl,
  phone,
  email,
  address,
  zaloUrl,
  facebookUrl,
  tiktokUrl,
  home = false,
}: PublicFooterProps) {
  const processHref = home ? "#quy-trinh" : "/#quy-trinh";
  const mapHref = home ? "#vi-tri" : "/#vi-tri";
  const contactHref = home ? "#lien-he" : "/#lien-he";

  return (
    <footer className="footer">
      <div className="container footerTop">
        <div className="footerBrandBlock">
          <Brand brandName={brandName} logoUrl={logoUrl} href="/" light />
          <p className="footerTagline">Nhà đất minh bạch. Đầu tư vững vàng.</p>
          {mapHref.startsWith("#") ? (
            <a className="footerLocation" href={mapHref}>
              <MapPin size={15} aria-hidden="true" />
              {address || "Thanh Hóa, Việt Nam"}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          ) : (
            <Link className="footerLocation" href={mapHref}>
              <MapPin size={15} aria-hidden="true" />
              {address || "Thanh Hóa, Việt Nam"}
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="footerColumn">
          <span className="footerHeading">Liên hệ</span>
          <div className="footerContactList">
            <a href={`tel:${phone}`}>
              <PhoneCall size={15} aria-hidden="true" />
              <span><small>Hotline</small>{phone}</span>
            </a>
            <a href={`mailto:${email}`}>
              <Mail size={15} aria-hidden="true" />
              <span><small>Email</small>{email}</span>
            </a>
          </div>
        </div>

        <nav className="footerColumn" aria-label="Điều hướng cuối trang">
          <span className="footerHeading">Khám phá</span>
          <div className="footerLinks">
            <Link href="/">Trang chủ <ArrowRight size={13} aria-hidden="true" /></Link>
            <Link href="/properties">Tất cả bất động sản <ArrowRight size={13} aria-hidden="true" /></Link>
            {processHref.startsWith("#") ? (
              <a href={processHref}>Quy trình <ArrowRight size={13} aria-hidden="true" /></a>
            ) : (
              <Link href={processHref}>Quy trình <ArrowRight size={13} aria-hidden="true" /></Link>
            )}
            {contactHref.startsWith("#") ? (
              <a href={contactHref}>Liên hệ tư vấn <ArrowRight size={13} aria-hidden="true" /></a>
            ) : (
              <Link href={contactHref}>Liên hệ tư vấn <ArrowRight size={13} aria-hidden="true" /></Link>
            )}
            <Link href="/privacy">Chính sách bảo mật <ArrowRight size={13} aria-hidden="true" /></Link>
          </div>
        </nav>

        <div className="footerColumn footerConnect">
          <span className="footerHeading">Kết nối</span>
          <div className="footerSocial">
            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer">Facebook <ArrowUpRight size={13} aria-hidden="true" /></a>}
            <a href={zaloUrl} target="_blank" rel="noreferrer">Zalo <ArrowUpRight size={13} aria-hidden="true" /></a>
            {tiktokUrl && <a href={tiktokUrl} target="_blank" rel="noreferrer">TikTok <ArrowUpRight size={13} aria-hidden="true" /></a>}
          </div>
          <a className="footerCallButton" href={`tel:${phone}`}>
            <PhoneCall size={15} aria-hidden="true" /> Gọi tư vấn
          </a>
        </div>
      </div>

      <div className="container footerBottom">
        <span>© {new Date().getFullYear()} {brandName}</span>
        <span className="footerBottomDivider" aria-hidden="true" />
        <Link href="/privacy">Chính sách bảo mật</Link>
      </div>
      <FloatingActions phone={phone} />
    </footer>
  );
}

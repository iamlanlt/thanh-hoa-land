import Link from "next/link";
import { BrandMark } from "@/components/branding/BrandMark";

export function Brand({
  brandName,
  logoUrl,
  href = "/",
  light = false,
}: {
  brandName: string;
  logoUrl?: string;
  href?: string;
  light?: boolean;
}) {
  return (
    <Link className={`brand${light ? " lightBrand" : ""}`} href={href}>
      <BrandMark logoUrl={logoUrl} />
      <span>{brandName}</span>
    </Link>
  );
}

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function BrandMark({
  logoUrl,
  size = 42,
  className,
}: {
  logoUrl?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("brandSymbol", className)}
      style={{ "--brand-symbol-size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      {logoUrl ? <img src={logoUrl} alt="" /> : <span>TH</span>}
    </span>
  );
}

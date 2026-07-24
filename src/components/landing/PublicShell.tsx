import type { ReactNode } from "react";
import type { getPublicSettings } from "@/services/setting.service";
import { PublicHeader } from "@/components/landing/PublicHeader";
import { PublicFooter } from "@/components/landing/PublicFooter";
import { MobileContactBar } from "@/components/landing/MobileContactBar";

type PublicSettings = Awaited<ReturnType<typeof getPublicSettings>>;

export function PublicShell({
  settings,
  home = false,
  children,
}: {
  settings: PublicSettings;
  home?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <PublicHeader
        brandName={settings.brandName}
        logoUrl={settings.logoUrl}
        phone={settings.phone}
        home={home}
      />
      {children}
      <PublicFooter
        brandName={settings.brandName}
        logoUrl={settings.logoUrl}
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        zaloUrl={settings.zaloUrl}
        facebookUrl={settings.facebookUrl}
        tiktokUrl={settings.tiktokUrl}
        home={home}
      />
      <MobileContactBar phone={settings.phone} zaloUrl={settings.zaloUrl} />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoadingContent } from "@/components/admin/AdminLoading";
import { AdminShell } from "@/components/admin/AdminShell";
import "./admin.css";
import { getPublicSettings } from "@/services/setting.service";

export const metadata: Metadata = {
  title: {
    default: "Quản trị website",
    template: "%s | Quản trị",
  },
  description: "Khu vực quản trị nội bộ.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

async function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();
  return (
    <AdminShell brandName={settings.brandName} logoUrl={settings.logoUrl}>
      {children}
    </AdminShell>
  );
}

function AdminLayoutFallback() {
  return (
    <AdminShell brandName="" logoUrl="">
      <AdminLoadingContent />
    </AdminShell>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

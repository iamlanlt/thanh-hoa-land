"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export function AdminShell({
  children,
  brandName,
  logoUrl,
}: {
  children: React.ReactNode;
  brandName: string;
  logoUrl: string;
}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return children;

  return (
    <div className="adminShell">
      <AdminNav brandName={brandName} logoUrl={logoUrl} />
      <section className="adminContent">{children}</section>
    </div>
  );
}

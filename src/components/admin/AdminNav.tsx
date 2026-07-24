"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/branding/BrandMark";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Tổng quan", Icon: LayoutDashboard },
  { href: "/admin/properties", label: "Tin đăng", Icon: Building2 },
  { href: "/admin/leads", label: "Khách hàng", Icon: Users },
  { href: "/admin/settings", label: "Cài đặt", Icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

export function AdminNav({
  brandName,
  logoUrl,
}: {
  brandName: string;
  logoUrl: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const activeLabel =
    links.find(({ href }) => isActive(pathname, href))?.label || "Quản trị";

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  function BrandLockup({ compact = false }: { compact?: boolean }) {
    return (
      <Link href="/admin" className={compact ? "adminMobileBrand" : "adminBrand"}>
        <BrandMark logoUrl={logoUrl} size={compact ? 34 : 42} />
        <span>{brandName}</span>
      </Link>
    );
  }

  function Navigation({ mobile = false }: { mobile?: boolean }) {
    return (
      <>
        <nav className={mobile ? "grid gap-1 p-4" : undefined}>
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              className={cn(
                isActive(pathname, href) && "active",
                mobile &&
                  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                mobile &&
                  isActive(pathname, href) &&
                  "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
              href={href}
            >
              <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div
          className={cn(
            "adminSidebarFooter",
            mobile && "mx-4 mt-auto mb-5 grid gap-1",
          )}
        >
          <Link
            href="/"
            className={cn(
              "adminSidebarFooterLink",
              mobile &&
                "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Home className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Về trang chủ
          </Link>
          <Button
            variant="ghost"
            className={cn(
              "adminLogout justify-start",
              mobile &&
                "h-11 justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            onClick={logout}
          >
            <LogOut className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Đăng xuất
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="adminMobileHeader">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="adminMenuButton size-11 border-border bg-background text-primary shadow-none"
              aria-label="Mở menu quản trị"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex w-[min(84vw,310px)] border-r-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetHeader className="border-b border-sidebar-border p-5 text-left">
              <BrandLockup />
              <SheetTitle className="sr-only">Điều hướng quản trị</SheetTitle>
              <SheetDescription className="sr-only">
                Menu quản trị Thanh Hóa Land
              </SheetDescription>
            </SheetHeader>
            <Navigation mobile />
          </SheetContent>
        </Sheet>

        <BrandLockup compact />
        <span className="adminMobileContext">{activeLabel}</span>
      </header>

      <aside className="adminSidebar" aria-label="Điều hướng quản trị">
        <div className="adminSidebarHeader">
          <BrandLockup />
        </div>
        <Navigation />
      </aside>
    </>
  );
}

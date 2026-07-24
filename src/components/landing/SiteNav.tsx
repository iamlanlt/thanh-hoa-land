"use client";

import Link from "next/link";
import { ChevronRight, Menu, PhoneCall } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type NavLink = {
  href: string;
  label: string;
};

export function SiteNav({
  links,
  callHref,
}: {
  links: readonly NavLink[];
  callHref: string;
}) {
  return (
    <div className="siteNav">
      <nav className="siteNavDesktop" aria-label="Điều hướng chính">
        {links.map((link) =>
          link.href.startsWith("#") ? (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ) : (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ),
        )}
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="siteNavToggle size-11 border-border bg-background text-primary shadow-none"
            aria-label="Mở menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(88vw,360px)] border-l-border bg-background p-0"
        >
          <SheetHeader className="border-b border-border px-6 py-6 text-left">
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-primary/65 uppercase">
              Thanh Hóa Land
            </span>
            <SheetTitle className="font-serif text-3xl text-primary">
              Điều hướng
            </SheetTitle>
            <SheetDescription className="sr-only">
              Menu điều hướng website Thanh Hóa Land
            </SheetDescription>
          </SheetHeader>

          <nav className="grid gap-2 p-4" aria-label="Menu mobile">
            {links.map((link, index) => {
              const itemClassName =
                "group flex min-h-14 items-center gap-3 rounded-xl px-3 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";
              const itemContent = (
                <>
                  <span className="text-xs font-bold text-primary/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong className="flex-1 text-base">{link.label}</strong>
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              );
              return (
                <SheetClose asChild key={link.href}>
                  {link.href.startsWith("#") ? (
                    <a href={link.href} className={itemClassName}>
                      {itemContent}
                    </a>
                  ) : (
                    <Link href={link.href} className={itemClassName}>
                      {itemContent}
                    </Link>
                  )}
                </SheetClose>
              );
            })}
          </nav>

          <SheetFooter className="border-t border-border bg-muted/60 p-5">
            <p className="text-sm text-muted-foreground">
              Cần hỗ trợ tìm bất động sản phù hợp?
            </p>
            <Button asChild size="lg" className="h-12 w-full bg-primary text-primary-foreground">
              <a href={callHref}>
                <PhoneCall className="size-4" aria-hidden="true" />
                Gọi tư vấn ngay
              </a>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaginationItems } from "@/lib/pagination";

type Props = {
  page: number;
  pageCount: number;
  ariaLabel: string;
  className?: string;
  getHref: (page: number) => string;
};

export function AdminPagination({
  page,
  pageCount,
  ariaLabel,
  className,
  getHref,
}: Props) {
  if (pageCount <= 1) return null;

  function renderNavButton(direction: "prev" | "next") {
    const disabled = direction === "prev" ? page <= 1 : page >= pageCount;
    const target = direction === "prev" ? page - 1 : page + 1;
    const label =
      direction === "prev" ? (
        <>
          <ChevronLeft aria-hidden="true" /> Trước
        </>
      ) : (
        <>
          Sau <ChevronRight aria-hidden="true" />
        </>
      );

    return (
      <Button asChild={!disabled} variant="outline" size="sm" disabled={disabled}>
        {disabled ? <>{label}</> : <Link href={getHref(target)}>{label}</Link>}
      </Button>
    );
  }

  return (
    <nav
      className={`adminPagination${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      {renderNavButton("prev")}
      <div className="adminPaginationPages" aria-label="Chọn trang">
        {getPaginationItems(page, pageCount).map((item) =>
          typeof item === "number" ? (
            item === page ? (
              <span className="adminPaginationPage current" aria-current="page" key={item}>
                {item}
              </span>
            ) : (
              <Link
                className="adminPaginationPage"
                href={getHref(item)}
                key={item}
                aria-label={`Đến trang ${item}`}
              >
                {item}
              </Link>
            )
          ) : (
            <span className="adminPaginationEllipsis" aria-hidden="true" key={item}>
              …
            </span>
          ),
        )}
      </div>
      <span className="adminPaginationMobileStatus">
        Trang {page}/{pageCount}
      </span>
      {renderNavButton("next")}
    </nav>
  );
}

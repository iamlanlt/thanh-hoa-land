"use client";

import { ArrowUp, PhoneCall } from "lucide-react";
import { useScrolledPast } from "@/hooks/use-scrolled-past";

export function FloatingActions({ phone }: { phone: string }) {
  const showBackToTop = useScrolledPast(420);

  function scrollToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <aside className="floatingActions" aria-label="Thao tác nhanh">
      {phone ? (
        <a
          className="floatingAction floatingPhone"
          href={`tel:${phone}`}
          aria-label={`Gọi tư vấn ${phone}`}
          title="Gọi tư vấn"
        >
          <PhoneCall size={20} aria-hidden="true" />
        </a>
      ) : null}
      <button
        className="floatingAction floatingBackToTop"
        type="button"
        onClick={scrollToTop}
        data-visible={showBackToTop ? "true" : "false"}
        aria-label="Lên đầu trang"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        title="Lên đầu trang"
      >
        <ArrowUp size={20} aria-hidden="true" />
      </button>
    </aside>
  );
}

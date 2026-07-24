"use client";

import { useEffect, useState } from "react";
import { ContactActions } from "@/components/landing/ContactActions";
import { useScrolledPast } from "@/hooks/use-scrolled-past";

export function MobileContactBar({
  phone,
  zaloUrl,
}: {
  phone: string;
  zaloUrl: string;
}) {
  const [nearContact, setNearContact] = useState(false);
  const scrolled = useScrolledPast(420);

  useEffect(() => {
    const targets = document.querySelectorAll("[data-contact-region], footer");
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setNearContact(visible.size > 0);
      },
      { threshold: 0.08 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  if (!phone && !zaloUrl) return null;

  return (
    <aside
      className="mobileContactBar"
      data-hidden={!scrolled || nearContact ? "true" : "false"}
      aria-label="Liên hệ nhanh"
    >
      <ContactActions phone={phone} zaloUrl={zaloUrl} variant="mobile" />
    </aside>
  );
}

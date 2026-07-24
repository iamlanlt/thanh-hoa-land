"use client";

import Link from "next/link";
import { Home, RotateCw, TriangleAlert } from "lucide-react";
import { BrandMark } from "@/components/branding/BrandMark";
import { siteConfig } from "@/lib/config";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="errorPage">
      <div className="errorPageCard" role="alert">
        <div className="errorPageBrand">
          <BrandMark size={42} />
          <span>{siteConfig.name}</span>
        </div>
        <span className="errorPageIcon">
          <TriangleAlert size={24} aria-hidden="true" />
        </span>
        <h1>Không thể tải nội dung</h1>
        <p className="muted">
          Vui lòng thử lại. Nếu lỗi tiếp tục, hãy liên hệ quản trị viên.
        </p>
        <div className="errorPageActions">
          <button type="button" className="button h-12 w-full" onClick={reset}>
            <RotateCw size={16} aria-hidden="true" /> Tải lại trang
          </button>
        </div>
        <Link href="/" className="errorPageBack">
          <Home size={14} aria-hidden="true" />
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}

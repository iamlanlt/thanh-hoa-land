import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Thêm tin mới" };

export default async function NewPropertyPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <>
      <Link href="/admin/properties" className="adminBackLink">
        <ArrowLeft size={15} aria-hidden="true" />
        Quay lại danh sách tin đăng
      </Link>
      <div className="adminPageHeader">
        <div>
          <p className="eyebrow dark">Tin đăng</p>
          <h1>Thêm tin mới</h1>
        </div>
      </div>
      <PropertyForm />
    </>
  );
}

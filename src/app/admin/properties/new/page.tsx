import { PropertyForm } from "@/components/admin/PropertyForm";
import { PropertyFormPageHeader } from "@/components/admin/AdminPage";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Thêm tin mới" };

export default async function NewPropertyPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <>
      <PropertyFormPageHeader title="Thêm tin mới" />
      <PropertyForm />
    </>
  );
}

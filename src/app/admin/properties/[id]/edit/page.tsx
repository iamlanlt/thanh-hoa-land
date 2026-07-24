import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getProperty } from "@/services/property.service";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chỉnh sửa tin" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const property = await getProperty(id);
  if (!property) notFound();
  return (
    <>
      <Link href="/admin/properties" className="adminBackLink">
        <ArrowLeft size={15} aria-hidden="true" />
        Quay lại danh sách tin đăng
      </Link>
      <div className="adminPageHeader">
        <div>
          <p className="eyebrow dark">Tin đăng</p>
          <h1>Chỉnh sửa tin</h1>
        </div>
      </div>
      <PropertyForm
        propertyId={property.id}
        initial={{
          title: property.title,
          slug: property.slug,
          shortDescription: property.shortDescription || "",
          description: property.description || "",
          location: property.location,
          address: property.address || "",
          lat: property.lat,
          lng: property.lng,
          area: property.area?.toString() || "",
          price: property.price || "",
          priceValue: property.priceValue?.toString() || "",
          priceUnit: property.priceUnit || "",
          type: property.type || "",
          legalStatus: property.legalStatus || "",
          frontage: property.frontage?.toString() || "",
          accessRoadWidth: property.accessRoadWidth?.toString() || "",
          direction: property.direction || "",
          floors: property.floors?.toString() || "",
          bedrooms: property.bedrooms?.toString() || "",
          bathrooms: property.bathrooms?.toString() || "",
          furniture: property.furniture || "",
          status: property.status as "AVAILABLE" | "SOLD",
          featured: property.featured,
          published: property.published,
          sortOrder: property.sortOrder.toString(),
          images: property.images,
          videoUrls: property.videoUrls,
        }}
      />
    </>
  );
}

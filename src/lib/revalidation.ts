import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicPropertyPaths(slug?: string) {
  revalidateTag("public-properties", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/properties");
  if (slug) revalidatePath(`/properties/${slug}`);
}

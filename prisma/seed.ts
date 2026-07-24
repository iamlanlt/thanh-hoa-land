import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  galleryForType,
  legacyDemoSlugs,
  seedLeads,
  seedProperties,
} from "../src/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed admin data.");
  }
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: await hash(adminPassword, 12),
      name: "Quản trị viên",
    },
    create: {
      email: adminEmail,
      passwordHash: await hash(adminPassword, 12),
      name: "Quản trị viên",
    },
  });

  const settings = {
    brandName: "Thanh Hóa Land",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "thelaniq@gmail.com",
    phone: process.env.NEXT_PUBLIC_PHONE || "0374170474",
    zaloUrl: process.env.NEXT_PUBLIC_ZALO_URL || "https://zalo.me/0374170474",
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
    tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL || "",
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
    faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || "",
    seoTitle:
      process.env.NEXT_PUBLIC_SEO_TITLE ||
      "Thanh Hóa Land | Bất động sản Thanh Hóa",
    seoDescription:
      process.env.NEXT_PUBLIC_SEO_DESCRIPTION ||
      "Nhà đất chọn lọc, thông tin rõ ràng và tư vấn tận tâm tại Thanh Hóa.",
    ogImageUrl: process.env.NEXT_PUBLIC_OG_IMAGE_URL || "",
    address: "Thanh Hóa, Việt Nam",
    workingHours: "Thứ 2 – Thứ 7, 08:00 – 18:00",
    mapQuery: process.env.NEXT_PUBLIC_MAP_QUERY || "Thanh Hóa, Việt Nam",
    mapEmbedUrl: process.env.NEXT_PUBLIC_MAP_EMBED_URL || "",
  };
  const shouldRefreshSettings = process.env.SEED_REFRESH_SETTINGS === "true";

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: shouldRefreshSettings ? { value } : {},
      create: { key, value },
    });
  }

  await prisma.property.updateMany({
    where: { slug: { in: [...legacyDemoSlugs] } },
    data: { published: false, deletedAt: new Date() },
  });

  const seededProperties = [];
  for (const [index, item] of seedProperties.entries()) {
    const gallery = galleryForType(item.type, index);
    const imageRecords = [0, 1, 2, 3].map((imageIndex) => ({
      url: gallery[imageIndex],
      alt: `${item.title} - ảnh ${imageIndex + 1}`,
      sortOrder: imageIndex,
    }));
    const published = "published" in item ? item.published : true;
    const commonData = {
      ...item,
      shortDescription: item.description.slice(0, 180),
      status: "status" in item ? item.status : "AVAILABLE",
      featured: item.featured,
      published,
      publishedAt: published
        ? new Date(Date.UTC(2026, 6, 12 - index, 2, 0, 0))
        : null,
      sortOrder: index,
      coverImage: imageRecords[0].url,
      deletedAt: null,
    };

    const property = await prisma.property.upsert({
      where: { slug: item.slug },
      update: {
        ...commonData,
        images: { deleteMany: {}, create: imageRecords },
      },
      create: {
        ...commonData,
        images: { create: imageRecords },
      },
    });
    seededProperties.push(property);
  }

  for (const [index, [name, phone, location, budget]] of seedLeads.entries()) {
    const property = seededProperties[index % seededProperties.length];
    const exists = await prisma.lead.findFirst({ where: { phone } });
    if (!exists) {
      await prisma.lead.create({
        data: {
          name,
          phone,
          location,
          budget,
          message: `Tôi muốn nhận thêm thông tin về ${property.title}.`,
          propertyId: property.id,
          consent: true,
          status: index === 0 ? "NEW" : index < 4 ? "CONTACTED" : "QUALIFIED",
        },
      });
    }
  }

  console.log(
    `Seed hoàn tất: ${seedProperties.length} tin đa dạng, ${seedLeads.length} lead mẫu; demo cũ được lưu trữ bằng soft-delete.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

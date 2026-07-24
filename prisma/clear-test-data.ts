import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [properties, leads] = await Promise.all([
    prisma.property.findMany({ select: { title: true, slug: true } }),
    prisma.lead.findMany({ select: { name: true, phone: true } }),
  ]);

  console.log(`Sẽ xóa ${properties.length} tin đăng:`);
  for (const property of properties)
    console.log(`  - ${property.title} (${property.slug})`);

  console.log(`\nSẽ xóa ${leads.length} khách hàng:`);
  for (const lead of leads) console.log(`  - ${lead.name} (${lead.phone})`);

  if (process.env.DRY_RUN !== "false") {
    console.log(
      "\n(DRY RUN — chưa xóa gì. Chạy với DRY_RUN=false để xóa thật.)",
    );
    return;
  }

  const deletedLeads = await prisma.lead.deleteMany({});
  const deletedProperties = await prisma.property.deleteMany({});
  console.log(
    `\nĐã xóa ${deletedLeads.count} khách hàng và ${deletedProperties.count} tin đăng (kèm ảnh liên quan).`,
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

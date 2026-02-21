import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@opspilot.com";
  const adminPassword = "Admin@123";
  const orgName = "OpsPilot Inc";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // 1️⃣ Upsert admin user with password
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: "Admin User",
      passwordHash, // ensures password is always updated
    },
    create: {
      email: adminEmail,
      fullName: "Admin User",
      passwordHash,
    },
  });

  // 2️⃣ Ensure organization exists
  const org =
    (await prisma.organization.findFirst({
      where: { name: orgName },
    })) ??
    (await prisma.organization.create({
      data: { name: orgName },
    }));

  // 3️⃣ Ensure membership exists with ADMIN role
  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: { role: Role.ADMIN },
    create: {
      organizationId: org.id,
      userId: user.id,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Seed complete:");
  console.log("Org:", org.name);
  console.log("Admin Email:", adminEmail);
  console.log("Admin Password:", adminPassword);
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
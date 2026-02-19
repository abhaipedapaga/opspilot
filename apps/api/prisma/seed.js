"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const adminEmail = "admin@opspilot.com";
    const orgName = "OpsPilot Inc";
    // 1) Ensure user exists
    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { fullName: "Admin User" },
        create: { email: adminEmail, fullName: "Admin User" },
    });
    // 2) Ensure org exists (by name; not unique by default)
    const existingOrg = await prisma.organization.findFirst({
        where: { name: orgName },
    });
    const org = existingOrg ??
        (await prisma.organization.create({
            data: { name: orgName },
        }));
    // 3) Ensure membership exists
    await prisma.membership.upsert({
        where: {
            organizationId_userId: {
                organizationId: org.id,
                userId: user.id,
            },
        },
        update: { role: client_1.Role.ADMIN },
        create: {
            organizationId: org.id,
            userId: user.id,
            role: client_1.Role.ADMIN,
        },
    });
    console.log("✅ Seed complete:", { org: org.name, adminEmail });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});

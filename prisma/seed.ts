import { hash } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_SEED_USERNAME?.trim() || "admin_smteam";
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase() || "admin@smteam.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD?.trim();

  if (!adminPassword) {
    throw new Error("ADMIN_SEED_PASSWORD is required for prisma seed.");
  }

  const adminPasswordHash = await hash(adminPassword, 12);

  await prisma.user.upsert({
    where: {
      email: adminEmail
    },
    update: {
      username: adminUsername,
      usernameNormalized: adminUsername.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isBanned: false
    },
    create: {
      email: adminEmail,
      username: adminUsername,
      usernameNormalized: adminUsername.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  console.log("Admin user is ready:");
  console.log("login: " + adminUsername);
  console.log("email: " + adminEmail);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

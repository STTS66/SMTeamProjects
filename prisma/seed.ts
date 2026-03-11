import { hash } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await hash("SmT_Admin!SuperSecure_2026_$$", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@smteam.local"
    },
    update: {
      username: "admin_smteam",
      usernameNormalized: "admin_smteam",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isBanned: false
    },
    create: {
      email: "admin@smteam.local",
      username: "admin_smteam",
      usernameNormalized: "admin_smteam",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  console.log("Admin user is ready:");
  console.log("login: admin_smteam");
  console.log("email: admin@smteam.local");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

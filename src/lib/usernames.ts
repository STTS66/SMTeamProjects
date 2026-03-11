import { prisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/utils";

export async function ensureGoogleUsername(
  userId: string,
  email: string,
  name?: string | null
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!existingUser || existingUser.usernameNormalized) {
    return existingUser;
  }

  const rawBase =
    name?.trim() ||
    email.split("@")[0]?.trim() ||
    `smteam-${userId.slice(0, 8)}`;

  const safeBase = rawBase.replace(/[^a-zA-Z0-9_.-]+/g, "-").slice(0, 24) || "smteam-user";
  const normalizedBase = normalizeUsername(safeBase);

  let username = safeBase;
  let usernameNormalized = normalizedBase;
  let suffix = 1;

  while (
    await prisma.user.findFirst({
      where: {
        usernameNormalized
      },
      select: {
        id: true
      }
    })
  ) {
    username = `${safeBase}-${suffix}`;
    usernameNormalized = normalizeUsername(username);
    suffix += 1;
  }

  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      username,
      usernameNormalized
    }
  });
}

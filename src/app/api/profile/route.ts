import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveAvatar } from "@/lib/uploads";
import { normalizeUsername } from "@/lib/utils";
import { profileSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Требуется авторизация." },
      { status: 401 }
    );
  }

  const form = await request.formData();
  const parsed = profileSchema.safeParse({
    username: String(form.get("username") ?? "")
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Некорректный никнейм."
      },
      { status: 400 }
    );
  }

  const usernameNormalized = normalizeUsername(parsed.data.username);
  const exists = await prisma.user.findUnique({
    where: { usernameNormalized },
    select: { id: true }
  });

  if (exists && exists.id !== session.user.id) {
    return NextResponse.json(
      { error: "Этот никнейм уже занят." },
      { status: 409 }
    );
  }

  const avatar = form.get("avatar");
  let image: string | undefined;

  try {
    image =
      avatar instanceof File && avatar.size > 0
        ? (await saveAvatar(avatar)) ?? undefined
        : undefined;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Не удалось обработать аватар."
      },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username: parsed.data.username,
      usernameNormalized,
      image,
      lastSeenAt: new Date()
    }
  });

  return NextResponse.json({ success: true });
}

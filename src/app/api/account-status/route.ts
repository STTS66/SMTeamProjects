import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupportBotUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      isBanned: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  }

  return NextResponse.json({
    isBanned: user.isBanned,
    supportBotUrl: getSupportBotUrl()
  });
}

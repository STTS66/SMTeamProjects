import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/utils";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: parsedBody.error.issues[0]?.message ?? "Некорректные данные формы."
      },
      { status: 400 }
    );
  }

  const email = parsedBody.data.email.trim().toLowerCase();
  const username = parsedBody.data.username.trim();
  const usernameNormalized = normalizeUsername(username);

  const [emailExists, usernameExists] = await Promise.all([
    prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true
      }
    }),
    prisma.user.findUnique({
      where: {
        usernameNormalized
      },
      select: {
        id: true
      }
    })
  ]);

  if (emailExists) {
    return NextResponse.json(
      {
        error: "Пользователь с таким email уже существует."
      },
      { status: 409 }
    );
  }

  if (usernameExists) {
    return NextResponse.json(
      {
        error: "Этот логин уже занят."
      },
      { status: 409 }
    );
  }

  const passwordHash = await hash(parsedBody.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      usernameNormalized,
      passwordHash,
      lastSeenAt: new Date()
    },
    select: {
      id: true,
      email: true,
      username: true
    }
  });

  return NextResponse.json({
    success: true,
    user
  });
}

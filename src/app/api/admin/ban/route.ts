import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getPayload(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: NextResponse.json({ error: "Недостаточно прав." }, { status: 403 }) };
  const body = await request.json() as { userId?: string };
  if (!body.userId || body.userId === session.user.id) return { error: NextResponse.json({ error: "Некорректный userId." }, { status: 400 }) };
  return { userId: body.userId };
}

export async function POST(request: Request) {
  const payload = await getPayload(request);
  if ("error" in payload) return payload.error;
  await prisma.user.update({ where: { id: payload.userId }, data: { isBanned: true } });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const payload = await getPayload(request);
  if ("error" in payload) return payload.error;
  await prisma.user.update({ where: { id: payload.userId }, data: { isBanned: false } });
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { projectSchema } from "@/lib/validations/project";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  const form = await request.formData();
  const parsed = projectSchema.safeParse({ description: String(form.get("description") ?? "") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некорректное описание." }, { status: 400 });
  const files = form.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
  const uploads = [];
  for (const file of files.slice(0, 8)) {
    const upload = await saveUpload(file, "projects");
    if (upload) uploads.push(upload);
  }
  await prisma.project.create({ data: { description: parsed.data.description, authorId: session.user.id, attachments: { create: uploads.map((file) => ({ fileName: file.fileName, storageKey: file.storageKey, publicUrl: file.publicUrl, mimeType: file.mimeType, size: file.size, kind: file.kind })) } } });
  return NextResponse.json({ success: true });
}

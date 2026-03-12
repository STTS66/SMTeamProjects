import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { removeFilesFromSupabase } from "@/lib/supabase-storage";

type RouteContext = {
  params: Promise<{
    projectId: string;
    attachmentId: string;
  }>;
};

function getContentDisposition(fileName: string) {
  const asciiFallback =
    fileName
      .normalize("NFKD")
      .replace(/[^\x20-\x7E]+/g, "_")
      .replace(/"/g, "") || "download";
  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

async function getAttachment(projectId: string, attachmentId: string) {
  return prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      projectId
    }
  });
}

export async function GET(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.isBanned) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  const { projectId, attachmentId } = await context.params;
  const attachment = await getAttachment(projectId, attachmentId);

  if (!attachment) {
    return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
  }

  try {
    let buffer: Buffer;

    if (attachment.publicUrl.startsWith("/uploads/")) {
      const relativePath = attachment.publicUrl.replace(/^\/+/, "");
      const absolutePath = path.join(process.cwd(), "public", relativePath);
      buffer = await readFile(absolutePath);
    } else {
      const response = await fetch(attachment.publicUrl, {
        cache: "no-store"
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Файл недоступен на сайте." }, { status: 404 });
      }

      buffer = Buffer.from(await response.arrayBuffer());
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "content-type": attachment.mimeType || "application/octet-stream",
        "content-length": String(buffer.byteLength),
        "content-disposition": getContentDisposition(attachment.fileName),
        "cache-control": "private, no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "Файл недоступен на сайте." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const { projectId, attachmentId } = await context.params;
  const attachment = await getAttachment(projectId, attachmentId);

  if (!attachment) {
    return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
  }

  await prisma.attachment.delete({
    where: {
      id: attachment.id
    }
  });

  void removeFilesFromSupabase([attachment.storageKey]).catch((error) => {
    console.error("[attachment:delete] Failed to remove file", error);
  });

  return NextResponse.json({ success: true });
}

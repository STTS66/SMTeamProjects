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

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const { projectId, attachmentId } = await context.params;
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      projectId
    }
  });

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

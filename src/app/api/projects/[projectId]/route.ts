import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  removeFilesFromSupabase,
  type SupabaseStoredFile
} from "@/lib/supabase-storage";
import { saveUpload } from "@/lib/uploads";
import { projectSchema } from "@/lib/validations/project";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

async function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: {
      id: projectId
    },
    include: {
      attachments: true
    }
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const { projectId } = await context.params;
  const project = await getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Проект не найден." }, { status: 404 });
  }

  const form = await request.formData();
  const parsed = projectSchema.safeParse({
    description: String(form.get("description") ?? "")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректное описание." },
      { status: 400 }
    );
  }

  const files = form
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);
  const uploadedFiles: SupabaseStoredFile[] = [];

  try {
    for (const file of files.slice(0, 8)) {
      const upload = await saveUpload(file, "projects");

      if (upload) {
        uploadedFiles.push(upload);
      }
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.project.update({
        where: {
          id: projectId
        },
        data: {
          description: parsed.data.description
        }
      });

      if (uploadedFiles.length) {
        await transaction.attachment.deleteMany({
          where: {
            projectId
          }
        });

        await transaction.attachment.createMany({
          data: uploadedFiles.map((file) => ({
            projectId,
            fileName: file.fileName,
            storageKey: file.storageKey,
            publicUrl: file.publicUrl,
            mimeType: file.mimeType,
            size: file.size,
            kind: file.kind
          }))
        });
      }
    });

    if (uploadedFiles.length) {
      void removeFilesFromSupabase(project.attachments.map((file) => file.storageKey)).catch(
        (error) => {
          console.error("[project:update] Failed to remove old files", error);
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (uploadedFiles.length) {
      await removeFilesFromSupabase(uploadedFiles.map((file) => file.storageKey)).catch(() => {
        return undefined;
      });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Не удалось обновить проект."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const { projectId } = await context.params;
  const project = await getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Проект не найден." }, { status: 404 });
  }

  await prisma.project.delete({
    where: {
      id: projectId
    }
  });

  void removeFilesFromSupabase(project.attachments.map((file) => file.storageKey)).catch(
    (error) => {
      console.error("[project:delete] Failed to remove files", error);
    }
  );

  return NextResponse.json({ success: true });
}

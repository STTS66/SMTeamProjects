import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sanitizeFileSegment } from "@/lib/utils";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export type SavedUpload = {
  fileName: string;
  publicUrl: string;
  storageKey: string;
  mimeType: string;
  size: number;
  kind: "IMAGE" | "VIDEO" | "FILE";
};

function resolveKind(mimeType: string): SavedUpload["kind"] {
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }

  if (mimeType.startsWith("video/")) {
    return "VIDEO";
  }

  return "FILE";
}

export async function saveAvatar(file: File) {
  if (!file.size) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Аватар должен быть изображением.");
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("Аватар не должен превышать 2 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;
}

export async function saveUpload(file: File, folder: "avatars" | "projects") {
  if (!file.size) {
    return null;
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Размер файла превышает 25 MB.");
  }

  const extension = path.extname(file.name);
  const safeBaseName =
    sanitizeFileSegment(path.basename(file.name, extension)) || "file";
  const finalFileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
  const storageKey = path.posix.join("uploads", folder, finalFileName);
  const absoluteDirectory = path.join(process.cwd(), "public", "uploads", folder);
  const absolutePath = path.join(absoluteDirectory, finalFileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(absoluteDirectory, { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    fileName: file.name,
    publicUrl: `/${storageKey}`,
    storageKey,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    kind: resolveKind(file.type)
  } satisfies SavedUpload;
}

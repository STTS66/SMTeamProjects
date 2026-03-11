import { uploadFileToSupabase } from "@/lib/supabase-storage";

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

  const uploaded = await uploadFileToSupabase(file, folder);

  if (!uploaded) {
    return null;
  }

  return uploaded satisfies SavedUpload;
}

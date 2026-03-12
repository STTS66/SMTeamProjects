import { randomUUID } from "node:crypto";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseStorageConfig } from "@/lib/env";
import { sanitizeFileSegment } from "@/lib/utils";

export type SupabaseStoredFile = {
  fileName: string;
  publicUrl: string;
  storageKey: string;
  mimeType: string;
  size: number;
  kind: "IMAGE" | "VIDEO" | "FILE";
};

let supabaseAdmin: SupabaseClient | null = null;
let ensuredBucketName: string | null = null;
let ensureBucketTask: Promise<void> | null = null;

function resolveKind(mimeType: string): SupabaseStoredFile["kind"] {
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }

  if (mimeType.startsWith("video/")) {
    return "VIDEO";
  }

  return "FILE";
}

function getStorageConfigOrThrow() {
  const config = getSupabaseStorageConfig();

  if (!config) {
    throw new Error(
      "Supabase Storage не настроен. Добавьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return config;
}

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const config = getStorageConfigOrThrow();

    supabaseAdmin = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseAdmin;
}

async function ensureBucket() {
  const { bucket } = getStorageConfigOrThrow();

  if (ensuredBucketName === bucket) {
    return;
  }

  if (!ensureBucketTask) {
    ensureBucketTask = (async () => {
      const client = getSupabaseAdmin();
      const { data, error } = await client.storage.getBucket(bucket);

      if (error) {
        const isMissingBucket = /not found|does not exist|404/i.test(error.message);

        if (!isMissingBucket) {
          throw new Error(`Не удалось проверить бакет Supabase Storage: ${error.message}`);
        }

        const { error: createError } = await client.storage.createBucket(bucket, {
          public: true
        });

        if (createError && !/already exists/i.test(createError.message)) {
          throw new Error(`Не удалось создать бакет Supabase Storage: ${createError.message}`);
        }

        ensuredBucketName = bucket;
        return;
      }

      if (!data.public) {
        const { error: updateError } = await client.storage.updateBucket(bucket, {
          public: true
        });

        if (updateError) {
          throw new Error(
            `Бакет Supabase Storage найден, но не удалось включить public access: ${updateError.message}`
          );
        }
      }

      ensuredBucketName = bucket;
    })().finally(() => {
      ensureBucketTask = null;
    });
  }

  await ensureBucketTask;
}

export async function uploadFileToSupabase(
  file: File,
  folder: "avatars" | "projects"
): Promise<SupabaseStoredFile | null> {
  if (!file.size) {
    return null;
  }

  await ensureBucket();

  const { bucket } = getStorageConfigOrThrow();
  const client = getSupabaseAdmin();
  const extension = path.extname(file.name);
  const safeBaseName =
    sanitizeFileSegment(path.basename(file.name, extension)) || "file";
  const fileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
  const storageKey = `${folder}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const { error: uploadError } = await client.storage.from(bucket).upload(storageKey, buffer, {
    contentType: mimeType,
    upsert: false
  });

  if (uploadError) {
    throw new Error(`Не удалось загрузить файл в Supabase Storage: ${uploadError.message}`);
  }

  const {
    data: { publicUrl }
  } = client.storage.from(bucket).getPublicUrl(storageKey);

  return {
    fileName: file.name,
    publicUrl,
    storageKey,
    mimeType,
    size: file.size,
    kind: resolveKind(mimeType)
  };
}

export async function removeFilesFromSupabase(storageKeys: string[]) {
  const keysToRemove = storageKeys.filter(
    (storageKey) => storageKey && !storageKey.startsWith("uploads/")
  );

  if (!keysToRemove.length) {
    return;
  }

  const config = getSupabaseStorageConfig();

  if (!config) {
    return;
  }

  await ensureBucket();

  const client = getSupabaseAdmin();
  const { error } = await client.storage.from(config.bucket).remove(keysToRemove);

  if (error) {
    throw new Error(`Не удалось удалить файл из Supabase Storage: ${error.message}`);
  }
}

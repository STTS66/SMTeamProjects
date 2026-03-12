function getRealValue(...values: Array<string | undefined>) {
  for (const value of values) {
    if (!value) continue;

    const normalized = value.trim();

    if (!normalized) continue;
    if (normalized.toLowerCase().startsWith("paste-google-")) continue;

    return normalized;
  }

  return undefined;
}

export function getGoogleOAuthConfig() {
  const clientId = getRealValue(process.env.GOOGLE_CLIENT_ID, process.env.AUTH_GOOGLE_ID);
  const clientSecret = getRealValue(
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.AUTH_GOOGLE_SECRET
  );

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export function isGoogleOAuthConfigured() {
  return Boolean(getGoogleOAuthConfig());
}

export function getAuthBaseUrl() {
  return getRealValue(process.env.AUTH_URL, process.env.RENDER_EXTERNAL_URL);
}

export function shouldTrustHost() {
  return process.env.AUTH_TRUST_HOST === "true" || process.env.RENDER === "true";
}

export function getSupabaseStorageConfig() {
  const url = getRealValue(process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = getRealValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = getRealValue(process.env.SUPABASE_STORAGE_BUCKET) ?? "smteam-files";

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url,
    serviceRoleKey,
    bucket
  };
}

export function getSupportBotUrl() {
  return (
    getRealValue(process.env.SUPPORT_BOT_URL, process.env.NEXT_PUBLIC_SUPPORT_BOT_URL) ??
    "https://t.me/smteam_support_bot"
  );
}

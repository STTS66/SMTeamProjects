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

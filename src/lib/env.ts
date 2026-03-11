function hasRealValue(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && !normalized.startsWith("paste-google-");
}

export function isGoogleOAuthConfigured() {
  return hasRealValue(process.env.GOOGLE_CLIENT_ID) && hasRealValue(process.env.GOOGLE_CLIENT_SECRET);
}
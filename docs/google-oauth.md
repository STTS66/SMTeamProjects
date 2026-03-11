# Google OAuth Setup

## 1. Create credentials in Google Cloud

Create an OAuth Client ID for a Web application in Google Cloud Console.

Authorized redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `https://smteamprojects-web.onrender.com/api/auth/callback/google`

If you later attach a custom domain, add one more redirect URI for that exact domain.

## 2. Fill environment variables

Set these variables locally and on Render:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Optional aliases also supported by the project:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## 3. Render variables

Make sure Render also has:

- `AUTH_SECRET`
- `DATABASE_URL`
- `AUTH_TRUST_HOST=true`

`AUTH_URL` is optional on Render when `RENDER_EXTERNAL_URL` is available, but it is still safe to set it explicitly.

## 4. Result

After valid Google credentials are added:

- the Google button appears on `/login`
- the Google button appears on `/register`
- a new Google user can be created correctly
- username generation is handled automatically for Google accounts

import { NextResponse } from "next/server";

type VanillaPageName = "login" | "register" | "projects" | "profile" | "admin";

function escapeJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function htmlPageResponse({
  title,
  page,
  data
}: {
  title: string;
  page: VanillaPageName;
  data: unknown;
}) {
  const html = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="SMTeam projects platform" />
    <link rel="stylesheet" href="/vanilla/app.css" />
  </head>
  <body data-page="${page}">
    <div id="app"></div>
    <script id="smteam-bootstrap" type="application/json">${escapeJson(data)}</script>
    <script type="module" src="/vanilla/${page}.js"></script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}

export function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

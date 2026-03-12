import { auth } from "@/auth";
import { getSupportBotUrl, isGoogleOAuthConfigured } from "@/lib/env";
import { htmlPageResponse, redirectTo } from "@/lib/vanilla-page";

export async function GET(request: Request) {
  const session = await auth();

  if (session?.user) {
    return redirectTo(request, "/projects");
  }

  const url = new URL(request.url);

  return htmlPageResponse({
    title: "Вход | SMTeam",
    page: "login",
    data: {
      googleEnabled: isGoogleOAuthConfigured(),
      error: url.searchParams.get("error") ?? "",
      callbackUrl: url.searchParams.get("callbackUrl") ?? "/projects",
      supportBotUrl: getSupportBotUrl()
    }
  });
}

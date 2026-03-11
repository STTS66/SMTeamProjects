import { auth } from "@/auth";
import { isGoogleOAuthConfigured } from "@/lib/env";
import { htmlPageResponse, redirectTo } from "@/lib/vanilla-page";

export async function GET(request: Request) {
  const session = await auth();

  if (session?.user) {
    return redirectTo(request, "/projects");
  }

  return htmlPageResponse({
    title: "Регистрация | SMTeam",
    page: "register",
    data: {
      googleEnabled: isGoogleOAuthConfigured()
    }
  });
}

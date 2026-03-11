import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { htmlPageResponse, redirectTo } from "@/lib/vanilla-page";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return redirectTo(request, "/login");
  }

  if (session.user.isBanned) {
    return redirectTo(request, "/login?error=AccessDenied");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { projects: true } } }
  });

  if (!user) {
    return redirectTo(request, "/login");
  }

  return htmlPageResponse({
    title: "Профиль | SMTeam",
    page: "profile",
    data: {
      user: {
        email: user.email,
        username: user.username,
        image: user.image,
        role: user.role,
        projectsCount: user._count.projects
      }
    }
  });
}

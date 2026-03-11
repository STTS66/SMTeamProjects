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

  const [currentUser, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        username: true,
        image: true,
        role: true
      }
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            email: true,
            username: true,
            image: true
          }
        },
        attachments: true
      }
    })
  ]);

  return htmlPageResponse({
    title: "Проекты | SMTeam",
    page: "projects",
    data: {
      user: currentUser ?? {
        email: session.user.email ?? "",
        username: session.user.username ?? null,
        image: null,
        role: session.user.role ?? "USER"
      },
      projects
    }
  });
}

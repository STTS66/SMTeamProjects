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

  if (session.user.role !== "ADMIN") {
    return redirectTo(request, "/projects");
  }

  const onlineFrom = new Date(Date.now() - 15 * 60 * 1000);

  const [currentUser, users, totalUsers, onlineUsers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        username: true,
        image: true,
        role: true
      }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isBanned: true,
        _count: { select: { projects: true } }
      }
    }),
    prisma.user.count(),
    prisma.user.count({ where: { lastSeenAt: { gte: onlineFrom } } })
  ]);

  return htmlPageResponse({
    title: "Админ-панель | SMTeam",
    page: "admin",
    data: {
      user: currentUser,
      totalUsers,
      onlineUsers,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isBanned: user.isBanned,
        projectsCount: user._count.projects,
        isCurrentAdmin: user.id === session.user.id
      }))
    }
  });
}

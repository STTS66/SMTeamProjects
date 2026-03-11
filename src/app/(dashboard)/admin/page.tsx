import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BanUserButton } from "@/components/admin/ban-user-button";
import { Panel } from "@/components/ui/panel";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/projects");
  const onlineFrom = new Date(Date.now() - 15 * 60 * 1000);
  const [users, totalUsers, onlineUsers] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, username: true, role: true, isBanned: true, _count: { select: { projects: true } } } }),
    prisma.user.count(),
    prisma.user.count({ where: { lastSeenAt: { gte: onlineFrom } } })
  ]);
  return <div className="page-shell stack"><div className="stats-row"><Panel><strong>{totalUsers}</strong><p>пользователей</p></Panel><Panel><strong>{onlineUsers}</strong><p>онлайн (15 мин)</p></Panel></div><Panel className="stack">{users.map((user) => <div key={user.id} className="user-row"><div><strong>{user.username ?? user.email}</strong><p className="helper-text">{user.role} • проектов: {user._count.projects}</p></div><BanUserButton userId={user.id} isBanned={user.isBanned} disabled={user.id === session.user.id} /></div>)}</Panel></div>;
}

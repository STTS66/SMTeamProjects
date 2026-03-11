import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.isBanned) {
    redirect("/login?error=AccessDenied");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true }
  });

  return (
    <DashboardShell session={session} userImage={currentUser?.image ?? null}>
      {children}
    </DashboardShell>
  );
}

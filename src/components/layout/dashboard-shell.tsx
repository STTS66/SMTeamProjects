import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { AppNav } from "@/components/layout/app-nav";

export function DashboardShell({
  children,
  session,
  userImage
}: {
  children: ReactNode;
  session: Session;
  userImage?: string | null;
}) {
  return (
    <div className="dashboard-shell">
      <AppNav
        role={session.user.role}
        username={session.user.username}
        image={userImage ?? null}
      />
      <main className="content-shell">{children}</main>
    </div>
  );
}

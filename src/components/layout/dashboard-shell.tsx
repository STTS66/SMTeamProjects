import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { AppNav } from "@/components/layout/app-nav";

export function DashboardShell({
  children,
  session
}: {
  children: ReactNode;
  session: Session;
}) {
  return (
    <div className="dashboard-shell">
      <AppNav
        role={session.user.role}
        username={session.user.username}
        image={session.user.image ?? null}
      />
      <main className="content-shell">{children}</main>
    </div>
  );
}

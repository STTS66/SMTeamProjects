import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="auth-layout"><section className="auth-hero"><p className="eyebrow">SMTeam</p><h1>Платформа публикации проектов</h1><p>Credentials login, Google OAuth, роли и база уже подготовлены.</p></section><section className="auth-card-shell">{children}</section></div>;
}

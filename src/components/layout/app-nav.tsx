"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/utils";

const baseLinks = [
  { href: "/projects", label: "Проекты" },
  { href: "/profile", label: "Профиль" }
] as const;

export function AppNav({
  role = "USER",
  username = null,
  image = null
}: {
  role?: "USER" | "ADMIN";
  username?: string | null;
  image?: string | null;
}) {
  const pathname = usePathname();
  const links =
    role === "ADMIN"
      ? [...baseLinks, { href: "/admin", label: "Админ" }]
      : baseLinks;

  return (
    <header className="topbar">
      <Link href="/projects" className="brand-link">
        SMTeam
      </Link>
      <nav className="nav-strip">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cx(
              "nav-link",
              pathname === link.href && "nav-link-active"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="nav-user-block">
        <Avatar src={image} name={username ?? "User"} size="sm" />
        <span>{username ?? "User"}</span>
        <Button
          variant="ghost"
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
        >
          Выйти
        </Button>
      </div>
    </header>
  );
}

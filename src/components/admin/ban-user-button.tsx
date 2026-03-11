"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function BanUserButton({ userId, isBanned, disabled = false }: { userId: string; isBanned: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return <Button type="button" variant={isBanned ? "secondary" : "danger"} disabled={disabled || pending} onClick={() => {
    start(async () => {
      await fetch("/api/admin/ban", { method: isBanned ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      router.refresh();
    });
  }}>{disabled ? "Это вы" : pending ? "Сохраняем..." : isBanned ? "Разбанить" : "Забанить"}</Button>;
}

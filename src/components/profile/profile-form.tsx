"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

export function ProfileForm({ username, email }: { username: string | null; email: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return <Panel><form className="form-grid" onSubmit={(event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    start(async () => {
      const response = await fetch("/api/profile", { method: "POST", body: form });
      const data = await response.json() as { error?: string };
      if (!response.ok) return setError(data.error ?? "Не удалось обновить профиль.");
      router.refresh();
    });
  }}>
    <h3>{username ?? email}</h3>
    <label className="field"><span>Никнейм</span><Input name="username" defaultValue={username ?? ""} /></label>
    <label className="field"><span>Аватарка</span><input className="file-input" name="avatar" type="file" accept="image/*" /></label>
    {error ? <p className="error-text">{error}</p> : null}
    <Button disabled={pending}>{pending ? "Сохраняем..." : "Сохранить"}</Button>
  </form></Panel>;
}

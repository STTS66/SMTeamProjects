"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return <form className="form-grid" onSubmit={(event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = { username: String(form.get("username") ?? ""), email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") };
    start(async () => {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string };
      if (!response.ok) return setError(data.error ?? "Не удалось создать аккаунт.");
      const result = await signIn("credentials", { redirect: false, identifier: payload.email, password: payload.password, callbackUrl: "/projects" });
      if (result?.error) return router.push("/login");
      router.push(result?.url ?? "/projects");
      router.refresh();
    });
  }}>
    <label className="field"><span>Логин</span><Input name="username" /></label>
    <label className="field"><span>Email</span><Input name="email" type="email" /></label>
    <label className="field"><span>Пароль</span><Input name="password" type="password" /></label>
    {error ? <p className="error-text">{error}</p> : null}
    <Button fullWidth disabled={pending}>{pending ? "Создаем..." : "Зарегистрироваться"}</Button>
    {googleEnabled ? <p className="helper-text">Google OAuth тоже поддержан.</p> : null}
    <p className="footer-note">Уже есть аккаунт? <Link href="/login">Войти</Link></p>
  </form>;
}

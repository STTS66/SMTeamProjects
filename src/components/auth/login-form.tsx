"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export function LoginForm({ googleEnabled, initialError = "" }: { googleEnabled: boolean; initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [pending, start] = useTransition();

  return <form className="form-grid" onSubmit={(event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    start(async () => {
      const result = await signIn("credentials", { redirect: false, identifier: String(form.get("identifier") ?? ""), password: String(form.get("password") ?? ""), callbackUrl: "/projects" });
      if (result?.error) return setError("Не удалось войти. Проверьте логин и пароль.");
      router.push(result?.url ?? "/projects");
      router.refresh();
    });
  }}>
    <label className="field"><span>Email или логин</span><Input name="identifier" placeholder="admin_smteam" /></label>
    <label className="field"><span>Пароль</span><Input name="password" type="password" placeholder="Введите пароль" /></label>
    {error ? <p className="error-text">{error}</p> : null}
    <Button fullWidth disabled={pending}>{pending ? "Входим..." : "Войти"}</Button>
    {googleEnabled ? <GoogleSignInButton /> : <p className="helper-text">Google OAuth включится после добавления env-переменных.</p>}
    <p className="footer-note">Нет аккаунта? <Link href="/register">Зарегистрироваться</Link></p>
  </form>;
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

export function PublishProjectForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return <Panel><form className="form-grid" onSubmit={(event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    start(async () => {
      const response = await fetch("/api/projects", { method: "POST", body: form });
      const data = await response.json() as { error?: string };
      if (!response.ok) return setError(data.error ?? "Не удалось опубликовать проект.");
      event.currentTarget.reset();
      router.refresh();
    });
  }}>
    <h3>Опубликовать проект</h3>
    <label className="field"><span>Описание</span><Textarea name="description" rows={5} /></label>
    <label className="field"><span>Файлы</span><input className="file-input" name="files" type="file" multiple /></label>
    {error ? <p className="error-text">{error}</p> : null}
    <Button disabled={pending}>{pending ? "Публикуем..." : "Опубликовать"}</Button>
  </form></Panel>;
}

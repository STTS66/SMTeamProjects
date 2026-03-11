"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

export function ProfileForm({
  username,
  email,
  image
}: {
  username: string | null;
  email: string;
  image: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const displayName = username ?? email;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Panel>
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          const form = new FormData(event.currentTarget);
          start(async () => {
            const response = await fetch("/api/profile", {
              method: "POST",
              body: form
            });
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
              return setError(data.error ?? "Не удалось обновить профиль.");
            }
            router.refresh();
          });
        }}
      >
        <div className="profile-avatar-card">
          <Avatar src={previewUrl ?? image} name={displayName} size="lg" />
          <div className="profile-avatar-meta">
            <h3>{displayName}</h3>
            <p className="helper-text">
              Здесь видно текущую аватарку. После выбора нового файла превью
              обновится сразу, ещё до сохранения.
            </p>
          </div>
        </div>
        <label className="field">
          <span>Никнейм</span>
          <Input name="username" defaultValue={username ?? ""} />
        </label>
        <label className="field">
          <span>Аватарка</span>
          <input
            className="file-input"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];

              setPreviewUrl((current) => {
                if (current) {
                  URL.revokeObjectURL(current);
                }

                return file ? URL.createObjectURL(file) : null;
              });
            }}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <Button disabled={pending}>
          {pending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </form>
    </Panel>
  );
}

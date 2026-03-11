"use client";

import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton({ disabled = false }: { disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      fullWidth
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await signIn("google", { callbackUrl: "/projects" });
        });
      }}
    >
      {isPending ? "Переходим в Google..." : "Продолжить через Google"}
    </Button>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Panel } from "@/components/ui/panel";
import { isGoogleOAuthConfigured } from "@/lib/env";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/projects");
  return (
    <Panel className="auth-card">
      <h2>Регистрация</h2>
      <RegisterForm googleEnabled={isGoogleOAuthConfigured()} />
    </Panel>
  );
}
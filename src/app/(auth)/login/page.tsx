import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Panel } from "@/components/ui/panel";

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user) redirect("/projects");
  const params = await searchParams;
  const error = params.error === "AccessDenied" ? "Доступ запрещен." : "";
  return <Panel className="auth-card"><h2>Вход</h2><LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} initialError={error} /></Panel>;
}

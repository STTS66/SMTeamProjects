import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { Panel } from "@/components/ui/panel";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { projects: true } } }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="page-shell grid-two">
      <ProfileForm
        username={user.username}
        email={user.email}
        image={user.image}
      />
      <Panel>
        <h3>Профиль</h3>
        <p>Роль: {user.role}</p>
        <p>Публикаций: {user._count.projects}</p>
      </Panel>
    </div>
  );
}

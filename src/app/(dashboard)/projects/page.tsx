import { auth } from "@/auth";
import { PublishProjectForm } from "@/components/projects/publish-project-form";
import { ProjectCard } from "@/components/projects/project-card";
import { Panel } from "@/components/ui/panel";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { author: { select: { email: true, username: true, image: true } }, attachments: true } });
  return <div className="page-shell stack">{session?.user.role === "ADMIN" ? <PublishProjectForm /> : null}{projects.length ? projects.map((project) => <ProjectCard key={project.id} project={project} />) : <Panel><p>Пока нет проектов.</p></Panel>}</div>;
}

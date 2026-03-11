import Image from "next/image";
import { Panel } from "@/components/ui/panel";
import { formatDate } from "@/lib/utils";

export function ProjectCard({ project }: { project: { description: string; createdAt: Date; author: { username: string | null; email: string; image: string | null }; attachments: Array<{ id: string; publicUrl: string; fileName: string; kind: "IMAGE" | "VIDEO" | "FILE" }> } }) {
  return <Panel className="stack-sm"><div><strong>{project.author.username ?? project.author.email}</strong><p className="helper-text">{formatDate(project.createdAt)}</p></div><p>{project.description}</p><div className="attachment-grid">{project.attachments.map((file) => file.kind === "IMAGE" ? <Image key={file.id} src={file.publicUrl} alt={file.fileName} width={800} height={500} className="attachment-image" /> : <a key={file.id} href={file.publicUrl} className="file-link">{file.fileName}</a>)}</div></Panel>;
}

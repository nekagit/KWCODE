import Link from "next/link";
import { Folders, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, ArrowRight } from "lucide-react";
import type { Project } from "@/types/project";
import { Card } from "@/components/shared/Card";
import { StatBadge } from "@/components/atoms/badges/StatBadge";
import { DeleteButton } from "@/components/atoms/buttons/DeleteButton";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string, e: React.MouseEvent) => void;
}

export function ProjectCard({
  project,
  onDelete,
}: ProjectCardProps) {
  return (
    <Card
      title={project.name}
      subtitle={project.description || undefined}
      footerButtons={
        <Link href={`/projects/${project.id}`} className="block">
          <Button variant="ghost" className="inline-flex items-center text-primary">
            Open <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      }
    >
      <DeleteButton onClick={(e: React.MouseEvent) => onDelete(project.id, e)} title="Delete project" />
      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex flex-wrap gap-1.5 text-xs mb-2">
          <StatBadge icon={MessageSquare} count={project.promptIds?.length ?? 0} label="PromptRecords" />
          <StatBadge icon={TicketIcon} count={project.ticketIds?.length ?? 0} label="Tickets" />
          <StatBadge icon={Layers} count={project.featureIds?.length ?? 0} label="Features" />
          <StatBadge icon={Lightbulb} count={project.ideaIds?.length ?? 0} label="Ideas" />
        </div>
        {project.repoPath && (
          <p className="text-xs text-muted-foreground truncate font-mono" title={project.repoPath}>
            <Folders className="h-3 w-3 inline-block mr-1" />
            {project.repoPath.split("/").pop() ?? project.repoPath}
          </p>
        )}
      </Link>
    </Card>
  );
}

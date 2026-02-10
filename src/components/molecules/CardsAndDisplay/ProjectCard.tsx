import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folders, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Trash2, ArrowRight } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string, e: React.MouseEvent) => void;
}

export function ProjectCard({
  project,
  onDelete,
}: ProjectCardProps) {
  return (
    <Card key={project.id} className="h-full transition-colors hover:bg-muted/50 relative group">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive z-10"
        title="Delete project"
        onClick={(e) => onDelete(project.id, e)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Link href={`/projects/${project.id}`} className="block">
        <CardHeader className="pb-2 pr-10">
          <CardTitle className="text-base flex items-center gap-2">
            <Folders className="h-4 w-4 shrink-0" />
            <span className="truncate">{project.name}</span>
          </CardTitle>
          {project.description && (
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              {project.promptIds.length}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <TicketIcon className="h-3 w-3" />
              {project.ticketIds.length}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Layers className="h-3 w-3" />
              {project.featureIds.length}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Lightbulb className="h-3 w-3" />
              {project.ideaIds.length}
            </Badge>
          </div>
          {project.repoPath && (
            <p className="text-xs text-muted-foreground truncate font-mono" title={project.repoPath}>
              {project.repoPath.split("/").pop() ?? project.repoPath}
            </p>
          )}
          <span className="inline-flex items-center text-xs text-primary mt-2">
            Open <ArrowRight className="h-3 w-3 ml-1" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}

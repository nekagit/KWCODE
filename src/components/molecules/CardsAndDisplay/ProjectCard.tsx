"use client";

import type { Project } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const ideaCount = project.ideaIds?.length ?? 0;
  const promptCount = project.promptIds?.length ?? 0;
  const meta =
    ideaCount > 0 || promptCount > 0
      ? [
          ideaCount ? `${ideaCount} idea${ideaCount !== 1 ? "s" : ""}` : "",
          promptCount ? `${promptCount} prompt${promptCount !== 1 ? "s" : ""}` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <Card
      role="article"
      className="group flex h-full flex-col cursor-pointer transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onClick={onOpen}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-1">
        <CardTitle className="text-base font-semibold leading-tight tracking-tight truncate min-w-0">
          {project.name}
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs text-muted-foreground hover:text-destructive h-8 px-2"
          title="Delete project"
          aria-label="Delete project"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(e);
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-4 pt-0 min-w-0 flex-1">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        {project.repoPath && (
          <p
            className="text-xs text-muted-foreground truncate"
            title={project.repoPath}
          >
            {project.repoPath}
          </p>
        )}
        {meta && (
          <p className="text-xs text-muted-foreground/80">{meta}</p>
        )}
      </CardContent>
    </Card>
  );
}

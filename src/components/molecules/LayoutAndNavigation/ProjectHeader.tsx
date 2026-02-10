"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Trash2 } from "lucide-react";
import type { Project } from "@/types/project";
import { deleteProject } from "@/lib/api-projects";

interface ProjectHeaderProps {
  project: Project;
  projectId: string;
}

export function ProjectHeader({ project, projectId }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            {project.name}
            {project.repoPath && (
              <Badge variant="secondary" className="text-sm font-mono">
                {project.repoPath.split("/").pop()}
              </Badge>
            )}
          </h1>
          {project.description && (
            <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}/edit`}>
            <Settings className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={async () => {
            if (confirm("Are you sure you want to delete this project?")) {
              await deleteProject(projectId);
              window.location.href = "/projects";
            }
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}

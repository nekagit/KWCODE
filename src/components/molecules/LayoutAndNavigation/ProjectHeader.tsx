"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Trash2 } from "lucide-react";
import type { Project } from "@/types/project";
import { deleteProject } from "@/lib/api-projects";
import { PageHeader } from "@/components/shared/PageHeader";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

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
        <PageHeader
          title={
            <>
              {project.name}
              {project.repoPath && (
                <Badge variant="secondary" className="text-sm font-mono ml-2">
                  {project.repoPath.split("/").pop()}
                </Badge>
              )}
            </>
          }
          description={project.description}
        />
      </div>
      <ButtonGroup alignment="right">
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
      </ButtonGroup>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, Trash2 } from "lucide-react";
import type { Project } from "@/types/project";
import { deleteProject } from "@/lib/api-projects";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface ProjectHeaderProps {
  project: Project;
  projectId: string;
}

export function ProjectHeader({ project, projectId }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-end">
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

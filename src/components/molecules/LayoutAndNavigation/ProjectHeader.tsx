"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Project } from "@/types/project";
import { deleteProject } from "@/lib/api-projects";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/ProjectHeader.tsx");

interface ProjectHeaderProps {
  project: Project;
  projectId: string;
}

export function ProjectHeader({ project, projectId }: ProjectHeaderProps) {
  const router = useRouter();
  return (
    <div className={classes[0]}>
      <ButtonGroup alignment="right">
        <Button
          variant="destructive"
          onClick={async () => {
            if (confirm("Are you sure you want to delete this project?")) {
              await deleteProject(projectId);
              router.replace("/projects");
            }
          }}
        >
          <Trash2 className={classes[1]} />
          Delete
        </Button>
      </ButtonGroup>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TestTube2, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectTestingTab.tsx");

interface ProjectTestingTabProps {
  project: Project;
  projectId: string;
}

export function ProjectTestingTab({
  project,
  projectId,
}: ProjectTestingTabProps) {
  return (
    <div className={classes[0]}>
      <ProjectCategoryHeader
        title="Testing"
        icon={<TestTube2 className={classes[1]} />}
        project={project}
      />

      <EmptyState
        icon={<TestTube2 className={classes[2]} />}
        title="Testing hub"
        description="Manage test templates, practices, phases, and coverage for this project."
        action={
          <Button asChild variant="outline">
            <Link href={`/testing?projectId=${projectId}`}>
              <ExternalLink className={classes[3]} />
              Open testing
            </Link>
          </Button>
        }
      />
    </div>
  );
}

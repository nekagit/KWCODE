"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectDocumentationTab.tsx");

interface ProjectDocumentationTabProps {
  project: Project;
  projectId: string;
}

export function ProjectDocumentationTab({
  project,
  projectId,
}: ProjectDocumentationTabProps) {
  return (
    <div className={classes[0]}>
      <ProjectCategoryHeader
        title="Documentation"
        icon={<FileText className={classes[1]} />}
        project={project}
      />

      <EmptyState
        icon={<FileText className={classes[2]} />}
        title="Documentation hub"
        description="Manage docs, ADRs, and project documentation for this project."
        action={
          <Button asChild variant="outline">
            <Link href={`/documentation?projectId=${projectId}`}>
              <ExternalLink className={classes[3]} />
              Open documentation
            </Link>
          </Button>
        }
      />
    </div>
  );
}

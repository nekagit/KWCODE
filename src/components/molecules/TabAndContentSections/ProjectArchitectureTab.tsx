"use client";

import { Building2 } from "lucide-react";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectArchitectureListItem } from "@/components/atoms/list-items/ProjectArchitectureListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectArchitectureTab.tsx");

interface ProjectArchitectureTabProps {
  project: Project;
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
}

export function ProjectArchitectureTab({
  project,
  projectId,
  showHeader = true,
}: ProjectArchitectureTabProps) {
  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Architectures"
          icon={<Building2 className={classes[1]} />}
          project={project}
        />
      )}

      {project.architectureIds?.length === 0 ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
      ) : (
        <GridContainer>
          {project.architectureIds?.map((architectureId) => (
            <ProjectArchitectureListItem
              key={architectureId}
              architecture={architectureId as any}
              projectId={projectId}
            />
          ))}
        </GridContainer>
      )}
    </div>
  );
}

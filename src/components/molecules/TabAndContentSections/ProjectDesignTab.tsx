"use client";

import { Palette } from "lucide-react";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectDesignListItem } from "@/components/atoms/list-items/ProjectDesignListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectDesignTab.tsx");

interface ProjectDesignTabProps {
  project: Project;
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
}

export function ProjectDesignTab({
  project,
  projectId,
  showHeader = true,
}: ProjectDesignTabProps) {
  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Design"
          icon={<Palette className={classes[1]} />}
          project={project}
        />
      )}

      {project.designIds?.length === 0 ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
      ) : (
        <GridContainer>
          {project.designIds?.map((designId) => (
            <ProjectDesignListItem
              key={designId}
              design={designId as any}
              projectId={projectId}
            />
          ))}
        </GridContainer>
      )}
    </div>
  );
}

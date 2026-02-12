"use client";

import { Lightbulb } from "lucide-react";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectIdeaListItem } from "@/components/atoms/list-items/ProjectIdeaListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectIdeasTab.tsx");

interface ProjectIdeasTabProps {
  project: Project;
  projectId: string;
  /** When false, used inside Setup card with section title above; omit header to avoid duplicate. */
  showHeader?: boolean;
}

export function ProjectIdeasTab({
  project,
  projectId,
  showHeader = true,
}: ProjectIdeasTabProps) {
  return (
    <div className={classes[0]}>
      {showHeader && (
        <ProjectCategoryHeader
          title="Ideas"
          icon={<Lightbulb className={classes[1]} />}
          project={project}
        />
      )}

      {project.ideaIds?.length === 0 ? (
        <div className="min-h-[140px] rounded-xl border border-border/40 bg-white dark:bg-card" />
      ) : (
        <GridContainer>
          {project.ideaIds?.map((ideaId) => (
            <ProjectIdeaListItem key={ideaId} idea={ideaId as any} projectId={projectId} />
          ))}
        </GridContainer>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectIdeaListItem } from "@/components/atoms/list-items/ProjectIdeaListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectIdeasTab.tsx");

interface ProjectIdeasTabProps {
  project: Project;
  projectId: string;
}

export function ProjectIdeasTab({
  project,
  projectId,
}: ProjectIdeasTabProps) {
  return (
    <div className={classes[0]}>
      <ProjectCategoryHeader
        title="Ideas"
        icon={<Lightbulb className={classes[1]} />}
        project={project}
      />

      {project.ideaIds?.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className={classes[1]} />}
          title="No ideas yet"
          description="Generate new ideas or add existing ones to your project."
          action={
            <Button asChild>
              <Link href={`/ideas?projectId=${projectId}`}>
                <Plus className={classes[3]} />
                New idea
              </Link>
            </Button>
          }
        />
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

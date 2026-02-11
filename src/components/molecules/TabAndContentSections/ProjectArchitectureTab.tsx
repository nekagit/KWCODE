"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectArchitectureListItem } from "@/components/atoms/list-items/ProjectArchitectureListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectArchitectureTab.tsx");

interface ProjectArchitectureTabProps {
  project: Project;
  projectId: string;
}

export function ProjectArchitectureTab({
  project,
  projectId,
}: ProjectArchitectureTabProps) {
  return (
    <div className={classes[0]}>
      <ProjectCategoryHeader
        title="Architectures"
        icon={<Building2 className={classes[1]} />}
        project={project}
      />

      {project.architectureIds?.length === 0 ? (
        <EmptyState
          icon={<Building2 className={classes[1]} />}
          title="No architectures yet"
          description="Define the high-level structure and components of your project."
          action={
            <Button asChild>
              <Link href={`/architecture?projectId=${projectId}`}>
                <Plus className={classes[3]} />
                New architecture
              </Link>
            </Button>
          }
        />
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

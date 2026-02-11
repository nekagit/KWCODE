"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectDesignListItem } from "@/components/atoms/list-items/ProjectDesignListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectDesignTab.tsx");

interface ProjectDesignTabProps {
  project: Project;
  projectId: string;
}

export function ProjectDesignTab({
  project,
  projectId,
}: ProjectDesignTabProps) {
  return (
    <div className={classes[0]}>
      <ProjectCategoryHeader
        title="Design"
        icon={<Palette className={classes[1]} />}
        project={project}
      />

      {project.designIds?.length === 0 ? (
        <EmptyState
          icon={<Palette className={classes[1]} />}
          title="No designs yet"
          description="Create a design to define the look and feel of your project."
          action={
            <Button asChild>
              <Link href={`/design?projectId=${projectId}`}>
                <Plus className={classes[3]} />
                New design
              </Link>
            </Button>
          }
        />
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

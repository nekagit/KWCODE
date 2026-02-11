"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectFeatureListItem } from "@/components/atoms/list-items/ProjectFeatureListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectFeaturesTab.tsx");

interface ProjectFeaturesTabProps {
  project: Project;
  projectId: string;
}

export function ProjectFeaturesTab({
  project,
  projectId,
}: ProjectFeaturesTabProps) {
  return (
    <div className={classes[0]}>
      <ProjectCategoryHeader
        title="Features"
        icon={<Layers className={classes[1]} />}
        project={project}
      />

      {project.featureIds?.length === 0 ? (
        <EmptyState
          icon={<Layers className={classes[1]} />}
          title="No features yet"
          description="Create features to group tickets and prompts for specific functionalities."
          action={
            <Button asChild>
              <Link href={`/feature?projectId=${projectId}`}>
                <Plus className={classes[3]} />
                New feature
              </Link>
            </Button>
          }
        />
      ) : (
        <GridContainer>
          {project.featureIds?.map((featureId) => (
            <ProjectFeatureListItem
              key={featureId}
              feature={featureId as any}
              projectId={projectId}
            />
          ))}
        </GridContainer>
      )}
    </div>
  );
}

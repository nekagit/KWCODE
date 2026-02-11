"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectHeader } from "@/components/shared/ProjectHeader";
import { ProjectFeatureListItem } from "@/components/atoms/list-items/ProjectFeatureListItem";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectFeaturesTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "features") => Promise<void>;
}

export function ProjectFeaturesTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectFeaturesTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <ProjectHeader
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={generateExport}
        categoryName="Features"
        categoryIcon={Layers}
        categoryLength={project.featureIds?.length || 0}
        newHref={`/feature?projectId=${projectId}`}
        newButtonText="New feature"
        exportCategory="features"
      />

      {project.featureIds?.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="No features yet"
          description="Create features to group tickets and prompts for specific functionalities."
          action={
            <Button asChild>
              <Link href={`/feature?projectId=${projectId}`}>
                <Plus className="h-4 w-4 mr-2" />
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

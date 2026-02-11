"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectDesignListItem } from "@/components/atoms/list-items/ProjectDesignListItem";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectDesignTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "design") => Promise<void>;
}

export function ProjectDesignTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectDesignTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <ProjectCategoryHeader
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={generateExport}
        categoryName="Design"
        categoryIcon={Palette}
        categoryLength={project.designIds?.length || 0}
        newHref={`/design?projectId=${projectId}`}
        newButtonText="New design"
        exportCategory="design"
      />

      {project.designIds?.length === 0 ? (
        <EmptyState
          icon={<Palette className="h-6 w-6" />}
          title="No designs yet"
          description="Create a design to define the look and feel of your project."
          action={
            <Button asChild>
              <Link href={`/design?projectId=${projectId}`}>
                <Plus className="h-4 w-4 mr-2" />
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

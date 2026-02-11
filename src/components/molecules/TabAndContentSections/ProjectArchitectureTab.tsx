"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectArchitectureListItem } from "@/components/atoms/list-items/ProjectArchitectureListItem";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectArchitectureTabProps {
  project: Project;
  projectId: string;
}

export function ProjectArchitectureTab({
  project,
  projectId,
}: ProjectArchitectureTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <ProjectCategoryHeader
        title="Architectures"
        icon={<Building2 className="h-6 w-6" />}
        project={project}
      />

      {project.architectureIds?.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No architectures yet"
          description="Define the high-level structure and components of your project."
          action={
            <Button asChild>
              <Link href={`/architecture?projectId=${projectId}`}>
                <Plus className="h-4 w-4 mr-2" />
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

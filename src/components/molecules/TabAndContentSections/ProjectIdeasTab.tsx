"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectIdeaListItem } from "@/components/atoms/list-items/ProjectIdeaListItem";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectIdeasTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
}

export function ProjectIdeasTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectIdeasTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <ProjectCategoryHeader
        title="Ideas"
        icon={<Lightbulb className="h-6 w-6" />}
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={generateExport}
        category="ideas"
      />

      {project.ideaIds?.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="h-6 w-6" />}
          title="No ideas yet"
          description="Generate new ideas or add existing ones to your project."
          action={
            <Button asChild>
              <Link href={`/ideas?projectId=${projectId}`}>
                <Plus className="h-4 w-4 mr-2" />
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

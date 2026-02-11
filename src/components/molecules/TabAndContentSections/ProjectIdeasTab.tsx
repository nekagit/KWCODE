"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectHeader } from "@/components/shared/ProjectHeader";
import { ProjectIdeaListItem } from "@/components/atoms/list-items/ProjectIdeaListItem";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectIdeasTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "ideas") => Promise<void>;
}

export function ProjectIdeasTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectIdeasTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <ProjectHeader
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={generateExport}
        categoryName="Ideas"
        categoryIcon={Lightbulb}
        categoryLength={project.ideaIds?.length || 0}
        newHref={`/ideas?projectId=${projectId}`}
        newButtonText="New idea"
        exportCategory="ideas"
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

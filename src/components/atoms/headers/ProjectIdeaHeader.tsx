import React from 'react';
import { Lightbulb } from "lucide-react";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import type { Project } from "@/types/project";

interface ProjectIdeaHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
}

export const ProjectIdeaHeader: React.FC<ProjectIdeaHeaderProps> = ({
  project,
  projectId,
  exportLoading,
  generateExport,
}) => {
  return (
    <ProjectCategoryHeader
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
  );
};

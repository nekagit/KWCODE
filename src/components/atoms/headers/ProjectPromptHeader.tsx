import React from 'react';
import { MessageSquare } from "lucide-react";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import type { Project } from "@/types/project";

interface ProjectPromptHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
}

export const ProjectPromptHeader: React.FC<ProjectPromptHeaderProps> = ({
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
      categoryName="Prompts"
      categoryIcon={MessageSquare}
      categoryLength={project.promptIds?.length || 0}
      newHref={`/prompts?projectId=${projectId}`}
      newButtonText="New prompt"
      exportCategory="prompts"
    />
  );
};

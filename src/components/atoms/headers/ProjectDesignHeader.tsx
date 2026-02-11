import React from 'react';
import { Palette } from "lucide-react";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import type { Project } from "@/types/project";

interface ProjectDesignHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
}

export const ProjectDesignHeader: React.FC<ProjectDesignHeaderProps> = ({
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
      categoryName="Design"
      categoryIcon={Palette}
      categoryLength={project.designIds?.length || 0}
      newHref={`/design?projectId=${projectId}`}
      newButtonText="New design"
      exportCategory="design"
    />
  );
};

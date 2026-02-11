import React from 'react';
import { Layers } from "lucide-react";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import type { Project } from "@/types/project";

interface ProjectFeatureHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
}

export const ProjectFeatureHeader: React.FC<ProjectFeatureHeaderProps> = ({
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
      categoryName="Features"
      categoryIcon={Layers}
      categoryLength={project.featureIds?.length || 0}
      newHref={`/feature?projectId=${projectId}`}
      newButtonText="New feature"
      exportCategory="features"
    />
  );
};

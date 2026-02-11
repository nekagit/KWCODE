import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import type { Project, ProjectTabCategory } from "@/types/project";

interface ProjectTabTriggerProps {
  category: { id: ProjectTabCategory; label: string; icon: React.ElementType };
  project: Project;
}

export const ProjectTabTrigger: React.FC<ProjectTabTriggerProps> = ({
  category,
  project,
}) => {
  const getCategoryLength = (categoryId: ProjectTabCategory) => {
    switch (categoryId) {
      case "design":
        return project.designIds?.length || 0;
      case "ideas":
        return project.ideaIds?.length || 0;
      case "features":
        return project.featureIds?.length || 0;
      case "tickets":
        return project.ticketIds?.length || 0;
      case "prompts":
        return project.promptIds?.length || 0;
      case "architecture":
        return project.architectureIds?.length || 0;
      default:
        return 0;
    }
  };

  return (
    <TabsTrigger value={category.id}>
      <category.icon className="h-4 w-4 mr-2" />
      {category.label} ({getCategoryLength(category.id)})
    </TabsTrigger>
  );
};

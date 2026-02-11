import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import type { Project, ProjectEntityCategories } from "@/types/project";

interface ProjectTabTriggerProps {
  category: { id: ProjectEntityCategories; label: string; icon: React.ElementType };
  project: Project;
}

export const ProjectTabTrigger: React.FC<ProjectTabTriggerProps> = ({
  category,
  project,
}) => {
  return (
    <TabsTrigger key={category.id} value={category.id}>
      <category.icon className="h-4 w-4 mr-2" />
      {category.label} ({project[`${category.id}Ids` as keyof Project].length})
    </TabsTrigger>
  );
};

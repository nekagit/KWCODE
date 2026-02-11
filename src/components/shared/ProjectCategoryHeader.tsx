import React from "react";
import type { Project } from "@/types/project";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";

interface ProjectCategoryHeaderProps {
  title: string | React.ReactNode;
  icon: React.ReactNode;
  project: Project;
}

export function ProjectCategoryHeader({
  title,
  icon,
  project,
}: ProjectCategoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <PageHeader title={title} icon={icon} description={project.description} />
      </div>
    </div>
  );
}

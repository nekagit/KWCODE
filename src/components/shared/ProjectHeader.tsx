import React from 'react';
import Link from "next/link";
import sharedClasses from './shared-classes';
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, LucideIcon } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { Project } from "@/types/project";

interface ProjectCategoryHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
  categoryName: string;
  categoryIcon: LucideIcon;
  categoryLength: number;
  newHref: string;
  newButtonText: string;
  exportCategory: string;
}

export const ProjectCategoryHeader: React.FC<ProjectCategoryHeaderProps> = ({
  project,
  projectId,
  exportLoading,
  generateExport,
  categoryName,
  categoryIcon: CategoryIcon,
  categoryLength,
  newHref,
  newButtonText,
  exportCategory,
}) => {
  return (
    <div data-shared-ui className={sharedClasses.ProjectHeader.root}>
      <h2 className={sharedClasses.ProjectHeader.title}>
        <CategoryIcon className={sharedClasses.ProjectHeader.titleIcon} /> {categoryName} ({categoryLength})
      </h2>
      <ButtonGroup alignment="right">
        <Button variant="outline" size="sm" asChild>
          <Link href={newHref}>
            <Plus className="h-4 w-4 mr-2" />
            {newButtonText}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateExport(exportCategory)}
          disabled={exportLoading || categoryLength === 0}
        >
          {exportLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export all
        </Button>
      </ButtonGroup>
    </div>
  );
};

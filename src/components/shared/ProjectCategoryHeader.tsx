import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Trash2, Download } from "lucide-react";
import type { Project } from "@/types/project";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface ProjectCategoryHeaderProps {
  title: string | React.ReactNode;
  icon: React.ReactNode;
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
  category: string;
}

export function ProjectCategoryHeader({
  title,
  icon,
  project,
  projectId,
  exportLoading,
  generateExport,
  category,
}: ProjectCategoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <PageHeader title={title} icon={icon} description={project.description} />
      </div>
      <ButtonGroup alignment="right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => generateExport(category)}
          disabled={exportLoading}
        >
          {exportLoading ? (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export to {category === "architecture" ? "Architecture.md" : "Markdown"}
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}/edit`}>
            <Settings className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </ButtonGroup>
    </div>
  );
}

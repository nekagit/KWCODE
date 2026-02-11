import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, Building2 } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { Project } from "@/types/project";

interface ProjectArchitectureHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "architecture") => Promise<void>;
}

export const ProjectArchitectureHeader: React.FC<ProjectArchitectureHeaderProps> = ({
  project,
  projectId,
  exportLoading,
  generateExport,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Building2 className="h-5 w-5" /> Architecture ({project.architectureIds.length})
      </h2>
      <ButtonGroup alignment="right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/architecture?projectId=${projectId}`}>
            <Plus className="h-4 w-4 mr-2" />
            New architecture
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateExport("architecture")}
          disabled={exportLoading || project.architectureIds.length === 0}
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

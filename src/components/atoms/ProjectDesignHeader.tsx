import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, Palette } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { Project } from "@/types/project";

interface ProjectDesignHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "design") => Promise<void>;
}

export const ProjectDesignHeader: React.FC<ProjectDesignHeaderProps> = ({
  project,
  projectId,
  exportLoading,
  generateExport,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Palette className="h-5 w-5" /> Design ({project.designIds.length})
      </h2>
      <ButtonGroup alignment="right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/design?projectId=${projectId}`}>
            <Plus className="h-4 w-4 mr-2" />
            New design
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateExport("design")}
          disabled={exportLoading || project.designIds.length === 0}
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

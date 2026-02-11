import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, Layers } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { Project } from "@/types/project";

interface ProjectFeatureHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "features") => Promise<void>;
}

export const ProjectFeatureHeader: React.FC<ProjectFeatureHeaderProps> = ({
  project,
  projectId,
  exportLoading,
  generateExport,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Layers className="h-5 w-5" /> Features ({project.featureIds.length})
      </h2>
      <ButtonGroup alignment="right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/feature?projectId=${projectId}`}>
            <Plus className="h-4 w-4 mr-2" />
            New feature
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateExport("features")}
          disabled={exportLoading || project.featureIds.length === 0}
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

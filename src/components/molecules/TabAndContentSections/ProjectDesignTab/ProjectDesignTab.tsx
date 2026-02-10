"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, ArrowRight, Palette } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import type { Project } from "@/types/project";

interface ProjectDesignTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "design") => Promise<void>;
}

export function ProjectDesignTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectDesignTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5" /> Design ({project.designIds.length})
        </h2>
        <div className="flex gap-2">
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
        </div>
      </div>

      {project.designs.length === 0 ? (
        <Empty
          icon={<Palette className="h-6 w-6" />}
          title="No designs yet"
          description="Create a design to define the look and feel of your project."
        >
          <Button asChild>
            <Link href={`/design?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New design
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.designs.map((design) => (
            <Card key={design.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="truncate">{design.name}</span>
                </CardTitle>
                {design.description && (
                  <CardDescription className="line-clamp-2">{design.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`/design/${design.id}?projectId=${projectId}`}>
                    Open design <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

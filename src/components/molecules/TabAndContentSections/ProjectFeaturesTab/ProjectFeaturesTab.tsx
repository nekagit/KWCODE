"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, ArrowRight, Layers } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import type { Project } from "@/types/project";

interface ProjectFeaturesTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "features") => Promise<void>;
}

export function ProjectFeaturesTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectFeaturesTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5" /> Features ({project.featureIds.length})
        </h2>
        <div className="flex gap-2">
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
        </div>
      </div>

      {project.features.length === 0 ? (
        <Empty
          icon={<Layers className="h-6 w-6" />}
          title="No features yet"
          description="Create features to group tickets and prompts for specific functionalities."
        >
          <Button asChild>
            <Link href={`/feature?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New feature
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.features.map((feature) => (
            <Card key={feature.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="truncate">{feature.title}</span>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {feature.ticket_ids.length} tickets, {feature.prompt_ids.length} prompts
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`/feature/${feature.id}?projectId=${projectId}`}>
                    Open feature <ArrowRight className="h-4 w-4 ml-2" />
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

"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, ArrowRight, Building2 } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import type { Project } from "@/types/project";

interface ProjectArchitectureTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "architecture") => Promise<void>;
}

export function ProjectArchitectureTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectArchitectureTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Architecture ({project.architectureIds.length})
        </h2>
        <div className="flex gap-2">
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
        </div>
      </div>

      {project.architectures.length === 0 ? (
        <Empty
          icon={<Building2 className="h-6 w-6" />}
          title="No architectures yet"
          description="Define the high-level structure and components of your project."
        >
          <Button asChild>
            <Link href={`/architecture?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New architecture
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.architectures.map((architecture) => (
            <Card key={architecture.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="truncate">{architecture.name}</span>
                </CardTitle>
                {architecture.description && (
                  <CardDescription className="line-clamp-2">{architecture.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`/architecture/${architecture.id}?projectId=${projectId}`}>
                    Open architecture <ArrowRight className="h-4 w-4 ml-2" />
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

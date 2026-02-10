"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Plus, ArrowRight, Lightbulb } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import type { Project } from "@/types/project";

interface ProjectIdeasTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "ideas") => Promise<void>;
}

export function ProjectIdeasTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectIdeasTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" /> Ideas ({project.ideaIds.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/ideas?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New idea
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateExport("ideas")}
            disabled={exportLoading || project.ideaIds.length === 0}
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

      {project.ideas.length === 0 ? (
        <Empty
          icon={<Lightbulb className="h-6 w-6" />}
          title="No ideas yet"
          description="Generate new ideas or add existing ones to your project."
        >
          <Button asChild>
            <Link href={`/ideas?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New idea
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.ideas.map((idea) => (
            <Card key={idea.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="truncate">{idea.title}</span>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {idea.category}
                  </Badge>
                </CardTitle>
                {idea.description && (
                  <CardDescription className="line-clamp-2">{idea.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`/ideas/${idea.id}?projectId=${projectId}`}>
                    Open idea <ArrowRight className="h-4 w-4 ml-2" />
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

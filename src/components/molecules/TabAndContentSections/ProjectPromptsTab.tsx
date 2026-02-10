"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, ArrowRight, MessageSquare } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import type { Project } from "@/types/project";

interface ProjectPromptsTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "prompts") => Promise<void>;
}

export function ProjectPromptsTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectPromptsTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Prompts ({project.promptIds.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/prompts?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New prompt
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateExport("prompts")}
            disabled={exportLoading || project.promptIds.length === 0}
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

      {project.prompts.length === 0 ? (
        <Empty
          icon={<MessageSquare className="h-6 w-6" />}
          title="No prompts yet"
          description="Create prompts to guide AI models for code generation, documentation, and more."
        >
          <Button asChild>
            <Link href={`/prompts?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New prompt
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.prompts.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="truncate">{prompt.title || `Prompt ${prompt.id}`}</span>
                </CardTitle>
                {prompt.description && (
                  <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`/prompts/${prompt.id}?projectId=${projectId}`}>
                    Open prompt <ArrowRight className="h-4 w-4 ml-2" />
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

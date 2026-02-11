"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectPromptHeader } from "@/components/atoms/ProjectPromptHeader";
import { ProjectPromptListItem } from "@/components/atoms/ProjectPromptListItem";
import { GridContainer } from "@/components/shared/GridContainer";

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
      <ProjectPromptHeader
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={generateExport}
      />

      {project.prompts.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="No prompts yet"
          description="Create prompts to guide AI models for code generation, documentation, and more."
          action={
            <Button asChild>
              <Link href={`/prompts?projectId=${projectId}`}>
                <Plus className="h-4 w-4 mr-2" />
                New prompt
              </Link>
            </Button>
          }
        />
      ) : (
        <GridContainer>
          {project.prompts.map((prompt) => (
            <ProjectPromptListItem
              key={prompt.id}
              prompt={prompt}
              projectId={projectId}
            />
          ))}
        </GridContainer>
      )}
    </div>
  );
}

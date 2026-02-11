"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectPromptRecordListItem } from "@/components/atoms/list-items/ProjectPromptListItem";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectPromptRecordsTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
}

export function ProjectPromptRecordsTab({
  project,
  projectId,
  exportLoading,
  generateExport,
}: ProjectPromptRecordsTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <ProjectCategoryHeader
        title="Prompts"
        icon={<MessageSquare className="h-6 w-6" />}
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={generateExport}
        category="prompts"
      />

      {project.promptIds?.length === 0 ? (
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
          {project.promptIds?.map((promptId) => (
            <ProjectPromptRecordListItem
              key={promptId}
              prompt={promptId as any}
              projectId={projectId}
            />
          ))}
        </GridContainer>
      )}
    </div>
  );
}

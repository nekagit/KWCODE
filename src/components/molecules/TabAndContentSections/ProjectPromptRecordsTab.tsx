"use client";

/** Project Prompt Records Tab component. */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Project } from "@/types/project";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectPromptRecordListItem } from "@/components/atoms/list-items/ProjectPromptListItem";
import { GridContainer } from "@/components/shared/GridContainer";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ProjectPromptRecordsTab.tsx");

interface ProjectPromptRecordsTabProps {
  project: Project;
  projectId: string;
}

export function ProjectPromptRecordsTab({
  project,
  projectId,
}: ProjectPromptRecordsTabProps) {
  return (
    <div className={classes[0]}>
      <ProjectCategoryHeader
        title="Prompts"
        icon={<MessageSquare className={classes[1]} />}
        project={project}
      />

      {project.promptIds?.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className={classes[1]} />}
          title="No prompts yet"
          description="Create prompts to guide AI models for code generation, documentation, and more."
          action={
            <Button asChild>
              <Link href={`/prompts?projectId=${projectId}`}>
                <Plus className={classes[3]} />
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

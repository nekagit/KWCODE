import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/shared/Card";
import type { Project } from "@/types/project";
import type { PromptRecord } from "@/types/prompt";

interface ProjectPromptRecordListItemProps {
  prompt: PromptRecord;
  projectId: string;
}

export const ProjectPromptRecordListItem: React.FC<ProjectPromptRecordListItemProps> = ({
  prompt,
  projectId,
}) => {
  return (
    <li key={prompt.id}>
      <Card
        title={prompt.title || `PromptRecord ${prompt.id}`}
        subtitle={prompt.description}
        className="flex flex-col bg-muted/30"
        footerButtons={
          <Button size="sm" variant="outline" className="w-full" asChild>
            <Link href={`/prompts/${prompt.id}?projectId=${projectId}`}>
              Open prompt <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        }
      />
    </li>
  );
};

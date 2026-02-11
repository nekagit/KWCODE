import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/shared/Card";
import type { Project } from "@/types/project";

interface ProjectPromptListItemProps {
  prompt: Project["prompts"][number];
  projectId: string;
}

export const ProjectPromptListItem: React.FC<ProjectPromptListItemProps> = ({
  prompt,
  projectId,
}) => {
  return (
    <Card
      title={prompt.title || `Prompt ${prompt.id}`}
      subtitle={prompt.description}
      className="flex flex-col"
      footerButtons={
        <Button size="sm" variant="outline" className="w-full" asChild>
          <Link href={`/prompts/${prompt.id}?projectId=${projectId}`}>
            Open prompt <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      }
    ></Card>
  );
};

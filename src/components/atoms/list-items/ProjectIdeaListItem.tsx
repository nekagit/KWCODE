import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { Project } from "@/types/project";
import type { IdeaRecord, IdeaCategory } from "@/types/idea";

interface ProjectIdeaListItemProps {
  idea: IdeaRecord;
  projectId: string;
}

export const ProjectIdeaListItem: React.FC<ProjectIdeaListItemProps> = ({
  idea,
  projectId,
}) => {
  return (
    <li key={idea.id}>
      <Card
        title={idea.title}
        subtitle={idea.description}
        className="flex flex-col bg-muted/30"
        footerButtons={
          <ButtonGroup alignment="left">
            <Badge variant="secondary" className="shrink-0 text-xs">
              {idea.category}
            </Badge>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href={`/ideas/${idea.id}?projectId=${projectId}`}>
                Open idea <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </ButtonGroup>
        }
      ><div/></Card>
    </li>
  );
};

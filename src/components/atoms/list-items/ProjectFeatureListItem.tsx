import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/shared/Card";
import type { Project, Feature } from "@/types/project";

interface ProjectFeatureListItemProps {
  feature: Feature;
  projectId: string;
}

export const ProjectFeatureListItem: React.FC<ProjectFeatureListItemProps> = ({
  feature,
  projectId,
}) => {
  return (
    <li key={feature.id}>
      <Card
        title={feature.title}
        subtitle={`${feature.ticket_ids.length} tickets, ${feature.prompt_ids.length} prompts`}
        className="flex flex-col bg-muted/30"
        footerButtons={
          <Button size="sm" variant="outline" className="w-full" asChild>
            <Link href={`/feature/${feature.id}?projectId=${projectId}`}>
              Open feature <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        }
      ><div/></Card>
    </li>
  );
};

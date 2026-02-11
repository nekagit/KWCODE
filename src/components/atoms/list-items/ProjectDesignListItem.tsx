import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/shared/Card";
import type { Project } from "@/types/project";

interface ProjectDesignListItemProps {
  design: Project["designs"][number];
  projectId: string;
}

export const ProjectDesignListItem: React.FC<ProjectDesignListItemProps> = ({
  design,
  projectId,
}) => {
  return (
    <Card
      title={design.name}
      subtitle={design.description}
      className="flex flex-col"
      footerButtons={
        <Button size="sm" variant="outline" className="w-full" asChild>
          <Link href={`/design/${design.id}?projectId=${projectId}`}>
            Open design <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      }
    ></Card>
  );
};

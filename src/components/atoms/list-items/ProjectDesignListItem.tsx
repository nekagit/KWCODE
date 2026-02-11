import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/shared/Card";
import type { Project } from "@/types/project";
import type { DesignRecord } from "@/types/design";

interface ProjectDesignListItemProps {
  design: DesignRecord;
  projectId: string;
}

export const ProjectDesignListItem: React.FC<ProjectDesignListItemProps> = ({
  design,
  projectId,
}) => {
  return (
    <li key={design.id}>
      <Card
        title={design.name}
        subtitle={design.description}
        className="flex flex-col bg-muted/30"
        footerButtons={
          <Button size="sm" variant="outline" className="w-full" asChild>
            <Link href={`/design/${design.id}?projectId=${projectId}`}>
              Open design <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        }
      ><div/></Card>
    </li>
  );
};

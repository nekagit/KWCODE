import React from 'react';
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectArchitectureListItemProps {
  architecture: Project["architectures"][number];
  projectId: string;
}

export const ProjectArchitectureListItem: React.FC<ProjectArchitectureListItemProps> = ({
  architecture,
  projectId,
}) => {
  return (
    <Card
      title={architecture.name}
      subtitle={architecture.description}
      className="flex flex-col"
      footerButtons={
        <Button size="sm" variant="outline" className="w-full" asChild>
          <Link href={`/architecture/${architecture.id}?projectId=${projectId}`}>
            Open architecture <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      }
    ></Card>
  );
};

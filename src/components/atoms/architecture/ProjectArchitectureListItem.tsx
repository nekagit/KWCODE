import React from 'react';
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookText } from "lucide-react";
import type { Project } from "@/types/project";
import type { ArchitectureRecord } from "@/types/architecture";

interface ProjectArchitectureListItemProps {
  architecture: ArchitectureRecord;
  projectId: string;
}

export const ProjectArchitectureListItem: React.FC<ProjectArchitectureListItemProps> = ({
  architecture,
  projectId,
}) => {
  return (
    <Card
      title={architecture.name}
      subtitle={architecture.description || undefined}
      className="flex flex-col"
      footerButtons={
        <Button variant="ghost" asChild className="w-full">
          <Link href={`/architecture/${architecture.id}?projectId=${projectId}`} className="inline-flex items-center text-primary">
            View <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      }
    >
      <div className="flex flex-wrap gap-1.5 text-xs mb-2">
        <Badge variant="secondary" className="inline-flex items-center">
          <BookText className="h-3 w-3 mr-1" />
          {architecture.category}
        </Badge>
      </div>
    </Card>
  );
};

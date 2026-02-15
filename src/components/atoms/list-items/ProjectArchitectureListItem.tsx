import React from "react";
import { Card } from "@/components/shared/Card";

interface ProjectArchitectureListItemProps {
  architecture: { id: string; name: string; description: string };
  projectId: string;
}

export const ProjectArchitectureListItem: React.FC<ProjectArchitectureListItemProps> = ({
  architecture,
}) => {
  return (
    <li key={architecture.id}>
      <Card
        className="flex justify-between items-center bg-muted/30"
        title={architecture.name}
        subtitle={architecture.description}
      >
        <div />
      </Card>
    </li>
  );
};

import React from "react";
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { ChevronRight } from "lucide-react";

interface ProjectArchitectureListItemProps {
  architecture: { id: string; name: string; description: string }; // Assuming Architecture type has id, name, description
  projectId: string;
}

export const ProjectArchitectureListItem: React.FC<ProjectArchitectureListItemProps> = ({
  architecture,
  projectId,
}) => {
  return (
    <li key={architecture.id}>
      <Link href={`/architecture/${architecture.id}?projectId=${projectId}`} className="flex-grow">
        <Card
          className="hover:bg-muted/50 transition-colors flex justify-between items-center bg-muted/30"
          title={architecture.name}
          subtitle={architecture.description}
        >
          <div className="flex items-center">
            {/* The rightSection content */}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </Link>
    </li>
  );
};

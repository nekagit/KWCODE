import React from 'react';
import { Ticket as TicketIcon } from "lucide-react";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import type { Project } from "@/types/project";

interface ProjectTicketsHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
}

export const ProjectTicketsHeader: React.FC<ProjectTicketsHeaderProps> = ({
  project,
  projectId,
  exportLoading,
  generateExport,
}) => {
  return (
    <ProjectCategoryHeader
      project={project}
      projectId={projectId}
      exportLoading={exportLoading}
      generateExport={generateExport}
      categoryName="Tickets"
      categoryIcon={TicketIcon}
      categoryLength={project.ticketIds?.length || 0}
      newHref={`/tickets?projectId=${projectId}`}
      newButtonText="New ticket"
      exportCategory="tickets"
    />
  );
};

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Plus, Ticket as TicketIcon } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { Project } from "@/types/project";

interface ProjectTicketsHeaderProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "tickets") => Promise<void>;
}

export const ProjectTicketsHeader: React.FC<ProjectTicketsHeaderProps> = ({
  project,
  projectId,
  exportLoading,
  generateExport,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <TicketIcon className="h-5 w-5" /> Tickets ({project.ticketIds.length})
      </h2>
      <ButtonGroup alignment="right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/tickets?projectId=${projectId}`}>
            <Plus className="h-4 w-4 mr-2" />
            New ticket
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateExport("tickets")}
          disabled={exportLoading || project.ticketIds.length === 0}
        >
          {exportLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export all
        </Button>
      </ButtonGroup>
    </div>
  );
};

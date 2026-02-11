import React from "react";
import { KanbanColumnCard } from "@/components/molecules/Kanban/KanbanColumnCard";
import type { ParsedFeature, KanbanColumn } from "@/lib/todos-kanban";

interface ProjectTicketsKanbanColumnProps {
  columnId: string;
  column: KanbanColumn;
  kanbanFeatures: ParsedFeature[];
  featureColorByTitle: Record<string, string>;
  projectId: string;
  handleMarkDone: (ticketId: string) => Promise<void>;
  handleRedo: (ticketId: string) => Promise<void>;
  handleArchive: (ticketId: string) => Promise<void>;
}

export const ProjectTicketsKanbanColumn: React.FC<ProjectTicketsKanbanColumnProps> = ({
  columnId,
  column,
  kanbanFeatures,
  featureColorByTitle,
  projectId,
  handleMarkDone,
  handleRedo,
  handleArchive,
}) => (
  <KanbanColumnCard
    columnId={columnId}
    column={column}
    featureColorByTitle={featureColorByTitle}
    projectId={projectId}
    handleMarkDone={handleMarkDone}
    handleRedo={handleRedo}
    handleArchive={handleArchive}
  />
);

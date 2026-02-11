import React from "react";
import { KanbanColumnCard } from "@/components/molecules/Kanban/KanbanColumnCard";
import type { ParsedFeature, KanbanColumn } from "@/lib/todos-kanban";

interface ProjectTicketsKanbanColumnProps {
  columnId: string;
  column: KanbanColumn;
  kanbanFeatures: ParsedFeature[];
  projectId: string;
  handleMarkDone: (ticketId: string) => Promise<void>;
}

export const ProjectTicketsKanbanColumn: React.FC<ProjectTicketsKanbanColumnProps> = ({
  columnId,
  column,
  kanbanFeatures,
  projectId,
  handleMarkDone,
}) => (
  <KanbanColumnCard
    columnId={columnId}
    column={column}
    projectId={projectId}
    handleMarkDone={handleMarkDone}
  />
);

import React from "react";
import { Card } from "@/components/shared/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanColumnHeader } from "./KanbanColumnHeader";
import { KanbanTicketCard } from "./KanbanTicketCard";
import type { KanbanColumn, ParsedTicket } from "@/lib/todos-kanban";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Kanban/KanbanColumnCard.tsx");

interface KanbanColumnCardProps {
  columnId: string;
  column: KanbanColumn;
  featureColorByTitle: Record<string, string>;
  projectId: string;
  handleMarkDone: (ticketId: string) => Promise<void>;
  handleRedo: (ticketId: string) => Promise<void>;
  handleArchive: (ticketId: string) => Promise<void>;
}

export const KanbanColumnCard: React.FC<KanbanColumnCardProps> = ({
  columnId,
  column,
  featureColorByTitle,
  projectId,
  handleMarkDone,
  handleRedo,
  handleArchive,
}) => (
  <Card key={columnId} className={classes[0]} data-testid={`kanban-column-${columnId}`}>
    <KanbanColumnHeader columnId={columnId} column={column} />
    <ScrollArea className={classes[1]}>
      <div className={classes[2]}>
        {column.items.map((ticket: ParsedTicket) => (
          <KanbanTicketCard
            key={ticket.id}
            ticket={ticket}
            featureBorderClass={ticket.featureName ? featureColorByTitle[ticket.featureName] : undefined}
            projectId={projectId}
            onMarkDone={handleMarkDone}
            onRedo={handleRedo}
            onArchive={handleArchive}
          />
        ))}
      </div>
    </ScrollArea>
  </Card>
);

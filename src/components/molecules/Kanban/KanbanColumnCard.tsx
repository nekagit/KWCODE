import React from "react";
import { Card } from "@/components/shared/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanColumnHeader } from "./KanbanColumnHeader";
import { KanbanTicketCard } from "./KanbanTicketCard";
import type { KanbanColumn, ParsedTicket } from "@/lib/todos-kanban";

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
  <Card key={columnId} className="kanban-column-card flex min-h-[320px] w-full flex-col border-2 border-blue-500 p-5">
    <KanbanColumnHeader columnId={columnId} column={column} />
    <ScrollArea className="min-h-0 flex-1 px-1 pb-4 pt-1">
      <div className="flex flex-col items-center gap-2">
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

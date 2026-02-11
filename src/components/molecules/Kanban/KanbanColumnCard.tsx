import React from "react";
import { Card } from "@/components/shared/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanColumnHeader } from "./KanbanColumnHeader";
import { KanbanTicketCard } from "./KanbanTicketCard";
import type { KanbanColumn, ParsedTicket } from "@/lib/todos-kanban";

interface KanbanColumnCardProps {
  columnId: string;
  column: KanbanColumn;
  projectId: string;
  handleMarkDone: (ticketId: string) => Promise<void>;
}

export const KanbanColumnCard: React.FC<KanbanColumnCardProps> = ({
  columnId,
  column,
  projectId,
  handleMarkDone,
}) => (
  <Card key={columnId} className="flex flex-col">
    <KanbanColumnHeader columnId={columnId} column={column} />
    <ScrollArea className="flex-1 h-[300px] px-3 pb-3">
      <div className="space-y-2">
        {column.items.map((ticket: ParsedTicket) => (
          <KanbanTicketCard
            key={ticket.id}
            ticket={ticket}
            projectId={projectId}
            onMarkDone={handleMarkDone}
          />
        ))}
      </div>
    </ScrollArea>
  </Card>
);

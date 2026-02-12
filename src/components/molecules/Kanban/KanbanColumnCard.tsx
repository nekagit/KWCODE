import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanColumnHeader } from "./KanbanColumnHeader";
import { KanbanTicketCard } from "./KanbanTicketCard";
import type { KanbanColumn, ParsedTicket } from "@/lib/todos-kanban";
import { cn } from "@/lib/utils";

const COLUMN_BG: Record<string, string> = {
  backlog: "bg-amber-500/[0.02]",
  in_progress: "bg-blue-500/[0.02]",
  done: "bg-emerald-500/[0.02]",
  testing: "bg-violet-500/[0.02]",
};

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
  <div
    className={cn(
      "flex min-h-[300px] min-w-0 w-full flex-col rounded-xl border border-border/40 p-4 transition-colors",
      COLUMN_BG[columnId] ?? ""
    )}
    data-testid={`kanban-column-${columnId}`}
  >
    <KanbanColumnHeader columnId={columnId} column={column} />
    <ScrollArea className="flex-1 pt-3 -mx-1 px-1">
      <div className="flex flex-col gap-2 min-w-0 w-full pb-2">
        {column.items.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/50">
            No tickets
          </div>
        )}
        {column.items.map((ticket: ParsedTicket) => (
          <KanbanTicketCard
            key={ticket.id}
            ticket={ticket}
            featureBorderClass={
              ticket.featureName
                ? featureColorByTitle[ticket.featureName]
                : undefined
            }
            projectId={projectId}
            onMarkDone={handleMarkDone}
            onRedo={handleRedo}
            onArchive={handleArchive}
          />
        ))}
      </div>
    </ScrollArea>
  </div>
);

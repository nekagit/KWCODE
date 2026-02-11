import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Ticket, TicketStatus } from "@/app/page";
import { Card } from "@/components/shared/Card";
import { PriorityBadge } from "@/components/atoms/PriorityBadge";
import { DeleteButton } from "@/components/atoms/DeleteButton";

interface TicketCardProps {
  ticket: Ticket;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export function TicketCard({
  ticket,
  updateTicket,
  deleteTicket,
}: TicketCardProps) {
  return (
    <Card
      title={ticket.title}
      subtitle={ticket.description || undefined}
      footerButtons={
        <div className="flex items-center justify-between w-full">
          <PriorityBadge priority={ticket.priority} />
          <Tooltip>
            <TooltipTrigger asChild>
              <DeleteButton
                onClick={(ev) => { ev.stopPropagation(); deleteTicket(ticket.id); }}
                title="Delete ticket"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              />
            </TooltipTrigger>
            <TooltipContent>Delete ticket</TooltipContent>
          </Tooltip>
        </div>
      }
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-ticket-id", ticket.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
    >
    </Card>
  );
}

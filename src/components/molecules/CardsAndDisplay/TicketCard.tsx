import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Ticket, TicketStatus } from "@/types/ticket";
import { Card } from "@/components/shared/Card";
import { PriorityBadge } from "@/components/atoms/badges/PriorityBadge";
import { DeleteButton } from "@/components/atoms/buttons/DeleteButton";

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
                onClick={(ev: React.MouseEvent) => { ev.stopPropagation(); deleteTicket(ticket.id); }}
                title="Delete ticket"
              />
            </TooltipTrigger>
            <TooltipContent>Delete ticket</TooltipContent>
          </Tooltip>
        </div>
      }
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("application/x-ticket-id", ticket.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
    ><></></Card>
  );
}

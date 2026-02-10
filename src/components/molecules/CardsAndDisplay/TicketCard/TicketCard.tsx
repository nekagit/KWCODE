import { Trash2 } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip";
import type { Ticket, TicketStatus } from "@/app/page";

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
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-ticket-id", ticket.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
    >
      <p className="font-semibold text-base truncate">{ticket.title}</p>
      {ticket.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{ticket.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <Badge variant="outline" className="text-xs">P{ticket.priority}</Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={(ev) => { ev.stopPropagation(); deleteTicket(ticket.id); }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete ticket</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

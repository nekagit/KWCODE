import { Badge } from "@/components/shadcn/badge";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { TicketBoardLayout } from "@/components/molecules/TicketBoardLayout/TicketBoardLayout";
import { TicketCard } from "@/components/molecules/TicketCard/TicketCard";
import type { Ticket, TicketStatus } from "@/types/ticket";

interface TicketBoardProps {
  tickets: Ticket[];
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export function TicketBoard({ tickets, updateTicket, deleteTicket }: TicketBoardProps) {
  return (
    <TicketBoardLayout>
      {(["backlog", "in_progress", "done", "blocked"] as const).map((status) => (
        <div
          key={status}
          className="rounded-lg border bg-muted/20 min-h-[320px] flex flex-col"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-primary/30"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-primary/30"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-primary/30");
            const id = e.dataTransfer.getData("application/x-ticket-id");
            if (id) updateTicket(id, { status });
          }}
        >
          <div className="px-3 py-2 border-b bg-muted/40 rounded-t-lg flex items-center justify-between gap-2">
            <Badge variant="secondary" className="capitalize font-medium">
              {status === "in_progress" ? "In progress" : status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {tickets.filter((t) => t.status === status).length}
            </span>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {tickets
                .filter((t) => t.status === status)
                .map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    updateTicket={updateTicket}
                    deleteTicket={deleteTicket}
                  />
                ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </TicketBoardLayout>
  );
}

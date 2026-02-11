import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TicketBoardLayout } from "@/components/molecules/LayoutAndNavigation/TicketBoardLayout";
import { TicketCard } from "@/components/molecules/CardsAndDisplay/TicketCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getOrganismClasses } from "./organism-classes";
import type { Ticket, TicketStatus } from "@/types/ticket";

const c = getOrganismClasses("TicketBoard.tsx");

interface TicketBoardProps {
  tickets: Ticket[];
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export function TicketBoard({ tickets, updateTicket, deleteTicket }: TicketBoardProps) {
  return (
    <ErrorBoundary fallbackTitle="Kanban error">
      <div data-testid="kanban-board">
        <TicketBoardLayout>
      {(["backlog", "in_progress", "done", "blocked"] as const).map((status) => (
        <div
          key={status}
          className={c["0"]}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-primary/30"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-primary/30"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-primary/30");
            const id = e.dataTransfer.getData("application/x-ticket-id");
            if (id) updateTicket(id, { status });
          }}
        >
          <div className={c["1"]}>
            <Badge variant="secondary" className={c["2"]}>
              {status === "in_progress" ? "In progress" : status}
            </Badge>
            <span className={c["3"]}>
              {tickets.filter((t) => t.status === status).length}
            </span>
          </div>
          <ScrollArea className={c["4"]}>
            <div className={c["5"]}>
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
      </div>
    </ErrorBoundary>
  );
}

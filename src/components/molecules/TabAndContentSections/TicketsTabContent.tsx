import { TicketManagement } from "@/components/organisms/TicketManagement.tsx";
import type { Ticket } from "@/types/ticket";

interface TicketsTabContentProps {
  tickets: Ticket[];
  saveTickets: (next: Ticket[]) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export function TicketsTabContent({
  tickets,
  saveTickets,
  updateTicket,
  deleteTicket,
}: TicketsTabContentProps) {
  return (
    <div className="mt-0">
      <TicketManagement
        tickets={tickets}
        saveTickets={saveTickets}
        updateTicket={updateTicket}
        deleteTicket={deleteTicket}
      />
    </div>
  );
}

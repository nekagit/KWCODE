import { TicketManagement } from "@/components/organisms/TicketManagement";
import type { TicketRow } from "@/types/ticket";

interface TicketsTabContentProps {
  tickets: TicketRow[];
  saveTickets: (next: Ticket[]) => Promise<void>;
  updateTicket: (id: string, updates: Partial<TicketRow>) => Promise<void>;
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

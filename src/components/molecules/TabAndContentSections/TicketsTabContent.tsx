import { TicketManagement } from "@/components/organisms/TicketManagement";
import type { Ticket, TicketRow } from "@/types/ticket";

interface TicketsTabContentProps {
  tickets: TicketRow[];
  saveTickets: (next: Ticket[]) => Promise<void>;
  updateTicket: (id: string, updates: Partial<TicketRow>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export function TicketsTabContent({
  tickets,
  saveTickets,
  updateTicket,
  deleteTicket,
  setError,
}: TicketsTabContentProps) {
  return (
    <div className="mt-0">
      <TicketManagement
        tickets={tickets}
        saveTickets={saveTickets}
        updateTicket={updateTicket}
        deleteTicket={deleteTicket}
        setError={setError}
      />
    </div>
  );
}

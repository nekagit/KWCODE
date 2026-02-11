import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TicketManagementCard } from "@/components/molecules/CardsAndDisplay/TicketManagementCard";
import { AddTicketAccordion } from "@/components/molecules/FormsAndDialogs/AddTicketAccordion";
import { TicketsDisplayList } from "@/components/molecules/Displays/TicketsDisplayList";
import type { Ticket, TicketStatus } from "@/types/ticket";
import { toast } from "sonner";

interface TicketManagementProps {
  tickets: Ticket[];
  saveTickets: (next: Ticket[]) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export function TicketManagement({
  tickets,
  saveTickets,
  updateTicket,
  deleteTicket,
  setError,
}: TicketManagementProps) {
  const [ticketForm, setTicketForm] = useState<{
    title: string;
    description: string;
    status: TicketStatus;
    priority: number;
  }>({
    title: "",
    description: "",
    status: "backlog",
    priority: 0,
  });

  const addTicket = async () => {
    if (!ticketForm.title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      status: ticketForm.status,
      priority: ticketForm.priority,
      created_at: now,
      updated_at: now,
    };
    const next = [...tickets, newTicket];
    await saveTickets(next);
    setTicketForm({ title: "", description: "", status: "backlog", priority: 0 });
  };

  return (
    <TicketManagementCard tickets={tickets}>
      <AddTicketAccordion
        ticketForm={ticketForm}
        setTicketForm={setTicketForm}
        addTicket={addTicket}
      />

      <TicketsDisplayList
        tickets={tickets}
        onUpdateStatus={updateTicket}
        onDelete={deleteTicket}
      />
    </TicketManagementCard>
  );
}

import { TicketsDataTable, type TicketRow } from "@/components/tickets-data-table";
import type { Ticket, TicketStatus } from "@/app/page";

interface TicketsDisplayTableProps {
  tickets: Ticket[];
  onUpdateStatus: (id: string, status: TicketStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TicketsDisplayTable({
  tickets,
  onUpdateStatus,
  onDelete,
}: TicketsDisplayTableProps) {
  return (
    <TicketsDataTable
      tickets={tickets as TicketRow[]}
      onUpdateStatus={onUpdateStatus}
      onDelete={onDelete}
      emptyTitle="No tickets yet"
      emptyDescription="Add a ticket using the form above."
    />
  );
}

import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { Ticket as TicketIcon } from "lucide-react";
import type { Ticket } from "@/types/ticket";

interface TicketManagementCardProps {
  tickets: Ticket[];
  children: ReactNode;
}

export function TicketManagementCard({ tickets, children }: TicketManagementCardProps) {
  return (
    <Card
      title={
        <TitleWithIcon icon={TicketIcon} title="Tickets" className="text-lg" />
      }
      subtitle={
        <>
          Define work items: title, description, status. Combine them with prompts and projects in the Feature tab.
          {tickets.length > 0 && (
            <span className="block mt-1 font-semibold text-foreground">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
            </span>
          )}
        </>
      }
    >
      {children}
    </Card>
  );
}

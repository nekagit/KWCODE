import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { Ticket as TicketIcon } from "lucide-react";
import type { TicketRow } from "@/types/ticket";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/TicketManagementCard.tsx");

interface TicketManagementCardProps {
  tickets: TicketRow[];
  children: ReactNode;
}

export function TicketManagementCard({ tickets, children }: TicketManagementCardProps) {
  return (
    <Card
      title={
        <TitleWithIcon icon={TicketIcon} title="Tickets" className={classes[0]} iconClassName="text-warning/90" />
      }
      subtitle={
        <>
          Define work items: title, description, status. Combine them with prompts and projects in the Feature tab.
          {tickets.length > 0 && (
            <span className={classes[1]}>
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

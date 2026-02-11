import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TicketRow } from "@/types/ticket";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/TicketsDisplay.tsx");

interface TicketsDisplayProps {
  tickets: TicketRow[];
}

export const TicketsDisplay: React.FC<TicketsDisplayProps> = ({ tickets }) => {
  return (
    <div>
      <p className={classes[0]}>tickets ({tickets.length})</p>
      <ScrollArea className={classes[1]}>
        <pre>{JSON.stringify(tickets, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};

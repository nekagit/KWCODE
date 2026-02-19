/** Tickets Display List component. */
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { TicketRow } from "@/types/ticket";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/TicketsDisplayList.tsx");

interface TicketsDisplayListProps {
  tickets: TicketRow[];
  onUpdateStatus?: (id: string, updates: Partial<TicketRow>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const TicketsDisplayList: React.FC<TicketsDisplayListProps> = ({ tickets, onUpdateStatus, onDelete }) => {
  return (
    <ScrollArea className={classes[0]}>
      <div className={classes[1]}>
        {tickets.slice(0, 30).map((t) => (
          <div key={t.id} className={classes[2]}>
            <Badge variant="outline" className={classes[3]}>{t.status}</Badge>
            <span className={classes[4]}>{t.title}</span>
          </div>
        ))}
        {tickets.length > 30 && (
          <p className={classes[5]}>+{tickets.length - 30} more</p>
        )}
      </div>
    </ScrollArea>
  );
};

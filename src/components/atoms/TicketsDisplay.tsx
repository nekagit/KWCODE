import React from 'react';
import { ScrollArea } from "@/components/shadcn/scroll-area";
import type { Ticket } from "@/types/ticket";

interface TicketsDisplayProps {
  tickets: Ticket[];
}

export const TicketsDisplay: React.FC<TicketsDisplayProps> = ({ tickets }) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">tickets ({tickets.length})</p>
      <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
        <pre>{JSON.stringify(tickets, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};

import React from 'react';
import { ScrollArea } => from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/types/ticket";

interface TicketsDisplayListProps {
  tickets: Ticket[];
}

export const TicketsDisplayList: React.FC<TicketsDisplayListProps> = ({ tickets }) => {
  return (
    <ScrollArea className="h-[220px] rounded border p-2">
      <div className="space-y-2 text-sm">
        {tickets.slice(0, 30).map((t) => (
          <div key={t.id} className="flex items-start gap-2 rounded border p-2 bg-muted/20">
            <Badge variant="outline" className="shrink-0 text-xs">{t.status}</Badge>
            <span className="truncate font-medium">{t.title}</span>
          </div>
        ))}
        {tickets.length > 30 && (
          <p className="text-xs text-muted-foreground">+{tickets.length - 30} more</p>
        )}
      </div>
    </ScrollArea>
  );
};

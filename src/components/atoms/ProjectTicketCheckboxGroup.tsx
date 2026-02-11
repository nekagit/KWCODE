import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ticket as TicketIcon } from "lucide-react";

type TicketItem = { id: string; title: string; status?: string };

interface ProjectTicketCheckboxGroupProps {
  tickets: TicketItem[];
  selectedTicketIds: string[];
  onToggleTicket: (id: string) => void;
}

export const ProjectTicketCheckboxGroup: React.FC<ProjectTicketCheckboxGroupProps> = ({
  tickets,
  selectedTicketIds,
  onToggleTicket,
}) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <TicketIcon className="h-4 w-4" />
        Tickets ({selectedTicketIds.length} linked)
      </Label>
      <ScrollArea className="h-[180px] rounded border p-2">
        <div className="space-y-2">
          {tickets.map((t) => (
            <label key={t.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
              <Checkbox
                checked={selectedTicketIds.includes(t.id)}
                onCheckedChange={() => onToggleTicket(t.id)}
              />
              <span className="truncate">{t.title}</span>
            </label>
          ))}
          {tickets.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No tickets. Add some on the Dashboard Tickets tab.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

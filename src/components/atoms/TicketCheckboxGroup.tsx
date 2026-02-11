import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Ticket } from "@/app/page";

interface TicketCheckboxGroupProps {
  tickets: Ticket[];
  selectedTicketIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const TicketCheckboxGroup: React.FC<TicketCheckboxGroupProps> = ({
  tickets,
  selectedTicketIds,
  onSelectionChange,
}) => {
  const handleCheckedChange = (ticketId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedTicketIds, ticketId]
      : selectedTicketIds.filter((id) => id !== ticketId);
    onSelectionChange(newSelection);
  };

  return (
    <div className="grid gap-2">
      <Label>Tickets (required, at least one)</Label>
      <div className="flex flex-wrap gap-2">
        {tickets.map((t) => (
          <label
            key={t.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-sm hover:bg-muted/50"
          >
            <Checkbox
              checked={selectedTicketIds.includes(t.id)}
              onCheckedChange={(checked: boolean) => handleCheckedChange(t.id, checked)}
            />
            {t.title}
          </label>
        ))}
      </div>
    </div>
  );
};

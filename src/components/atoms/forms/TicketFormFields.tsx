/** Ticket Form Fields component. */
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TicketStatus } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TicketFormFieldsProps {
  ticketForm: { title: string; description: string; status: TicketStatus; priority: number; };
  setTicketForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; status: TicketStatus; priority: number; }>>;
  addTicket: () => Promise<void>;
}

export const TicketFormFields: React.FC<TicketFormFieldsProps> = ({
  ticketForm,
  setTicketForm,
  addTicket,
}) => {
  return (
    <div className="grid gap-2">
      <Label>Title</Label>
      <Input
        value={ticketForm.title}
        onChange={(e) => setTicketForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="e.g. Add user dashboard"
      />
      <Label>Description (optional)</Label>
      <Textarea
        className="min-h-[60px]"
        value={ticketForm.description}
        onChange={(e) => setTicketForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="What should be built..."
      />
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={ticketForm.status}
            onValueChange={(v) => setTicketForm((f) => ({ ...f, status: v as TicketStatus }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Input
            type="number"
            value={ticketForm.priority}
            onChange={(e) => setTicketForm((f) => ({ ...f, priority: Number(e.target.value) || 0 }))}
            className="w-20"
          />
        </div>
      </div>
      <Button onClick={addTicket}>
        <Plus className="h-4 w-4 mr-2" />
        Add ticket
      </Button>
    </div>
  );
};

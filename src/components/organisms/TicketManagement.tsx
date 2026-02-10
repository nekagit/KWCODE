import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shadcn/accordion";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { Textarea } from "@/components/shadcn/textarea";
import { TicketsDataTable, type TicketRow } from "@/components/tickets-data-table";
import { GlassCard } from "@/components/atoms/GlassCard";
import { Plus, Ticket as TicketIcon } from "lucide-react";
import type { Ticket, TicketStatus } from "@/app/page";
import type { Project } from "@/types/project";
import { toast } from "sonner";

interface TicketManagementProps {
  tickets: Ticket[];
  saveTickets: (next: Ticket[]) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}


export function TicketManagement({
  tickets,
  saveTickets,
  updateTicket,
  deleteTicket,
  setError,
}: TicketManagementProps) {
  const [ticketForm, setTicketForm] = useState<{
    title: string;
    description: string;
    status: TicketStatus;
    priority: number;
  }>({
    title: "",
    description: "",
    status: "backlog",
    priority: 0,
  });

  const addTicket = async () => {
    if (!ticketForm.title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      status: ticketForm.status,
      priority: ticketForm.priority,
      created_at: now,
      updated_at: now,
    };
    const next = [...tickets, newTicket];
    await saveTickets(next);
    setTicketForm({ title: "", description: "", status: "backlog", priority: 0 });
  };



  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          Tickets
        </CardTitle>
        <CardDescription className="text-base">
          Define work items: title, description, status. Combine them with prompts and projects in the Feature tab.
          {tickets.length > 0 && (
            <span className="block mt-1 font-semibold text-foreground">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full rounded-lg border bg-muted/30 glasgmorphism">
          <AccordionItem value="add-ticket" className="border-none glasgmorphism">
            <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b">
              Add ticket
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <TicketsDataTable
          tickets={tickets as TicketRow[]}
          onUpdateStatus={(id, status) => updateTicket(id, { status })}
          onDelete={deleteTicket}
          emptyTitle="No tickets yet"
          emptyDescription="Add a ticket using the form above."
        />
      </CardContent>
    </GlassCard>
  );
}

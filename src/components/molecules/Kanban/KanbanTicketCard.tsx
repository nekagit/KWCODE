import React from "react";
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Layers, ArrowRight } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { ParsedTicket } from "@/lib/todos-kanban";

interface KanbanTicketCardProps {
  ticket: ParsedTicket;
  projectId: string;
  onMarkDone: (ticketId: string) => Promise<void>;
}

export const KanbanTicketCard: React.FC<KanbanTicketCardProps> = ({
  ticket,
  projectId,
  onMarkDone,
}) => (
  <Card key={ticket.id} className="bg-muted/20">
    <div className="pb-2">
      <h4 className="text-sm font-semibold flex items-center justify-between gap-2">
        <span className="truncate">{ticket.title}</span>
        <Badge variant="secondary" className="shrink-0 text-xs">
          {ticket.priority}
        </Badge>
      </h4>
      <p className="line-clamp-2 text-xs text-muted-foreground">
        {ticket.description}
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2 pt-0">
      {ticket.featureName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Layers className="h-3 w-3" />
          <Badge variant="outline" className="text-xs">
            {ticket.featureName}
          </Badge>
        </div>
      )}
      <ButtonGroup alignment="left">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onMarkDone(ticket.id)}
          disabled={ticket.status === "Done"}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" /> Done
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/tickets/${ticket.id}?projectId=${projectId}`}>
            Open <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </ButtonGroup>
    </div>
  </Card>
);

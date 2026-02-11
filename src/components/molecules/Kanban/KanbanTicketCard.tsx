import React from "react";
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Layers, ArrowRight, Archive, RotateCcw } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { ParsedTicket } from "@/lib/todos-kanban";
import { cn } from "@/lib/utils";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Kanban/KanbanTicketCard.tsx");

interface KanbanTicketCardProps {
  ticket: ParsedTicket;
  featureBorderClass?: string;
  projectId: string;
  onMarkDone: (ticketId: string) => Promise<void>;
  onRedo: (ticketId: string) => Promise<void>;
  onArchive: (ticketId: string) => Promise<void>;
}

export const KanbanTicketCard: React.FC<KanbanTicketCardProps> = ({
  ticket,
  featureBorderClass,
  projectId,
  onMarkDone,
  onRedo,
  onArchive,
}) => (
  <Card
    key={ticket.id}
    className={cn(classes[13], featureBorderClass ?? "border-2 border-border")}
  >
    <div className={classes[0]}>
      <h4 className={classes[1]}>
        <span className={classes[2]}>{ticket.title}</span>
        <Badge variant="secondary" className={classes[3]}>
          {ticket.priority}
        </Badge>
      </h4>
      <p className={classes[4]}>
        {ticket.description}
      </p>
    </div>
    <div className={classes[5]}>
      {ticket.featureName && (
        <div className={classes[6]}>
          <Layers className={classes[7]} />
          <Badge variant="outline" className={classes[8]}>
            {ticket.featureName}
          </Badge>
        </div>
      )}
      <ButtonGroup alignment="left">
        {ticket.status === "Done" ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onArchive(ticket.id)}
              title="Archive"
            >
              <Archive className={classes[7]} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRedo(ticket.id)}
              title="Redo"
            >
              <RotateCcw className={classes[7]} />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkDone(ticket.id)}
              title="Implement"
            >
              <CheckCircle2 className={classes[7]} />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/tickets/${ticket.id}?projectId=${projectId}`} title="Open ticket">
                <ArrowRight className={classes[7]} />
              </Link>
            </Button>
          </>
        )}
      </ButtonGroup>
    </div>
  </Card>
);

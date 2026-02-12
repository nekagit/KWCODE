import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Layers,
  ArrowRight,
  Archive,
  RotateCcw,
} from "lucide-react";
import type { ParsedTicket } from "@/lib/todos-kanban";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  P0: "bg-red-500/15 text-red-400 border-red-500/30",
  P1: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  P2: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  P3: "bg-muted/50 text-muted-foreground border-border/50",
};

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
}) => {
  const isDone = ticket.status === "Done";
  const priorityStyle = PRIORITY_STYLES[ticket.priority] ?? PRIORITY_STYLES.P3;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-lg border bg-card/80 p-3.5 transition-all duration-200",
        "hover:bg-card hover:shadow-md hover:shadow-black/5",
        isDone ? "opacity-70" : "",
        featureBorderClass ?? "border-border/50"
      )}
    >
      {/* Header: title + priority */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-muted-foreground/70 tabular-nums">
            #{ticket.number}
          </span>
          <h4
            className={cn(
              "text-sm font-medium leading-snug mt-0.5 line-clamp-2 break-words",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {ticket.title}
          </h4>
        </div>
        <Badge
          className={cn(
            "shrink-0 text-[10px] font-semibold px-1.5 py-0 h-5 rounded-md border",
            priorityStyle
          )}
        >
          {ticket.priority}
        </Badge>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 normal-case">
          {ticket.description}
        </p>
      )}

      {/* Footer: feature + actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/20">
        {ticket.featureName ? (
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Layers className="size-3 shrink-0 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground truncate">
              {ticket.featureName}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isDone ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onArchive(ticket.id)}
                title="Archive"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Archive className="size-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRedo(ticket.id)}
                title="Redo"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-400"
              >
                <RotateCcw className="size-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMarkDone(ticket.id)}
                title="Mark done"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-emerald-400"
              >
                <CheckCircle2 className="size-3" />
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0 text-muted-foreground hover:text-primary">
                <Link href={`/tickets/${ticket.id}?projectId=${projectId}`} title="Open ticket">
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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
  Circle,
} from "lucide-react";
import type { ParsedTicket } from "@/lib/todos-kanban";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  P0: "text-red-500 bg-red-500",
  P1: "text-amber-500 bg-amber-500",
  P2: "text-blue-500 bg-blue-500",
  P3: "text-muted-foreground bg-gray-500",
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
  const priorityColor = PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.P3;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border bg-card/95 backdrop-blur-sm p-4 transition-all duration-300",
        "hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        isDone ? "opacity-60 grayscale-[0.5]" : "",
        featureBorderClass ?? "border-border/60"
      )}
    >
      {/* Header: ID + Priority + Title */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded-md">
              #{ticket.number}
            </span>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-muted/30 border border-border/20">
              <div className={cn("size-1.5 rounded-full shrink-0", priorityColor.split(" ")[1])} />
              <span className="text-[10px] font-medium leading-none text-muted-foreground">{ticket.priority}</span>
            </div>
          </div>

          {/* Actions (visible on hover or always for essential) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isDone ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); onArchive(ticket.id); }}
                  title="Archive"
                  className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Archive className="size-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); onRedo(ticket.id); }}
                  title="Redo"
                  className="size-6 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                >
                  <RotateCcw className="size-3" />
                </Button>
              </>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onMarkDone(ticket.id); }}
                title="Mark done"
                className="size-6 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
              >
                <CheckCircle2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        <Link href={`/tickets/${ticket.id}?projectId=${projectId}`} className="group/link block">
          <h4
            className={cn(
              "text-sm font-semibold leading-snug text-foreground/90 group-hover/link:text-primary transition-colors line-clamp-2",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {ticket.title}
          </h4>
        </Link>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
          {ticket.description}
        </p>
      )}

      {/* Footer: Feature badge */}
      {ticket.featureName && (
        <div className="mt-auto pt-2 flex items-center gap-1.5 border-t border-border/30">
          <Layers className="size-3 shrink-0 text-violet-400" />
          <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full">
            {ticket.featureName}
          </span>
        </div>
      )}
    </div>
  );
};

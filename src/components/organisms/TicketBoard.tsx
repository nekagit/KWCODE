import { Ticket as TicketIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { ShadcnCardContent, ShadcnCardDescription, ShadcnCardHeader, ShadcnCardTitle } from "@/components/shadcn/card";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip";
import { GlassCard } from "@/components/atoms/GlassCard";
import type { Ticket, TicketStatus } from "@/app/page";

interface TicketBoardProps {
  tickets: Ticket[];
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export function TicketBoard({ tickets, updateTicket, deleteTicket }: TicketBoardProps) {
  return (
    <GlassCard>
      <ShadcnCardHeader>
        <ShadcnCardTitle className="text-lg flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          Ticket board
        </ShadcnCardTitle>
        <ShadcnCardDescription className="text-base">Drag cards between columns to change status</ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["backlog", "in_progress", "done", "blocked"] as const).map((status) => (
            <div
              key={status}
              className="rounded-lg border bg-muted/20 min-h-[320px] flex flex-col"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-primary/30"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-primary/30"); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("ring-2", "ring-primary/30");
                const id = e.dataTransfer.getData("application/x-ticket-id");
                if (id) updateTicket(id, { status });
              }}
            >
              <div className="px-3 py-2 border-b bg-muted/40 rounded-t-lg flex items-center justify-between gap-2">
                <Badge variant="secondary" className="capitalize font-medium">
                  {status === "in_progress" ? "In progress" : status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {tickets.filter((t) => t.status === status).length}
                </span>
              </div>
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {tickets
                    .filter((t) => t.status === status)
                    .map((t) => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/x-ticket-id", t.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                      >
                        <p className="font-semibold text-base truncate">{t.title}</p>
                        {t.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">P{t.priority}</Badge>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={(ev) => { ev.stopPropagation(); deleteTicket(t.id); }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete ticket</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </ShadcnCardContent>
    </GlassCard>
  );
}

import React from 'react';
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ListTodo,
  Play,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
} from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { TodosKanbanData, ParsedFeature, ParsedTicket } from "@/lib/todos-kanban";

interface ProjectTicketsKanbanColumnProps {
  columnId: string;
  column: TodosKanbanData["columns"][string];
  kanbanFeatures: ParsedFeature[];
  projectId: string;
  handleMarkDone: (ticketId: string) => Promise<void>;
}

export const ProjectTicketsKanbanColumn: React.FC<ProjectTicketsKanbanColumnProps> = ({
  columnId,
  column,
  kanbanFeatures,
  projectId,
  handleMarkDone,
}) => {
  return (
    <Card key={columnId} className="flex flex-col">
      <div className="pb-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          {columnId === "backlog" && <ListTodo className="h-4 w-4" />}
          {columnId === "in_progress" && <Play className="h-4 w-4" />}
          {columnId === "done" && <CheckCircle2 className="h-4 w-4" />}
          {columnId === "blocked" && <AlertCircle className="h-4 w-4" />}
          {column.name} ({column.items.length})
        </h3>
      </div>
      <ScrollArea className="flex-1 h-[300px] px-3 pb-3">
        <div className="space-y-2">
          {column.items.map((ticket) => (
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
                {ticket.featureIds.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Layers className="h-3 w-3" />
                    {ticket.featureIds.map((featureId) => {
                      const feature = kanbanFeatures.find((f) => f.id === featureId);
                      return (
                        <Badge key={featureId} variant="outline" className="text-xs">
                          {feature?.title || featureId}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <ButtonGroup alignment="left">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleMarkDone(ticket.id)}
                    disabled={ticket.status === "done"}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                  </Button>
                  <Button size="xs" variant="outline" asChild>
                    <Link href={`/tickets/${ticket.id}?projectId=${projectId}`}>
                      Open <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </ButtonGroup>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

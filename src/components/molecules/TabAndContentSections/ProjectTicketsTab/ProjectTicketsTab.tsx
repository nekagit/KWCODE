"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Ticket as TicketIcon,
  Loader2,
  Download,
  Plus,
  ListTodo,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2,
  ClipboardCopy,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { updateProject } from "@/lib/api-projects";
import {
  parseTodosToKanban,
  markTicketsDone,
  markFeatureDoneByTicketRefs,
  validateFeaturesTicketsCorrelation,
  type TodosKanbanData,
  type ParsedFeature,
} from "@/lib/todos-kanban";
import { buildKanbanContextBlock } from "@/lib/analysis-prompt";

interface ProjectTicketsTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: "tickets") => Promise<void>;
  fetchProject: () => Promise<void>;
}

export function ProjectTicketsTab({
  project,
  projectId,
  exportLoading,
  generateExport,
  fetchProject,
}: ProjectTicketsTabProps) {
  const [kanbanData, setKanbanData] = useState<TodosKanbanData | null>(null);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanError, setKanbanError] = useState<string | null>(null);
  const [kanbanPrompt, setKanbanPrompt] = useState("");
  const [kanbanPromptLoading, setKanbanPromptLoading] = useState(false);
  const [showFeatureTicketWarning, setShowFeatureTicketWarning] = useState(false);

  const generateKanban = useCallback(async () => {
    if (!project) return;
    setKanbanLoading(true);
    setKanbanError(null);
    try {
      const data = await parseTodosToKanban(project.ticketIds, project.featureIds);
      setKanbanData(data);
      const { hasInvalidFeatures } = validateFeaturesTicketsCorrelation(data);
      setShowFeatureTicketWarning(hasInvalidFeatures);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
    } finally {
      setKanbanLoading(false);
    }
  }, [project]);

  const generateKanbanPrompt = useCallback(async () => {
    if (!project || !kanbanData) return;
    setKanbanPromptLoading(true);
    setKanbanError(null);
    try {
      const block = buildKanbanContextBlock(kanbanData);
      setKanbanPrompt(block);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
    } finally {
      setKanbanPromptLoading(false);
    }
  }, [project, kanbanData]);

  const handleMarkDone = useCallback(async (ticketId: string) => {
    if (!project) return;
    try {
      const updatedTickets = markTicketsDone(kanbanData?.tickets || [], [ticketId]);
      await updateProject(projectId, { ticketIds: updatedTickets.map(t => t.id) });
      await fetchProject();
      toast.success("Ticket marked as done.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }, [project, projectId, kanbanData, fetchProject]);

  useEffect(() => {
    if (project) {
      generateKanban();
    }
  }, [project, generateKanban]);

  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TicketIcon className="h-5 w-5" /> Tickets ({project.ticketIds.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tickets?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New ticket
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateExport("tickets")}
            disabled={exportLoading || project.ticketIds.length === 0}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export all
          </Button>
        </div>
      </div>

      {showFeatureTicketWarning && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Some features reference tickets that do not exist or are not linked to this project. Consider editing your features.
          </AlertDescription>
        </Alert>
      )}

      {kanbanLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : kanbanError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{kanbanError}</AlertDescription>
        </Alert>
      ) : !kanbanData || Object.keys(kanbanData.columns).every(key => kanbanData.columns[key].items.length === 0) ? (
        <Empty
          icon={<TicketIcon className="h-6 w-6" />}
          title="No tickets yet"
          description="Create new tickets to track tasks and bugs for your project."
        >
          <Button asChild>
            <Link href={`/tickets?projectId=${projectId}`}>
              <Plus className="h-4 w-4 mr-2" />
              New ticket
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(kanbanData.columns).map(([columnId, column]) => (
            <Card key={columnId} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {columnId === "backlog" && <ListTodo className="h-4 w-4" />}
                  {columnId === "in_progress" && <Play className="h-4 w-4" />}
                  {columnId === "done" && <CheckCircle2 className="h-4 w-4" />}
                  {columnId === "blocked" && <AlertCircle className="h-4 w-4" />}
                  {column.name} ({column.items.length})
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 h-[300px] px-3 pb-3">
                <div className="space-y-2">
                  {column.items.map((ticket) => (
                    <Card key={ticket.id} className="bg-muted/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between gap-2">
                          <span className="truncate">{ticket.title}</span>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {ticket.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                          {ticket.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center gap-2 pt-0">
                        {ticket.featureIds.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Layers className="h-3 w-3" />
                            {ticket.featureIds.map((featureId) => {
                              const feature = kanbanData.features.find((f) => f.id === featureId);
                              return (
                                <Badge key={featureId} variant="outline" className="text-xs">
                                  {feature?.title || featureId}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          ))}
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="kanban-prompt">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Generate AI prompt from Kanban
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground text-sm mb-4">
              Generate a prompt that includes the current Kanban state (tickets and features) to use with AI models.
            </p>
            <Button
              onClick={generateKanbanPrompt}
              disabled={kanbanPromptLoading || !kanbanData}
              className="mb-4"
            >
              {kanbanPromptLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generate prompt
            </Button>
            {kanbanPrompt && (
              <div className="relative rounded-md border bg-muted/30 p-4 font-mono text-sm">
                <pre className="whitespace-pre-wrap break-all pr-10">{kanbanPrompt}</pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  onClick={() => navigator.clipboard.writeText(kanbanPrompt)}
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

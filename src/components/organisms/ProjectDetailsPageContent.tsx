"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Ticket as TicketIcon,
  Layers,
  Lightbulb,
  Palette,
  Building2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Link2,
  Download,
  Tags,
  FolderOpen,
  Plus,
  FileText,
  Trash2,
  X,
  ClipboardCopy,
  FileSearch,
  Play,
  ListTodo,
  Sparkles,
  GitBranch,
  Settings,
  CheckCircle2,
  AlertCircle,
  Cloud,
  GitCommit,
  RefreshCw,
  ChevronRight,
  Archive,
  ArrowDownToLine,
  ArrowUpToLine,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project, EntityCategory, ProjectEntityCategories } from "@/types/project";
import { getProject, getProjectResolved, updateProject, getProjectExport } from "@/lib/api-projects";
import { isTauri, invoke, listen } from "@/lib/tauri";
import { designRecordToMarkdown } from "@/lib/design-to-markdown";
import { architectureRecordToMarkdown } from "@/lib/architecture-to-markdown";
import { featureToMarkdown } from "@/lib/feature-to-markdown";
import { CURSOR_BEST_PRACTICE_FILES } from "@/lib/cursor-best-practice";
import { CursorFilesTree } from "@/components/cursor-files-tree";
import {
  ANALYSIS_PROMPT,
  ANALYSIS_PROMPT_FILENAME,
  buildDesignAnalysisPrompt,
  buildArchitectureAnalysisPrompt,
  buildTicketsAnalysisPrompt,
  buildFeaturesAnalysisPrompt,
  buildKanbanContextBlock,
  combinePromptWithKanban,
} from "@/lib/analysis-prompt";
import { createDefaultDesignConfig } from "@/data/design-templates";
import {
  parseTodosToKanban,
  markTicketsDone,
  markFeatureDoneByTicketRefs,
  validateFeaturesTicketsCorrelation,
  type TodosKanbanData,
  type ParsedFeature,
} from "@/lib/todos-kanban";
import { toast } from "sonner";

export function ProjectDetailsPageContent() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectEntityCategories>("design");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportContent, setExportContent] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [kanbanData, setKanbanData] = useState<TodosKanbanData | null>(null);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanError, setKanbanError] = useState<string | null>(null);
  const [kanbanPrompt, setKanbanPrompt] = useState("");
  const [kanbanPromptLoading, setKanbanPromptLoading] = useState(false);
  const [parsedFeatures, setParsedFeatures] = useState<ParsedFeature[]>([]);
  const [showFeatureTicketWarning, setShowFeatureTicketWarning] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectResolved(projectId);
      setProject(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const generateExport = useCallback(async (category: ProjectEntityCategories) => {
    setExportLoading(true);
    setExportContent("");
    try {
      const content = await getProjectExport(projectId, category);
      setExportContent(content);
      setShowExportDialog(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExportLoading(false);
    }
  }, [projectId]);

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
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [project, projectId, kanbanData, fetchProject]);

  const handleMarkFeatureDone = useCallback(async (featureId: string) => {
    if (!project) return;
    try {
      const updatedFeatures = markFeatureDoneByTicketRefs(kanbanData?.features || [], featureId);
      await updateProject(projectId, { featureIds: updatedFeatures.map(f => f.id) });
      await fetchProject();
      toast.success("Feature marked as done.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [project, projectId, kanbanData, fetchProject]);

  useEffect(() => {
    if (activeTab === "tickets" && project) {
      generateKanban();
    }
  }, [activeTab, project, generateKanban]);

  const entityCategories: { id: ProjectEntityCategories; label: string; icon: React.ElementType }[] = useMemo(
    () => [
      { id: "design", label: "Design", icon: Palette },
      { id: "ideas", label: "Ideas", icon: Lightbulb },
      { id: "features", label: "Features", icon: Layers },
      { id: "tickets", label: "Tickets", icon: TicketIcon },
      { id: "prompts", label: "Prompts", icon: MessageSquare },
      { id: "architecture", label: "Architecture", icon: Building2 },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => setError(null)}>Clear error</Button>
      </div>
    );
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              {project.name}
              {project.repoPath && (
                <Badge variant="secondary" className="text-sm font-mono">
                  {project.repoPath.split("/").pop()}
                </Badge>
              )}
            </h1>
            {project.description && (
              <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/edit`}>
              <Settings className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirm("Are you sure you want to delete this project?")) {
                await deleteProject(projectId);
                window.location.href = "/projects";
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProjectEntityCategories)}>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <TabsList>
            {entityCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                <category.icon className="h-4 w-4 mr-2" />
                {category.label} ({project[`${category.id}Ids` as keyof Project].length})
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Design Tab */}
        <TabsContent value="design" className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5" /> Design ({project.designIds.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/design?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New design
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateExport("design")}
                disabled={exportLoading || project.designIds.length === 0}
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

          {project.designs.length === 0 ? (
            <Empty
              icon={<Palette className="h-6 w-6" />}
              title="No designs yet"
              description="Create a design to define the look and feel of your project."
            >
              <Button asChild>
                <Link href={`/design?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New design
                </Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.designs.map((design) => (
                <Card key={design.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="truncate">{design.name}</span>
                    </CardTitle>
                    {design.description && (
                      <CardDescription className="line-clamp-2">{design.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto pt-2">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/design/${design.id}?projectId=${projectId}`}>
                        Open design <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ideas Tab */}
        <TabsContent value="ideas" className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> Ideas ({project.ideaIds.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/ideas?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New idea
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateExport("ideas")}
                disabled={exportLoading || project.ideaIds.length === 0}
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

          {project.ideas.length === 0 ? (
            <Empty
              icon={<Lightbulb className="h-6 w-6" />}
              title="No ideas yet"
              description="Generate new ideas or add existing ones to your project."
            >
              <Button asChild>
                <Link href={`/ideas?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New idea
                </Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.ideas.map((idea) => (
                <Card key={idea.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="truncate">{idea.title}</span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {idea.category}
                      </Badge>
                    </CardTitle>
                    {idea.description && (
                      <CardDescription className="line-clamp-2">{idea.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto pt-2">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/ideas/${idea.id}?projectId=${projectId}`}>
                        Open idea <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5" /> Features ({project.featureIds.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/feature?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New feature
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateExport("features")}
                disabled={exportLoading || project.featureIds.length === 0}
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

          {project.features.length === 0 ? (
            <Empty
              icon={<Layers className="h-6 w-6" />}
              title="No features yet"
              description="Create features to group tickets and prompts for specific functionalities."
            >
              <Button asChild>
                <Link href={`/feature?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New feature
                </Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.features.map((feature) => (
                <Card key={feature.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="truncate">{feature.title}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {feature.ticket_ids.length} tickets, {feature.prompt_ids.length} prompts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-2">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/feature/${feature.id}?projectId=${projectId}`}>
                        Open feature <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-4 space-y-6">
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
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Prompts ({project.promptIds.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/prompts?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New prompt
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateExport("prompts")}
                disabled={exportLoading || project.promptIds.length === 0}
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

          {project.prompts.length === 0 ? (
            <Empty
              icon={<MessageSquare className="h-6 w-6" />}
              title="No prompts yet"
              description="Create prompts to guide AI models for code generation, documentation, and more."
            >
              <Button asChild>
                <Link href={`/prompts?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New prompt
                </Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.prompts.map((prompt) => (
                <Card key={prompt.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="truncate">{prompt.title || `Prompt ${prompt.id}`}</span>
                    </CardTitle>
                    {prompt.description && (
                      <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto pt-2">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/prompts/${prompt.id}?projectId=${projectId}`}>
                        Open prompt <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Architecture ({project.architectureIds.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/architecture?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New architecture
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateExport("architecture")}
                disabled={exportLoading || project.architectureIds.length === 0}
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

          {project.architectures.length === 0 ? (
            <Empty
              icon={<Building2 className="h-6 w-6" />}
              title="No architectures yet"
              description="Define the high-level structure and components of your project."
            >
              <Button asChild>
                <Link href={`/architecture?projectId=${projectId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New architecture
                </Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.architectures.map((architecture) => (
                <Card key={architecture.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="truncate">{architecture.name}</span>
                    </CardTitle>
                    {architecture.description && (
                      <CardDescription className="line-clamp-2">{architecture.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto pt-2">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/architecture/${architecture.id}?projectId=${projectId}`}>
                        Open architecture <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Export Content</DialogTitle>
            <DialogDescription>Copy the generated markdown content below.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap break-all">{exportContent}</pre>
          </ScrollArea>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(exportContent)}
            >
              <ClipboardCopy className="h-4 w-4 mr-2" />
              Copy to clipboard
            </Button>
            <Button type="button" onClick={() => setShowExportDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

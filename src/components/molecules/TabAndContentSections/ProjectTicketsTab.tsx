"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { Form } from "@/components/shared/Form";
import { GenericInputWithLabel } from "@/components/shared/GenericInputWithLabel";
import { GenericTextareaWithLabel } from "@/components/shared/GenericTextareaWithLabel";
import { FormField } from "@/components/shared/FormField";
import {
  Loader2,
  Plus,
  Ticket as TicketIcon,
  AlertCircle,
  Play,
  ChevronDown,
  Square,
  Eraser,
  Archive,
  Terminal,
  CheckCircle2,
  Circle,
  Trash,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { readProjectFile, readProjectFileOrEmpty, writeProjectFile, listProjectFiles } from "@/lib/api-projects";
import { invoke } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
import {
  buildKanbanFromMd,
  applyInProgressState,
  markTicketsDone,
  markTicketsNotDone,
  serializeTicketsToMd,
  type TodosKanbanData,
  type ParsedTicket,
} from "@/lib/todos-kanban";
import {
  buildKanbanContextBlock,
  combinePromptRecordWithKanban,
} from "@/lib/analysis-prompt";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { KanbanColumnCard } from "@/components/molecules/Kanban/KanbanColumnCard";
import { GenerateKanbanPromptSection } from "@/components/atoms/forms/GenerateKanbanPromptSection";
import { cn, humanizeAgentId } from "@/lib/utils";
import { isImplementAllRun } from "@/lib/run-helpers";
import { AddPromptDialog } from "@/components/molecules/FormsAndDialogs/AddPromptDialog";
import { TerminalSlot } from "@/components/shared/TerminalSlot";

const PRIORITIES: Array<"P0" | "P1" | "P2" | "P3"> = ["P0", "P1", "P2", "P3"];

/** Agent ids to never auto-assign to generated tickets (e.g. devops, requirements). */
const EXCLUDED_AGENT_IDS = ["devops", "requirements"];

/* isImplementAllRun is now imported from @/lib/run-helpers */

/** Grid of 3 terminal slots (last 3 Implement All runs). */
export function ImplementAllTerminalsGrid() {
  const runningRuns = useRunStore((s) => s.runningRuns);
  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const runsForSlots = [
    implementAllRuns[implementAllRuns.length - 3] ?? null,
    implementAllRuns[implementAllRuns.length - 2] ?? null,
    implementAllRuns[implementAllRuns.length - 1] ?? null,
  ];
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 min-w-0">
      {runsForSlots.map((run, i) => (
        <TerminalSlot key={i} run={run} slotIndex={i} heightClass="h-[40vh]" showDots={false} />
      ))}
    </div>
  );
}

/* formatElapsed is now imported from @/lib/run-helpers */

/* ═══════════════════════════════════════════════════════ */
/*  ImplementAllToolbar                                   */
/* ═══════════════════════════════════════════════════════ */

export function ImplementAllToolbar({
  projectPath,
  kanbanData,
}: {
  projectPath: string;
  kanbanData: TodosKanbanData | null;
}) {
  const runImplementAll = useRunStore((s) => s.runImplementAll);
  const stopAllImplementAll = useRunStore((s) => s.stopAllImplementAll);
  const clearImplementAllLogs = useRunStore((s) => s.clearImplementAllLogs);
  const archiveImplementAllLogs = useRunStore(
    (s) => s.archiveImplementAllLogs
  );
  const runningRuns = useRunStore((s) => s.runningRuns);
  const prompts = useRunStore((s) => s.prompts);
  const [loading, setLoading] = useState(false);
  const [addPromptOpen, setAddPromptOpen] = useState<"self" | "ai" | null>(
    null
  );
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(
    null
  );

  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const anyRunning = implementAllRuns.some((r) => r.status === "running");

  const handleImplementAll = async () => {
    const prompt =
      selectedPromptId != null
        ? prompts.find((p) => String(p.id) === selectedPromptId)
        : null;
    const userPrompt = prompt?.content?.trim() ?? "";
    const kanbanContext = kanbanData
      ? buildKanbanContextBlock(kanbanData)
      : "";
    const combinedPrompt = combinePromptRecordWithKanban(
      kanbanContext,
      userPrompt
    );
    const promptContent = combinedPrompt.trim() || undefined;
    setLoading(true);
    try {
      await runImplementAll(projectPath, promptContent);
      toast.success(
        promptContent
          ? "Implement All started (selected prompt + ticket info). Check the terminals below."
          : "Implement All started. For interactive agent (no prompt), use Open in system terminal."
      );
    } catch {
      toast.error("Failed to start Implement All");
    } finally {
      setLoading(false);
    }
  };

  const handleStopAll = async () => {
    try {
      await stopAllImplementAll();
      toast.success("All terminals stopped. Logs kept.");
    } catch {
      toast.error("Failed to stop");
    }
  };

  const handleOpenInSystemTerminal = async () => {
    try {
      await invoke("open_implement_all_in_system_terminal", { projectPath });
      toast.success(
        "Opened 3 Terminal.app windows with agent (interactive, like your MacBook)."
      );
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Primary actions */}
      <Button
        variant="default"
        size="sm"
        onClick={handleOpenInSystemTerminal}
        className="gap-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm"
      >
        <Terminal className="size-3.5" />
        System terminal
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={handleImplementAll}
        disabled={loading}
        className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Play className="size-3.5" />
        )}
        Implement All
      </Button>

      {/* Prompt selector */}
      <Select
        value={selectedPromptId ?? ""}
        onValueChange={(v) => setSelectedPromptId(v || null)}
      >
        <SelectTrigger
          className="w-[180px] h-8 text-xs border-border/50 bg-muted/30"
          aria-label="Select one prompt"
        >
          <SelectValue placeholder="Select prompt" />
        </SelectTrigger>
        <SelectContent>
          {prompts.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.title || `Prompt ${p.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs h-8"
          >
            <Plus className="size-3" />
            Prompt
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setAddPromptOpen("self")}>
            Self-written prompt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAddPromptOpen("ai")}>
            AI generation prompt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Destructive actions */}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStopAll}
          disabled={!anyRunning}
          className="gap-1 text-xs h-8 text-destructive hover:bg-destructive/10"
        >
          <Square className="size-3" />
          Stop
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearImplementAllLogs}
          className="gap-1 text-xs h-8 text-muted-foreground hover:text-foreground"
        >
          <Eraser className="size-3" />
          Clear
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={archiveImplementAllLogs}
          className="gap-1 text-xs h-8 text-muted-foreground hover:text-foreground"
        >
          <Archive className="size-3" />
          Archive
        </Button>
      </div>

      <AddPromptDialog open={addPromptOpen} onOpenChange={setAddPromptOpen} />
    </div>
  );
}

/* AddPromptDialog is now imported from @/components/molecules/FormsAndDialogs/AddPromptDialog */

/* ═══════════════════════════════════════════════════════ */
/*  ProjectTicketsTab (main component)                    */
/* ═══════════════════════════════════════════════════════ */

interface ProjectTicketsTabProps {
  project: Project;
  projectId: string;
  fetchProject: () => Promise<void>;
}

export function ProjectTicketsTab({
  project,
  projectId,
  fetchProject,
}: ProjectTicketsTabProps) {
  const [kanbanData, setKanbanData] = useState<TodosKanbanData | null>(null);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanError, setKanbanError] = useState<string | null>(null);
  const [kanbanPrompt, setKanbanPrompt] = useState("");
  const [kanbanPromptLoading, setKanbanPromptLoading] = useState(false);
  const [addTicketOpen, setAddTicketOpen] = useState(false);
  const [addTicketTitle, setAddTicketTitle] = useState("");
  const [addTicketDesc, setAddTicketDesc] = useState("");
  const [addTicketPriority, setAddTicketPriority] = useState<
    "P0" | "P1" | "P2" | "P3"
  >("P1");
  const [addTicketFeature, setAddTicketFeature] = useState("");
  const [saving, setSaving] = useState(false);
  /* Planner Manager: AI-generated ticket from prompt */
  // Removed plannerManagerMode, always default to ticket
  const [plannerPromptInput, setPlannerPromptInput] = useState("");
  const [plannerPromptTextarea, setPlannerPromptTextarea] = useState("");
  const [generatedTicket, setGeneratedTicket] = useState<{
    title: string;
    description?: string;
    priority: "P0" | "P1" | "P2" | "P3";
    featureName: string;
  } | null>(null);
  /** When a ticket is generated, we assign all agents from .cursor/agents; stored here for display and for newTicket.agents. */
  const [assignedAgentsForGenerated, setAssignedAgentsForGenerated] = useState<string[]>([]);
  const [generatingTicket, setGeneratingTicket] = useState(false);

  /* ── Data loading ── */

  const KANBAN_STATE_PATH = ".cursor/planner/kanban-state.json";

  const loadKanbanFromMd = useCallback(async () => {
    if (!project) return;
    const repoPath = project.repoPath?.trim();
    if (!repoPath) {
      setKanbanData(null);
      setKanbanError(null);
      return;
    }
    setKanbanLoading(true);
    setKanbanError(null);
    try {
      const [ticketsMd, stateRaw] = await Promise.all([
        readProjectFileOrEmpty(projectId, ".cursor/planner/tickets.md", repoPath),
        readProjectFileOrEmpty(projectId, KANBAN_STATE_PATH, repoPath),
      ]);
      let inProgressIds: string[] = [];
      if (stateRaw?.trim()) {
        try {
          const state = JSON.parse(stateRaw) as { inProgressIds?: string[] };
          inProgressIds = Array.isArray(state?.inProgressIds) ? state.inProgressIds : [];
        } catch {
          /* ignore invalid JSON */
        }
      }
      const data = buildKanbanFromMd(ticketsMd, inProgressIds);
      setKanbanData(data);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
    } finally {
      setKanbanLoading(false);
    }
  }, [project, projectId]);

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

  /* ── Ticket / Feature mutations ── */

  const handleMarkDone = useCallback(
    async (ticketId: string) => {
      if (!project?.repoPath || !kanbanData) return;
      try {
        const updatedTickets = markTicketsDone(kanbanData.tickets, [ticketId]);
        const ticketsMd = serializeTicketsToMd(updatedTickets, {
          projectName: project.name,
        });
        await writeProjectFile(
          projectId,
          ".cursor/planner/tickets.md",
          ticketsMd,
          project.repoPath
        );
        const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
        setKanbanData(buildKanbanFromMd(ticketsMd, inProgressIds));
        toast.success("Ticket marked as done.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  const handleRedo = useCallback(
    async (ticketId: string) => {
      if (!project?.repoPath || !kanbanData) return;
      try {
        const updatedTickets = markTicketsNotDone(kanbanData.tickets, [
          ticketId,
        ]);
        const ticketsMd = serializeTicketsToMd(updatedTickets, {
          projectName: project.name,
        });
        await writeProjectFile(
          projectId,
          ".cursor/planner/tickets.md",
          ticketsMd,
          project.repoPath
        );
        const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
        setKanbanData(buildKanbanFromMd(ticketsMd, inProgressIds));
        toast.success("Ticket moved back to todo.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  const handleArchive = useCallback(
    async (ticketId: string) => {
      if (!project?.repoPath || !kanbanData) return;
      const ticket = kanbanData.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;
      try {
        const updatedTickets = kanbanData.tickets.filter(
          (t) => t.id !== ticketId
        );
        const ticketsMd = serializeTicketsToMd(updatedTickets, {
          projectName: project.name,
        });
        await writeProjectFile(
          projectId,
          ".cursor/planner/tickets.md",
          ticketsMd,
          project.repoPath
        );
        const inProgressIds = (kanbanData.columns.in_progress?.items.map((t) => t.id) ?? []).filter((id) => id !== ticketId);
        setKanbanData(buildKanbanFromMd(ticketsMd, inProgressIds));
        await writeProjectFile(projectId, KANBAN_STATE_PATH, JSON.stringify({ inProgressIds }, null, 2), project.repoPath);
        toast.success(`Ticket #${ticket.number} archived.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  const handleMoveToInProgress = useCallback(
    async (ticketId: string) => {
      if (!project?.repoPath || !kanbanData) return;
      const inProgressColumn = kanbanData.columns.in_progress;
      const currentIds = inProgressColumn ? inProgressColumn.items.map((t) => t.id) : [];
      if (currentIds.includes(ticketId)) return;
      const newIds = [...currentIds, ticketId];
      try {
        await writeProjectFile(
          projectId,
          KANBAN_STATE_PATH,
          JSON.stringify({ inProgressIds: newIds }, null, 2),
          project.repoPath
        );
        setKanbanData(applyInProgressState(kanbanData, newIds));
        toast.success("Ticket moved to In progress.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  const handleAddTicket = useCallback(async () => {
    if (!project?.repoPath || !kanbanData || !addTicketTitle.trim()) return;
    const featureName = addTicketFeature.trim() || "Uncategorized";
    const nextNumber =
      kanbanData.tickets.length === 0
        ? 1
        : Math.max(...kanbanData.tickets.map((t) => t.number)) + 1;
    const newTicket: ParsedTicket = {
      id: `ticket-${nextNumber}`,
      number: nextNumber,
      title: addTicketTitle.trim(),
      description: addTicketDesc.trim() || undefined,
      priority: addTicketPriority,
      featureName,
      done: false,
      status: "Todo",
    };
    const updatedTickets = [...kanbanData.tickets, newTicket];

    setSaving(true);
    try {
      const ticketsMd = serializeTicketsToMd(updatedTickets, {
        projectName: project.name,
      });
      await writeProjectFile(
        projectId,
        ".cursor/planner/tickets.md",
        ticketsMd,
        project.repoPath
      );
      const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
      setKanbanData(buildKanbanFromMd(ticketsMd, inProgressIds));
      setAddTicketOpen(false);
      setAddTicketTitle("");
      setAddTicketDesc("");
      setAddTicketFeature("");
      toast.success(`Ticket #${nextNumber} added.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [
    project,
    projectId,
    kanbanData,
    addTicketTitle,
    addTicketDesc,
    addTicketPriority,
    addTicketFeature,
  ]);

  const handleRemoveAllTickets = useCallback(async () => {
    if (!project?.repoPath || !kanbanData) return;
    if (
      !confirm(
        "Are you sure you want to remove ALL tickets? This cannot be undone."
      )
    )
      return;

    setSaving(true);
    try {
      const ticketsMd = serializeTicketsToMd([], {
        projectName: project.name,
      });
      await writeProjectFile(
        projectId,
        ".cursor/planner/tickets.md",
        ticketsMd,
        project.repoPath
      );
      const inProgressIds: string[] = [];
      setKanbanData(buildKanbanFromMd(ticketsMd, inProgressIds));
      await writeProjectFile(projectId, KANBAN_STATE_PATH, JSON.stringify({ inProgressIds }, null, 2), project.repoPath);
      toast.success("All tickets removed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [project, projectId, kanbanData]);

  const generateTicketFromPrompt = useCallback(async () => {
    const prompt = [plannerPromptInput.trim(), plannerPromptTextarea.trim()].filter(Boolean).join("\n");
    if (!prompt) {
      toast.error("Enter a short description (e.g. “I want a new page with settings”).");
      return;
    }
    setGeneratingTicket(true);
    setGeneratedTicket(null);
    setAssignedAgentsForGenerated([]);
    try {
      const existingFeatures: string[] = []; // No longer tracking features
      const res = await fetch("/api/generate-ticket-from-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, existingFeatures }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate ticket");
        return;
      }
      setGeneratedTicket({
        title: data.title,
        description: data.description,
        priority: data.priority ?? "P1",
        featureName: data.featureName ?? "Uncategorized",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setGeneratingTicket(false);
    }
  }, [plannerPromptInput, plannerPromptTextarea]);

  const confirmAddGeneratedTicketToBacklog = useCallback(async () => {
    if (!project?.repoPath || !kanbanData || !generatedTicket) return;
    const featureName = generatedTicket.featureName.trim() || "Uncategorized";
    const nextNumber =
      kanbanData.tickets.length === 0
        ? 1
        : Math.max(...kanbanData.tickets.map((t) => t.number)) + 1;
    const newTicket: ParsedTicket = {
      id: `ticket-${nextNumber}`,
      number: nextNumber,
      title: generatedTicket.title,
      description: generatedTicket.description,
      priority: generatedTicket.priority,
      featureName,
      done: false,
      status: "Todo",
      ...(assignedAgentsForGenerated.length > 0 && { agents: assignedAgentsForGenerated }),
    };
    const updatedTickets = [newTicket, ...kanbanData.tickets];

    setSaving(true);
    try {
      const ticketsMd = serializeTicketsToMd(updatedTickets, { projectName: project.name });
      await writeProjectFile(projectId, ".cursor/planner/tickets.md", ticketsMd, project.repoPath);
      const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
      setKanbanData(buildKanbanFromMd(ticketsMd, inProgressIds));
      setGeneratedTicket(null);
      setAssignedAgentsForGenerated([]);
      setPlannerPromptInput("");
      setPlannerPromptTextarea("");
      toast.success(`Ticket #${nextNumber} added to backlog.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [project, projectId, kanbanData, generatedTicket, assignedAgentsForGenerated]);

  /** When a ticket is generated, assign all agents from .cursor/agents (.md files). */
  useEffect(() => {
    if (!generatedTicket) {
      setAssignedAgentsForGenerated([]);
      return;
    }
    if (!project?.repoPath) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await listProjectFiles(projectId, ".cursor/agents", project.repoPath);
        const mdFiles = list.filter((e) => !e.isDirectory && e.name.toLowerCase().endsWith(".md"));
        const excluded = new Set(EXCLUDED_AGENT_IDS.map((x) => x.toLowerCase()));
        const ids = mdFiles
          .map((e) => e.name.replace(/\.md$/i, ""))
          .filter((id) => !excluded.has(id.toLowerCase()));
        if (!cancelled) setAssignedAgentsForGenerated(ids);
      } catch {
        if (!cancelled) setAssignedAgentsForGenerated([]);
      }
    })();
    return () => { cancelled = true; };
  }, [generatedTicket, project?.repoPath, projectId]);

  useEffect(() => {
    if (project) {
      loadKanbanFromMd();
    }
  }, [project, loadKanbanFromMd]);

  /* ═══════════════ RENDER ═══════════════ */

  // Compute stats for the summary bar
  const totalTickets = kanbanData?.tickets.length ?? 0;
  const doneTickets = kanbanData?.tickets.filter((t) => t.done).length ?? 0;
  const progressPercent = totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── No repo path ── */}
      {!project.repoPath?.trim() ? (
        <EmptyState
          icon={<TicketIcon className="size-6 text-muted-foreground" />}
          title="No repo path"
          description="Set a repo path for this project to load tickets from .cursor/planner/tickets.md."
        />
      ) : kanbanLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingState />
        </div>
      ) : kanbanError ? (
        <ErrorDisplay message={kanbanError} />
      ) : !kanbanData ? null : (
        <>
          {/* ═══════ Summary & Actions ═══════ */}
          <Accordion type="single" collapsible defaultValue="planner-stats" className="w-full">
            <AccordionItem value="planner-stats" className="border-none">
              <AccordionTrigger className="hover:no-underline py-0">
                <div className="flex flex-col items-start text-left gap-1">
                  <h2 className="text-xl font-bold tracking-tight">Project Planner</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Manage tickets and progress.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <div className="flex flex-col gap-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border/40 bg-card backdrop-blur-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TicketIcon className="size-8" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Tickets
                      </span>
                      <span className="text-2xl font-bold tabular-nums">
                        {totalTickets}
                      </span>
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 text-blue-500 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Circle className="size-8" />
                      </div>
                      <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                        Open
                      </span>
                      <span className="text-2xl font-bold text-blue-500 tabular-nums">
                        {totalTickets - doneTickets}
                      </span>
                    </div>

                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 text-emerald-500 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="size-8" />
                      </div>
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                        Completed
                      </span>
                      <span className="text-2xl font-bold text-emerald-500 tabular-nums">
                        {doneTickets}
                      </span>
                    </div>
                  </div>

                  {/* Overall Progress */}
                  {totalTickets > 0 && (
                    <div className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Overall Progress
                      </span>
                      <div className="h-3 flex-1 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold tabular-nums">
                        {progressPercent}%
                      </span>
                    </div>
                  )}

                  {/* Kanban Board (inside Project Planner accordion) */}
                  <div data-testid="kanban-columns-grid">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(() => {
                        const kanbanColumnOrder = [
                          "backlog",
                          "in_progress",
                          "done",
                        ] as const;
                        return kanbanColumnOrder.map((columnId) => {
                          const column = kanbanData.columns[columnId];
                          if (!column) return null;
                          return (
                            <KanbanColumnCard
                              key={columnId}
                              columnId={columnId}
                              column={column}
                              projectId={projectId}
                              handleMarkDone={handleMarkDone}
                              handleRedo={handleRedo}
                              handleArchive={handleArchive}
                              handleMoveToInProgress={handleMoveToInProgress}
                            />
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ═══════ Planner Manager (accordion: badges, prompt input, AI generate, confirm, bulk actions) ═══════ */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="planner-manager" className="border-none">
              <AccordionTrigger className="hover:no-underline py-0">
                <div className="flex flex-col items-start text-left gap-1">
                  <h2 className="text-xl font-bold tracking-tight">Planner Manager</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Describe what you want; AI generates a ticket. Confirm to add to backlog.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <div className="w-full flex flex-col gap-4">

                  {/* Same input + textarea + magic stick for Ticket */}
                  <div className="grid gap-2">
                    <label htmlFor="planner-prompt-input" className="text-sm font-medium text-muted-foreground">
                      What do you want?
                    </label>
                    <input
                      id="planner-prompt-input"
                      type="text"
                      placeholder="e.g. A new page with settings"
                      value={plannerPromptInput}
                      onChange={(e) => setPlannerPromptInput(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      tabIndex={0}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="planner-prompt-textarea" className="text-sm font-medium text-muted-foreground">
                      Details (optional)
                    </label>
                    <textarea
                      id="planner-prompt-textarea"
                      placeholder="e.g. I want a new page with settings for theme and notifications."
                      value={plannerPromptTextarea}
                      onChange={(e) => setPlannerPromptTextarea(e.target.value)}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      tabIndex={0}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      onClick={generateTicketFromPrompt}
                      disabled={generatingTicket || !kanbanData}
                      className="gap-2"
                      tabIndex={0}
                    >
                      {generatingTicket ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Wand2 className="size-4" />
                      )}
                      Generate ticket
                    </Button>
                  </div>

                  {/* Ticket: confirm generated ticket → add to backlog at top */}
                  {generatedTicket && (
                    <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Generated ticket — confirm to add to top of backlog</p>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Title:</span> {generatedTicket.title}</p>
                        {generatedTicket.description && (
                          <p><span className="font-medium">Description:</span> {generatedTicket.description}</p>
                        )}
                        <p><span className="font-medium">Priority:</span> {generatedTicket.priority} · <span className="font-medium">Feature:</span> {generatedTicket.featureName}</p>
                        {assignedAgentsForGenerated.length > 0 ? (
                          <p><span className="font-medium">Assigned agents:</span>{" "}
                            {assignedAgentsForGenerated.map((id) => (
                              <span key={id} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-violet-500/10 text-violet-600 border border-violet-500/20 mr-1 mb-1">{humanizeAgentId(id)}</span>
                            ))}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-xs">No agents (add .md files to .cursor/agents to assign)</p>
                        )}
                      </div>
                      <ButtonGroup alignment="left">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setGeneratedTicket(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={confirmAddGeneratedTicketToBacklog}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                          Confirm & add to backlog
                        </Button>
                      </ButtonGroup>
                    </div>
                  )}

                  {/* Bulk actions */}
                  <div className="flex justify-end pt-2 border-t border-border/40">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="size-4" />
                          <span className="hidden sm:inline">Bulk Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={handleRemoveAllTickets}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="size-4 mr-2" />
                          Remove all tickets
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ═══════ Generate Kanban Prompt ═══════ */}
          <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-1">
            <GenerateKanbanPromptSection
              kanbanData={kanbanData}
              kanbanPrompt={kanbanPrompt}
              kanbanPromptLoading={kanbanPromptLoading}
              generateKanbanPrompt={generateKanbanPrompt}
            />
          </div>
        </>
      )}

      {/* ═══════ Add Ticket Dialog ═══════ */}
      <SharedDialog
        isOpen={addTicketOpen}
        title="Add ticket"
        onClose={() => setAddTicketOpen(false)}
        actions={
          <ButtonGroup alignment="right">
            <Button
              variant="outline"
              onClick={() => setAddTicketOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTicket}
              disabled={saving || !addTicketTitle.trim()}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Add
            </Button>
          </ButtonGroup>
        }
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTicket();
          }}
        >
          <GenericInputWithLabel
            id="ticket-title"
            label="Title"
            value={addTicketTitle}
            onChange={(e) => setAddTicketTitle(e.target.value)}
            placeholder="Ticket title"
          />
          <GenericInputWithLabel
            id="ticket-desc"
            label="Description (optional)"
            value={addTicketDesc}
            onChange={(e) => setAddTicketDesc(e.target.value)}
            placeholder="Short description"
          />
          <FormField htmlFor="ticket-priority" label="Priority">
            <Select
              value={addTicketPriority}
              onValueChange={(v) =>
                setAddTicketPriority(v as "P0" | "P1" | "P2" | "P3")
              }
            >
              <SelectTrigger id="ticket-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="space-y-2">
            <GenericInputWithLabel
              id="ticket-feature"
              label="Feature (optional grouping)"
              value={addTicketFeature}
              onChange={(e) => setAddTicketFeature(e.target.value)}
              placeholder="e.g. Testing & quality"
            />
          </div>
        </Form>
      </SharedDialog>
    </div>
  );
}

/* SummaryStatPill is now imported from @/components/shared/DisplayPrimitives */

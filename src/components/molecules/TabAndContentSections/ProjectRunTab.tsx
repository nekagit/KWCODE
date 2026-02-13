"use client";

import { useState, useCallback, useEffect } from "react";
import type { Project } from "@/types/project";
import { readProjectFile, readProjectFileOrEmpty, writeProjectFile } from "@/lib/api-projects";
import { isTauri, invoke } from "@/lib/tauri";
import {
  buildKanbanFromMd,
  markTicketsDone,
  markTicketsNotDone,
  serializeTicketsToMd,
  serializeFeaturesToMd,
  markFeatureDoneByTicketRefs,
  markFeatureNotDoneByTicketRefs,
  type TodosKanbanData,
  type ParsedTicket,
  type ParsedFeature,
} from "@/lib/todos-kanban";
import {
  buildKanbanContextBlock,
  combinePromptRecordWithKanban,
  buildTicketPromptBlock,
  combineTicketPromptWithUserPrompt,
} from "@/lib/analysis-prompt";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
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
import { useRunStore } from "@/store/run-store";
import { toast } from "sonner";
import {
  Terminal,
  Play,
  Square,
  Eraser,
  Archive,
  Loader2,
  ChevronDown,
  Zap,
  CheckCircle2,
  Circle,
  ExternalLink,
  Sparkles,
  Activity,
  MonitorUp,
  Layers,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isImplementAllRun, formatElapsed } from "@/lib/run-helpers";
import { AddPromptDialog } from "@/components/molecules/FormsAndDialogs/AddPromptDialog";
import { StatusPill } from "@/components/shared/DisplayPrimitives";
import { TerminalSlot } from "@/components/shared/TerminalSlot";
import { KanbanTicketCard } from "@/components/molecules/Kanban/KanbanTicketCard";

/* ═══════════════════════════════════════════════════════════════════════════
   Constants & Utilities
   ═══════════════════════════════════════════════════════════════════════════ */

const FEATURE_COLOR_PALETTE = [
  { border: "border-l-blue-500", text: "text-blue-400", bg: "bg-blue-500/10", ticketBorder: "border-l-2 border-l-blue-500" },
  { border: "border-l-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", ticketBorder: "border-l-2 border-l-emerald-500" },
  { border: "border-l-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", ticketBorder: "border-l-2 border-l-amber-500" },
  { border: "border-l-violet-500", text: "text-violet-400", bg: "bg-violet-500/10", ticketBorder: "border-l-2 border-l-violet-500" },
  { border: "border-l-rose-500", text: "text-rose-400", bg: "bg-rose-500/10", ticketBorder: "border-l-2 border-l-rose-500" },
  { border: "border-l-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/10", ticketBorder: "border-l-2 border-l-cyan-500" },
  { border: "border-l-orange-500", text: "text-orange-400", bg: "bg-orange-500/10", ticketBorder: "border-l-2 border-l-orange-500" },
  { border: "border-l-teal-500", text: "text-teal-400", bg: "bg-teal-500/10", ticketBorder: "border-l-2 border-l-teal-500" },
] as const;

function getFeaturePalette(index: number) {
  return FEATURE_COLOR_PALETTE[index % FEATURE_COLOR_PALETTE.length];
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface ProjectRunTabProps {
  project: Project;
  projectId: string;
}

export function ProjectRunTab({ project, projectId }: ProjectRunTabProps) {
  const [kanbanData, setKanbanData] = useState<TodosKanbanData | null>(null);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanError, setKanbanError] = useState<string | null>(null);

  const KANBAN_STATE_PATH = ".cursor/planner/kanban-state.json";

  const loadKanbanFromMd = useCallback(async () => {
    const repoPath = project.repoPath?.trim();
    if (!repoPath) {
      setKanbanData(null);
      setKanbanError(null);
      return;
    }
    setKanbanLoading(true);
    setKanbanError(null);
    try {
      const [ticketsMd, featuresMd, stateRaw] = await Promise.all([
        readProjectFile(projectId, ".cursor/planner/tickets.md", repoPath),
        readProjectFile(projectId, ".cursor/planner/features.md", repoPath),
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
      const data = buildKanbanFromMd(ticketsMd, featuresMd, inProgressIds);
      setKanbanData(data);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
    } finally {
      setKanbanLoading(false);
    }
  }, [project, projectId]);

  useEffect(() => {
    loadKanbanFromMd();
  }, [loadKanbanFromMd]);

  /* ═══ Handlers (Duplicated from tickets tab for interactivity) ═══ */

  const handleMarkDone = useCallback(
    async (ticketId: string) => {
      if (!project.repoPath || !kanbanData) return;
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
        const ticket = updatedTickets.find((t) => t.id === ticketId);
        let featuresMd = await readProjectFile(
          projectId,
          ".cursor/planner/features.md",
          project.repoPath
        );
        if (ticket && ticket.done) {
          const feature = kanbanData.features.find((f) =>
            f.ticketRefs.includes(ticket.number)
          );
          if (
            feature?.ticketRefs.every(
              (n) => updatedTickets.find((t) => t.number === n)?.done
            )
          ) {
            featuresMd = markFeatureDoneByTicketRefs(
              featuresMd,
              feature.ticketRefs
            );
            await writeProjectFile(
              projectId,
              ".cursor/planner/features.md",
              featuresMd,
              project.repoPath
            );
          }
        }
        const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
        setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd, inProgressIds));
        toast.success("Ticket marked as done.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  const handleRedo = useCallback(
    async (ticketId: string) => {
      if (!project.repoPath || !kanbanData) return;
      try {
        const updatedTickets = markTicketsNotDone(kanbanData.tickets, [
          ticketId,
        ]);
        const ticket = kanbanData.tickets.find((t) => t.id === ticketId);
        const ticketsMd = serializeTicketsToMd(updatedTickets, {
          projectName: project.name,
        });
        await writeProjectFile(
          projectId,
          ".cursor/planner/tickets.md",
          ticketsMd,
          project.repoPath
        );
        let featuresMd = await readProjectFile(
          projectId,
          ".cursor/planner/features.md",
          project.repoPath
        );
        if (ticket) {
          const feature = kanbanData.features.find((f) =>
            f.ticketRefs.includes(ticket.number)
          );
          if (
            feature &&
            !feature.ticketRefs.some(
              (n) => updatedTickets.find((t) => t.number === n)?.done
            )
          ) {
            featuresMd = markFeatureNotDoneByTicketRefs(
              featuresMd,
              feature.ticketRefs
            );
            await writeProjectFile(
              projectId,
              ".cursor/planner/features.md",
              featuresMd,
              project.repoPath
            );
          }
        }
        const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
        setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd, inProgressIds));
        toast.success("Ticket moved back to todo.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  const handleArchive = useCallback(
    async (ticketId: string) => {
      if (!project.repoPath || !kanbanData) return;
      const ticket = kanbanData.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;
      try {
        const updatedTickets = kanbanData.tickets.filter(
          (t) => t.id !== ticketId
        );
        const features = kanbanData.features.map((f) =>
          f.ticketRefs.includes(ticket.number)
            ? {
              ...f,
              ticketRefs: f.ticketRefs.filter((n) => n !== ticket.number),
            }
            : f
        );
        const ticketsMd = serializeTicketsToMd(updatedTickets, {
          projectName: project.name,
        });
        const featuresMd = serializeFeaturesToMd(features);
        await writeProjectFile(
          projectId,
          ".cursor/planner/tickets.md",
          ticketsMd,
          project.repoPath
        );
        await writeProjectFile(
          projectId,
          ".cursor/planner/features.md",
          featuresMd,
          project.repoPath
        );
        const inProgressIds = (kanbanData.columns.in_progress?.items.map((t) => t.id) ?? []).filter((id) => id !== ticketId);
        setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd, inProgressIds));
        await writeProjectFile(projectId, KANBAN_STATE_PATH, JSON.stringify({ inProgressIds }, null, 2), project.repoPath);
        toast.success(`Ticket #${ticket.number} archived.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  if (!project.repoPath?.trim()) {
    return (
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-500/[0.03] p-8 backdrop-blur-sm">
        <EmptyState
          icon={<Terminal className="h-8 w-8 text-muted-foreground" />}
          title="No repo path"
          description="Set a repo path for this project in Setup to run and view terminals here."
        />
      </div>
    );
  }

  if (kanbanLoading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/50 p-8 backdrop-blur-sm">
        <LoadingState />
      </div>
    );
  }

  if (kanbanError) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/50 p-8 backdrop-blur-sm">
        <ErrorDisplay message={kanbanError} />
      </div>
    );
  }

  if (!isTauri) {
    return (
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-500/[0.03] p-8 backdrop-blur-sm">
        <EmptyState
          icon={<Terminal className="h-8 w-8 text-muted-foreground" />}
          title="Run in Tauri"
          description="Terminals and Implement All are available when running the app in Tauri (desktop)."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ Status Bar ═══ */}
      <WorkerStatusBar />

      {/* ═══ Ticket Queue (In Progress) ═══ */}
      <WorkerTicketQueue
        kanbanData={kanbanData}
        projectId={projectId}
        handleMarkDone={handleMarkDone}
        handleRedo={handleRedo}
        handleArchive={handleArchive}
      />

      {/* ═══ Command Center ═══ */}
      <WorkerCommandCenter
        projectPath={project.repoPath.trim()}
        projectId={projectId}
        repoPath={project.repoPath ?? ""}
        kanbanData={kanbanData}
      />

      {/* ═══ Terminals ═══ */}
      <WorkerTerminalsSection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Status Bar — live overview of running terminals
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerStatusBar() {
  const runningRuns = useRunStore((s) => s.runningRuns);
  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const runningCount = implementAllRuns.filter((r) => r.status === "running").length;
  const doneCount = implementAllRuns.filter((r) => r.status === "done").length;
  const totalCount = implementAllRuns.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-card to-teal-500/[0.06] p-5 backdrop-blur-sm">
      {/* Decorative orb */}
      <div className="absolute -top-12 -right-12 size-32 rounded-full bg-emerald-500/[0.08] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-teal-500/[0.06] blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center size-9 rounded-xl transition-all duration-500",
            runningCount > 0
              ? "bg-emerald-500/20 shadow-lg shadow-emerald-500/10"
              : "bg-muted/40"
          )}>
            <Activity className={cn(
              "size-4.5 transition-colors duration-300",
              runningCount > 0 ? "text-emerald-400 animate-pulse" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Worker
            </h2>
            <p className="text-[11px] text-muted-foreground normal-case">
              {runningCount > 0
                ? `${runningCount} terminal${runningCount > 1 ? "s" : ""} running`
                : totalCount > 0
                  ? "All terminals idle"
                  : "No runs yet"}
            </p>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <>
              <StatusPill
                icon={<Zap className="size-3" />}
                label="Running"
                count={runningCount}
                color={runningCount > 0 ? "emerald" : "muted"}
                pulse={runningCount > 0}
              />
              <StatusPill
                icon={<CheckCircle2 className="size-3" />}
                label="Done"
                count={doneCount}
                color={doneCount > 0 ? "sky" : "muted"}
              />
              <StatusPill
                icon={<Circle className="size-3" />}
                label="Total"
                count={totalCount}
                color="muted"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* StatusPill is now imported from @/components/shared/DisplayPrimitives */

/* ═══════════════════════════════════════════════════════════════════════════
   Command Center — actions toolbar
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerCommandCenter({
  projectPath,
  projectId,
  repoPath,
  kanbanData,
}: {
  projectPath: string;
  projectId: string;
  repoPath: string;
  kanbanData: TodosKanbanData | null;
}) {
  const runImplementAll = useRunStore((s) => s.runImplementAll);
  const runImplementAllForTickets = useRunStore((s) => s.runImplementAllForTickets);
  const stopAllImplementAll = useRunStore((s) => s.stopAllImplementAll);
  const clearImplementAllLogs = useRunStore((s) => s.clearImplementAllLogs);
  const archiveImplementAllLogs = useRunStore((s) => s.archiveImplementAllLogs);
  const runningRuns = useRunStore((s) => s.runningRuns);
  const prompts = useRunStore((s) => s.prompts);
  const [loading, setLoading] = useState(false);
  const [addPromptOpen, setAddPromptOpen] = useState<"self" | "ai" | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const anyRunning = implementAllRuns.some((r) => r.status === "running");

  const handleImplementAll = async () => {
    const prompt =
      selectedPromptId != null
        ? prompts.find((p) => String(p.id) === selectedPromptId)
        : null;
    const selectedPromptContent = prompt?.content?.trim() ?? "";
    const tickets = kanbanData?.columns?.in_progress?.items ?? [];

    setLoading(true);
    try {
      // Always read .cursor/prompts/worker.md as the base prompt
      const workerMd = repoPath
        ? (await readProjectFileOrEmpty(projectId, ".cursor/prompts/worker.md", repoPath))?.trim() ?? ""
        : "";
      // Combine: worker.md base + user-selected prompt (if any)
      const userPrompt = [workerMd, selectedPromptContent].filter(Boolean).join("\n\n---\n\n");

      if (tickets.length > 0) {
        const slots: Array<{ slot: 1 | 2 | 3; promptContent: string; label: string }> = [];
        const ticketsToRun = tickets.slice(0, 3);
        for (let i = 0; i < ticketsToRun.length; i++) {
          const ticket = ticketsToRun[i];
          const slot = (i + 1) as 1 | 2 | 3;
          let agentMd: string | null = null;
          if (ticket.agents?.length && repoPath) {
            const parts: string[] = [];
            for (const agentId of ticket.agents) {
              const content = await readProjectFileOrEmpty(
                projectId,
                `.cursor/agents/${agentId}.md`,
                repoPath
              );
              if (content?.trim()) parts.push(content.trim());
            }
            if (parts.length) agentMd = parts.join("\n\n---\n\n");
          }
          const ticketBlock = buildTicketPromptBlock(ticket, agentMd);
          const promptContent = combineTicketPromptWithUserPrompt(ticketBlock, userPrompt).trim();
          slots.push({
            slot,
            promptContent: promptContent || ticketBlock.trim(),
            label: `Ticket #${ticket.number}: ${ticket.title}`,
          });
        }
        await runImplementAllForTickets(projectPath, slots);
        toast.success(
          `${slots.length} ticket run(s) started. Check the terminals below.`
        );
      } else {
        const kanbanContext = kanbanData ? buildKanbanContextBlock(kanbanData) : "";
        const combinedPrompt = combinePromptRecordWithKanban(kanbanContext, userPrompt);
        const promptContent = combinedPrompt.trim() || undefined;
        await runImplementAll(projectPath, promptContent);
        toast.success(
          promptContent
            ? "Implement All started (worker prompt + ticket info). Check the terminals below."
            : "Implement All started. For interactive agent (no prompt), use Open in system terminal."
        );
      }
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
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-center size-7 rounded-lg bg-emerald-500/10">
          <Sparkles className="size-3.5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">
            Command Center
          </h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            Launch, stop, and manage automated runs
          </p>
        </div>
      </div>

      {/* Action Groups */}
      <div className="px-5 pb-5 flex flex-col gap-3">
        {/* Primary Actions Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Launch Group */}
          <div className="flex items-center gap-1.5 rounded-xl bg-muted/20 border border-border/30 p-1.5">
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenInSystemTerminal}
              className="gap-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm shadow-teal-500/20 text-xs h-8 rounded-lg transition-all duration-200"
              title="Opens 3 Terminal.app windows with cd + agent. Interactive Cursor CLI (no prompt required)."
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">System Terminal</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleImplementAll}
              disabled={loading}
              className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm shadow-emerald-500/20 text-xs h-8 rounded-lg transition-all duration-200"
              title="Runs in app; agent needs a prompt (print mode). For interactive agent use Open in system terminal."
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              Implement All
            </Button>
          </div>

          {/* Prompt Group */}
          <div className="flex items-center gap-1.5 rounded-xl bg-muted/20 border border-border/30 p-1.5">
            <Select
              value={selectedPromptId ?? ""}
              onValueChange={(v) => setSelectedPromptId(v || null)}
            >
              <SelectTrigger
                className="w-[170px] h-8 text-xs bg-violet-500/10 border-violet-500/25 text-violet-300 hover:bg-violet-500/20 rounded-lg transition-colors duration-200"
                aria-label="Select one prompt"
              >
                <SelectValue placeholder="Select prompt…" />
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
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs h-8 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors duration-200"
                >
                  Add
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
          </div>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopAll}
            disabled={!anyRunning}
            className={cn(
              "gap-1.5 text-xs h-7 rounded-lg transition-all duration-200",
              anyRunning
                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                : "text-muted-foreground hover:bg-muted/40"
            )}
          >
            <Square className="size-3" />
            Stop all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearImplementAllLogs}
            className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
          >
            <Eraser className="size-3" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={archiveImplementAllLogs}
            className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
          >
            <Archive className="size-3" />
            Archive
          </Button>
        </div>
      </div>

      <AddPromptDialog open={addPromptOpen} onOpenChange={setAddPromptOpen} />
    </div>
  );
}

/* AddPromptDialog is now imported from @/components/molecules/FormsAndDialogs/AddPromptDialog */

/* ═══════════════════════════════════════════════════════════════════════════
   Terminals Section
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerTerminalsSection() {
  const runningRuns = useRunStore((s) => s.runningRuns);
  const implementAllRuns = runningRuns.filter(isImplementAllRun);

  const runsForSlots = [
    implementAllRuns[implementAllRuns.length - 3] ?? null,
    implementAllRuns[implementAllRuns.length - 2] ?? null,
    implementAllRuns[implementAllRuns.length - 1] ?? null,
  ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-center size-7 rounded-lg bg-teal-500/10">
          <MonitorUp className="size-3.5 text-teal-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">
            Terminal Output
          </h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            Live output from the last 3 Implement All runs
          </p>
        </div>
      </div>

      {/* Terminals Grid */}
      <div className="px-4 pb-4">
        <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-3">
          {runsForSlots.map((run, i) => (
            <TerminalSlot key={i} run={run} slotIndex={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* WorkerTerminalSlot is now the shared TerminalSlot from @/components/shared/TerminalSlot */

/* ═══════════════════════════════════════════════════════════════════════════
   Ticket Queue Component
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerTicketQueue({
  kanbanData,
  projectId,
  handleMarkDone,
  handleRedo,
  handleArchive,
}: {
  kanbanData: TodosKanbanData | null;
  projectId: string;
  handleMarkDone: (id: string) => Promise<void>;
  handleRedo: (id: string) => Promise<void>;
  handleArchive: (id: string) => Promise<void>;
}) {
  if (!kanbanData) return null;

  const tickets = kanbanData.columns.in_progress?.items ?? [];

  const featureColorByTitle: Record<string, string> = {};
  kanbanData.features.forEach((f, i) => {
    featureColorByTitle[f.title] = getFeaturePalette(i).ticketBorder;
  });

  return (
    <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-blue-500/[0.04] to-violet-500/[0.04] backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-1">
        <div className="flex items-center justify-center size-7 rounded-lg bg-blue-500/10">
          <Layers className="size-3.5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">In progress queue</h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            All tickets from the kanban In progress column
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </span>
        </div>
      </div>

      {/* Queue: horizontal scroll when tickets, empty state when none */}
      <div className="w-full overflow-x-auto pb-4 pt-2 px-5 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent min-h-[120px]">
        {tickets.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No tickets in progress. Move tickets from <strong>Backlog</strong> in the Planner tab (arrow → on a ticket).
            </p>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="w-[300px]">
                <KanbanTicketCard
                  ticket={ticket}
                  columnId="in_progress"
                  featureBorderClass={
                    ticket.featureName
                      ? featureColorByTitle[ticket.featureName]
                      : undefined
                  }
                  projectId={projectId}
                  onMarkDone={handleMarkDone}
                  onRedo={handleRedo}
                  onArchive={handleArchive}
                  onMoveToInProgress={async () => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


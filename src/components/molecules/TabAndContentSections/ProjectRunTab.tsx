"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Project } from "@/types/project";
import type { NightShiftCirclePhase } from "@/types/run";
import { readProjectFileOrEmpty, listProjectFiles } from "@/lib/api-projects";
import { invoke, isTauri } from "@/lib/tauri";
import {
  buildKanbanFromTickets,
  applyInProgressState,
  type TodosKanbanData,
  type ParsedTicket,
} from "@/lib/todos-kanban";
import { WORKER_IMPLEMENT_ALL_PROMPT_PATH, WORKER_FIX_BUG_PROMPT_PATH, WORKER_NIGHT_SHIFT_PROMPT_PATH, WORKER_NIGHT_SHIFT_PHASE_PROMPT_PATHS, AGENTS_ROOT } from "@/lib/cursor-paths";
import {
  buildKanbanContextBlock,
  combinePromptRecordWithKanban,
  buildTicketPromptBlock,
} from "@/lib/analysis-prompt";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRunStore } from "@/store/run-store";
import { toast } from "sonner";
import {
  Terminal,
  Play,
  Square,
  Eraser,
  Archive,
  Loader2,
  Zap,
  CheckCircle2,
  Circle,
  Activity,
  MonitorUp,
  Layers,
  Bug,
  ListTodo,
  Send,
  MessageCircleQuestion,
  History,
  Trash2,
  ChevronDown,
  Moon,
  Hash,
  Copy,
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  Search,
  X,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isImplementAllRun, parseTicketNumberFromRunLabel, formatElapsed } from "@/lib/run-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { downloadRunOutput } from "@/lib/download-run-output";
import { downloadRunAsJson } from "@/lib/download-run-as-json";
import { downloadRunAsMarkdown } from "@/lib/download-run-as-md";
import { downloadRunAsCsv } from "@/lib/download-run-as-csv";
import { copyAllRunHistoryToClipboard } from "@/lib/copy-all-run-history";
import { downloadAllRunHistory } from "@/lib/download-all-run-history";
import { downloadAllRunHistoryCsv } from "@/lib/download-all-run-history-csv";
import { downloadAllRunHistoryJson } from "@/lib/download-all-run-history-json";
import { downloadAllRunHistoryMarkdown } from "@/lib/download-all-run-history-md";
import { getRunHistoryPreferences, setRunHistoryPreferences, DEFAULT_RUN_HISTORY_PREFERENCES } from "@/lib/run-history-preferences";
import { StatusPill } from "@/components/shared/DisplayPrimitives";
import { TerminalSlot } from "@/components/shared/TerminalSlot";
import { KanbanTicketCard } from "@/components/molecules/Kanban/KanbanTicketCard";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Load concatenated content of all .md files in .cursor/2. agents for appending to terminal-agent prompts. */
async function loadAllAgentsContent(projectId: string, repoPath: string): Promise<string> {
  if (!repoPath?.trim()) return "";
  try {
    const entries = await listProjectFiles(projectId, AGENTS_ROOT, repoPath);
    const mdFiles = entries.filter((e) => !e.isDirectory && e.name.endsWith(".md"));
    const parts: string[] = [];
    for (const f of mdFiles) {
      const content = await readProjectFileOrEmpty(projectId, `${AGENTS_ROOT}/${f.name}`, repoPath);
      if (content?.trim()) parts.push(content.trim());
    }
    if (parts.length === 0) return "";
    return "\n\n---\n\n## Agent instructions (from .cursor/2. agents)\n\n" + parts.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

/** Fallback when project has no .cursor/8. worker/fix-bug.prompt.md */
const DEBUG_ASSISTANT_PROMPT_FALLBACK = `You are a debugging assistant in the current workspace. The user has pasted error/log output below. Identify the root cause, apply the fix in this workspace (edit files, run commands), and state what you fixed. Work only in this repo; be specific. If logs refer to another path, say so.

ERROR/LOG INFORMATION:
`;

/* ═══════════════════════════════════════════════════════════════════════════
   General queue — In Progress tickets from DB; run up to 3 at a time
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerGeneralQueueSection({
  projectId,
  repoPath,
  projectPath,
  kanbanData,
  onRunInProgress,
}: {
  projectId: string;
  repoPath: string;
  projectPath: string;
  kanbanData: TodosKanbanData | null;
  onRunInProgress: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const inProgressTickets = kanbanData?.columns?.in_progress?.items ?? [];
  const count = inProgressTickets.length;
  const canRun = count > 0 && projectPath.length > 0;

  const handleRun = async () => {
    setLoading(true);
    try {
      await onRunInProgress();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-lg bg-rose-500/10">
            <ListTodo className="size-3.5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground tracking-tight">Queue</h3>
            <p className="text-[10px] text-muted-foreground normal-case">
              In Progress tickets from the database — run up to 3 at a time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/50">
            {count} {count === 1 ? "ticket" : "tickets"}
          </span>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            disabled={!canRun || loading}
            onClick={handleRun}
            title="Run first 3 In Progress tickets in terminals"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            Run
          </Button>
        </div>
      </div>
      {count > 0 && (
        <div className="px-5 pb-4 pt-0">
          <ul className="space-y-1.5">
            {inProgressTickets.map((ticket) => (
              <li key={ticket.id} className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground/90">#{ticket.number}</span>
                <span className="text-muted-foreground truncate">{ticket.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {count === 0 && (
        <div className="px-5 pb-4 pt-0">
          <p className="text-xs text-muted-foreground">
            No tickets in progress. Move tickets to In Progress in the Planner tab, then run them here.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Night shift — 3 agents run same prompt in a loop until stopped
   ═══════════════════════════════════════════════════════════════════════════ */

const NIGHT_SHIFT_BADGES = [
  { id: "refactor", label: "Refactor" },
  { id: "test", label: "Test" },
  { id: "debugging", label: "Debugging" },
  { id: "implement", label: "Implement" },
  { id: "create", label: "Create" },
] as const;

/** Fallback one-line prompt when phase file is missing or empty. */
const NIGHT_SHIFT_PHASE_FALLBACK: Record<NightShiftCirclePhase, string> = {
  refactor: "Focus on refactoring: improve structure, naming, and patterns without changing behaviour. Prefer small, safe steps.\n\n",
  test: "Focus on testing: add or extend tests (unit/integration) for the chosen feature. Ensure coverage and clear assertions.\n\n",
  debugging: "Focus on debugging: reproduce, isolate, and fix the issue. Add minimal logging if needed; verify the fix.\n\n",
  implement: "Focus on implementation: build the feature end-to-end. Prefer new files; wire into existing code only where necessary. This phase is for extending existing features and code.\n\n",
  create: "Focus on creating: add something new (component, route, utility, or module). Prefer new files and clear boundaries. This phase is for adding new features and new code.\n\n",
};

/** Load phase prompt from .cursor/8. worker/{phase}.md; fallback to default if missing or empty. */
async function loadPhasePrompt(
  projectId: string,
  projectPath: string,
  phase: NightShiftCirclePhase
): Promise<string> {
  const path = WORKER_NIGHT_SHIFT_PHASE_PROMPT_PATHS[phase];
  const content = (await readProjectFileOrEmpty(projectId, path, projectPath))?.trim() ?? "";
  return content ? content + "\n\n" : NIGHT_SHIFT_PHASE_FALLBACK[phase];
}

/** Circle phase order: refactor → test → debugging → implement → create; null after create = end. */
const CIRCLE_PHASE_ORDER: NightShiftCirclePhase[] = ["refactor", "test", "debugging", "implement", "create"];
function nextCirclePhase(phase: NightShiftCirclePhase): NightShiftCirclePhase | null {
  const i = CIRCLE_PHASE_ORDER.indexOf(phase);
  if (i < 0 || i >= CIRCLE_PHASE_ORDER.length - 1) return null;
  return CIRCLE_PHASE_ORDER[i + 1] ?? null;
}

/** Build badge block from selected badges (loads prompts from .cursor/8. worker/{id}.md) and optional extra instructions. */
async function buildBadgeAndInstructionsBlock(
  projectId: string,
  projectPath: string,
  badges: Record<string, boolean>,
  extraInstructions: string
): Promise<string> {
  let block = "";
  for (const b of NIGHT_SHIFT_BADGES) {
    if (badges[b.id]) block += await loadPhasePrompt(projectId, projectPath, b.id as NightShiftCirclePhase);
  }
  if (extraInstructions.trim()) {
    block += "\n\n## Additional instructions\n\n" + extraInstructions.trim() + "\n\n";
  }
  return block;
}

function WorkerNightShiftSection({
  projectId,
  projectPath,
}: {
  projectId: string;
  projectPath: string;
}) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const nightShiftActive = useRunStore((s) => s.nightShiftActive);
  const setNightShiftActive = useRunStore((s) => s.setNightShiftActive);
  const setNightShiftReplenishCallback = useRunStore((s) => s.setNightShiftReplenishCallback);
  const nightShiftCircleMode = useRunStore((s) => s.nightShiftCircleMode);
  const nightShiftCirclePhase = useRunStore((s) => s.nightShiftCirclePhase);
  const setNightShiftCircleState = useRunStore((s) => s.setNightShiftCircleState);
  const incrementNightShiftCircleCompleted = useRunStore((s) => s.incrementNightShiftCircleCompleted);
  const getState = useRunStore.getState;
  const [starting, setStarting] = useState(false);
  const [badges, setBadges] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NIGHT_SHIFT_BADGES.map((b) => [b.id, false]))
  );
  const [extraInstructions, setExtraInstructions] = useState("");

  const toggleBadge = useCallback((id: string) => {
    setBadges((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleStart = useCallback(async () => {
    if (!projectPath?.trim()) return;
    setStarting(true);
    try {
      const basePrompt =
        (await readProjectFileOrEmpty(projectId, WORKER_NIGHT_SHIFT_PROMPT_PATH, projectPath))?.trim() ?? "";
      if (!basePrompt) {
        toast.error("Night shift prompt is empty. Add content to .cursor/8. worker/night-shift.prompt.md");
        return;
      }
      const badgeBlock = await buildBadgeAndInstructionsBlock(projectId, projectPath, badges, extraInstructions);
      const agentsBlock = await loadAllAgentsContent(projectId, projectPath);
      const promptContent = (basePrompt + badgeBlock + agentsBlock).trim();
      setNightShiftActive(true);
      setNightShiftReplenishCallback(async (slot: 1 | 2 | 3) => {
        const base =
          (await readProjectFileOrEmpty(projectId, WORKER_NIGHT_SHIFT_PROMPT_PATH, projectPath))?.trim() ?? "";
        if (base) {
          const agents = await loadAllAgentsContent(projectId, projectPath);
          const full = (base + badgeBlock + agents).trim();
          runTempTicket(projectPath, full, `Night shift (Terminal ${slot})`, {
            isNightShift: true,
          });
        }
      });
      for (const slot of [1, 2, 3] as const) {
        runTempTicket(projectPath, promptContent, `Night shift (Terminal ${slot})`, { isNightShift: true });
      }
      toast.success("Night shift started. 3 agents will run until you stop.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start night shift");
    } finally {
      setStarting(false);
    }
  }, [projectId, projectPath, badges, extraInstructions, runTempTicket, setNightShiftActive, setNightShiftReplenishCallback]);

  const handleCircleStart = useCallback(async () => {
    if (!projectPath?.trim()) return;
    setStarting(true);
    try {
      const basePrompt =
        (await readProjectFileOrEmpty(projectId, WORKER_NIGHT_SHIFT_PROMPT_PATH, projectPath))?.trim() ?? "";
      if (!basePrompt) {
        toast.error("Night shift prompt is empty. Add content to .cursor/8. worker/night-shift.prompt.md");
        return;
      }
      setNightShiftCircleState(true, "refactor", 0);
      setNightShiftActive(true);
      const refactorBadgeBlock = await buildBadgeAndInstructionsBlock(projectId, projectPath, { refactor: true }, extraInstructions);
      const agentsBlock = await loadAllAgentsContent(projectId, projectPath);
      const promptContent = (basePrompt + refactorBadgeBlock + agentsBlock).trim();
      setNightShiftReplenishCallback(async (slot: 1 | 2 | 3, exitingRun?: { meta?: { isNightShiftCircle?: boolean; circlePhase?: NightShiftCirclePhase } } | null) => {
        const state = getState();
        if (exitingRun?.meta?.isNightShiftCircle && exitingRun?.meta?.circlePhase === state.nightShiftCirclePhase) {
          incrementNightShiftCircleCompleted();
        }
        const s = getState();
        const phase = s.nightShiftCirclePhase;
        const completed = s.nightShiftCircleCompletedInPhase;
        if (phase == null) return;
        const buildPromptForPhase = async (p: NightShiftCirclePhase) => {
          const base =
            (await readProjectFileOrEmpty(projectId, WORKER_NIGHT_SHIFT_PROMPT_PATH, projectPath))?.trim() ?? "";
          const phasePrompt = await loadPhasePrompt(projectId, projectPath, p);
          const instructionsPart = extraInstructions.trim() ? "\n\n## Additional instructions\n\n" + extraInstructions.trim() + "\n\n" : "";
          const agents = await loadAllAgentsContent(projectId, projectPath);
          return (base + phasePrompt + instructionsPart + agents).trim();
        };
        if (completed >= 3) {
          const next = nextCirclePhase(phase);
          if (next === null) {
            setNightShiftCircleState(false, null, 0);
            setNightShiftActive(false);
            setNightShiftReplenishCallback(null);
            toast.success("Circle finished: all phases done.");
            return;
          }
          setNightShiftCircleState(true, next, 0);
          const nextPrompt = await buildPromptForPhase(next);
          for (const i of [1, 2, 3]) {
            runTempTicket(projectPath, nextPrompt, `Night shift (Terminal ${i})`, {
              isNightShift: true,
              isNightShiftCircle: true,
              circlePhase: next,
            });
          }
          toast.success(`Circle: ${next} (3 agents).`);
        } else {
          const currentPrompt = await buildPromptForPhase(phase);
          runTempTicket(projectPath, currentPrompt, `Night shift (Terminal ${slot})`, {
            isNightShift: true,
            isNightShiftCircle: true,
            circlePhase: phase,
          });
        }
      });
      for (const slot of [1, 2, 3] as const) {
        runTempTicket(projectPath, promptContent, `Night shift (Terminal ${slot})`, {
          isNightShift: true,
          isNightShiftCircle: true,
          circlePhase: "refactor",
        });
      }
      toast.success("Circle started: Refactor (3 agents).");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start Circle");
      setNightShiftCircleState(false, null, 0);
    } finally {
      setStarting(false);
    }
  }, [projectId, projectPath, extraInstructions, runTempTicket, setNightShiftActive, setNightShiftReplenishCallback, setNightShiftCircleState, incrementNightShiftCircleCompleted, getState]);

  const handleStop = useCallback(() => {
    setNightShiftActive(false);
    setNightShiftReplenishCallback(null);
    setNightShiftCircleState(false, null, 0);
    toast.success("Night shift stopped. Current runs will finish; no new runs will start.");
  }, [setNightShiftActive, setNightShiftReplenishCallback, setNightShiftCircleState]);

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-lg bg-indigo-500/10">
            <Moon className="size-3.5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground tracking-tight">Night shift</h3>
            <p className="text-[10px] text-muted-foreground normal-case">
              Prompt from .cursor/8. worker/night-shift.prompt.md runs on 3 agents; when one finishes, the same prompt runs again until you stop. Edit that file to change the prompt.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nightShiftActive ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
              onClick={handleStop}
              title="Stop night shift (no new runs)"
            >
              <Square className="size-3.5" />
              Stop
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                disabled={!projectPath?.trim() || starting}
                onClick={handleStart}
                title="Start 3 agents with same prompt in a loop"
              >
                {starting ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-indigo-500/50 text-indigo-600 hover:bg-indigo-500/10"
                disabled={!projectPath?.trim() || starting}
                onClick={handleCircleStart}
                title="Run Refactor → Test → Debugging → Implement → Create (3 agents per phase)"
              >
                <RotateCw className="size-3.5" />
                Circle
              </Button>
            </>
          )}
        </div>
      </div>
      {(!nightShiftActive || nightShiftCircleMode) && (
        <>
          <div className="px-5 pb-2">
            <span className="text-[10px] text-muted-foreground">
              {nightShiftCircleMode ? "Circle phase:" : "Mode (click to toggle):"}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {NIGHT_SHIFT_BADGES.map((b) => {
                const selected = nightShiftCircleMode ? b.id === nightShiftCirclePhase : !!badges[b.id];
                return (
                  <Badge
                    key={b.id}
                    variant={selected ? "default" : "outline"}
                    className={cn(
                      "text-xs font-medium transition-colors",
                      nightShiftCircleMode ? "cursor-default" : "cursor-pointer hover:bg-muted/60",
                      selected
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                        : nightShiftCircleMode ? "" : "hover:bg-muted/60"
                    )}
                    onClick={nightShiftCircleMode ? undefined : () => toggleBadge(b.id)}
                    role={nightShiftCircleMode ? undefined : "button"}
                    tabIndex={nightShiftCircleMode ? undefined : 0}
                    onKeyDown={
                      nightShiftCircleMode
                        ? undefined
                        : (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleBadge(b.id);
                            }
                          }
                    }
                  >
                    {b.label}
                  </Badge>
                );
              })}
            </div>
          </div>
          {!nightShiftActive && (
            <div className="px-5 pb-4">
              <label className="text-[10px] text-muted-foreground block mb-1">Extra instructions</label>
              <Textarea
                placeholder="Optional: add instructions that are appended to the prompt for this run."
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                className="min-h-[60px] text-xs resize-y"
                rows={2}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
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

  const runningRuns = useRunStore((s) => s.runningRuns);
  const ticketNumbersShownInTerminals = useMemo(() => {
    const implementAll = runningRuns.filter(isImplementAllRun);
    const last3 = implementAll.slice(-3);
    const set = new Set<number>();
    for (const run of last3) {
      const n = parseTicketNumberFromRunLabel(run.label);
      if (n != null) set.add(n);
    }
    return set;
  }, [runningRuns]);

  const loadTicketsAndKanban = useCallback(async () => {
    if (!projectId) return;
    setKanbanLoading(true);
    setKanbanError(null);
    try {
      // #region agent log
      if (isTauri) {
        invoke("frontend_debug_log", { location: "ProjectRunTab.tsx:loadTicketsAndKanban", message: "Worker: loadTicketsAndKanban start", data: { projectId, useInvoke: true } }).catch(() => {});
      }
      // #endregion
      type TicketRow = { id: string; number: number; title: string; description?: string; priority: string; feature_name?: string; featureName?: string; done: boolean; status: string; agents?: string[]; milestone_id?: number; idea_id?: number };
      let apiTickets: TicketRow[];
      let inProgressIds: string[];
      if (isTauri) {
        const [ticketsList, kanbanState] = await Promise.all([
          invoke<TicketRow[]>("get_project_tickets", { projectIdArg: { projectId } }),
          invoke<{ inProgressIds: string[] }>("get_project_kanban_state", { projectIdArg: { projectId } }),
        ]);
        apiTickets = ticketsList ?? [];
        inProgressIds = kanbanState?.inProgressIds ?? [];
      } else {
        const [ticketsRes, stateRes] = await Promise.all([
          fetch(`/api/data/projects/${projectId}/tickets`),
          fetch(`/api/data/projects/${projectId}/kanban-state`),
        ]);
        if (!ticketsRes.ok || !stateRes.ok) throw new Error("Failed to load tickets");
        apiTickets = (await ticketsRes.json()) as TicketRow[];
        const state = (await stateRes.json()) as { inProgressIds: string[] };
        inProgressIds = state.inProgressIds ?? [];
      }
      const tickets: ParsedTicket[] = apiTickets.map((t) => ({
        id: t.id,
        number: t.number,
        title: t.title,
        description: t.description,
        priority: (t.priority as ParsedTicket["priority"]) || "P1",
        featureName: t.featureName ?? t.feature_name ?? "General",
        done: t.done,
        status: (t.status as ParsedTicket["status"]) || "Todo",
        agents: t.agents,
        milestoneId: t.milestone_id,
        ideaId: t.idea_id,
      }));
      const data = buildKanbanFromTickets(tickets, inProgressIds);
      setKanbanData(data);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setKanbanError(errMsg);
      // #region agent log
      if (isTauri) {
        invoke("frontend_debug_log", { location: "ProjectRunTab.tsx:loadTicketsAndKanban:catch", message: "Worker: loadTicketsAndKanban failed", data: { error: errMsg, projectId } }).catch(() => {});
      }
      fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "ProjectRunTab.tsx:loadTicketsAndKanban:catch", message: "Worker loadTicketsAndKanban failed", data: { error: errMsg }, timestamp: Date.now(), hypothesisId: "WorkerTab" }) }).catch(() => {});
      // #endregion
    } finally {
      setKanbanLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTicketsAndKanban();
  }, [loadTicketsAndKanban]);

  /* ═══ Handlers (Duplicated from tickets tab for interactivity) ═══ */

  const handleMarkDone = useCallback(
    async (ticketId: string) => {
      if (!kanbanData) return;
      try {
        const res = await fetch(`/api/data/projects/${projectId}/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ done: true, status: "Done" }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to update");
        const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
        const updatedTickets = kanbanData.tickets.map((t) =>
          t.id === ticketId ? { ...t, done: true, status: "Done" as const } : t
        );
        setKanbanData(applyInProgressState({ ...kanbanData, tickets: updatedTickets }, inProgressIds));
        toast.success("Ticket marked as done.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [projectId, kanbanData]
  );

  const handleRedo = useCallback(
    async (ticketId: string) => {
      if (!kanbanData) return;
      try {
        const res = await fetch(`/api/data/projects/${projectId}/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ done: false, status: "Todo" }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to update");
        const inProgressIds = kanbanData.columns.in_progress?.items.map((t) => t.id) ?? [];
        const updatedTickets = kanbanData.tickets.map((t) =>
          t.id === ticketId ? { ...t, done: false, status: "Todo" as const } : t
        );
        setKanbanData(applyInProgressState({ ...kanbanData, tickets: updatedTickets }, inProgressIds));
        toast.success("Ticket moved back to todo.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [projectId, kanbanData]
  );

  const handleArchive = useCallback(
    async (ticketId: string) => {
      if (!kanbanData) return;
      const ticket = kanbanData.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;
      try {
        const res = await fetch(`/api/data/projects/${projectId}/tickets/${ticketId}`, { method: "DELETE" });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to delete");
        const inProgressIds = (kanbanData.columns.in_progress?.items.map((t) => t.id) ?? []).filter((id) => id !== ticketId);
        await fetch(`/api/data/projects/${projectId}/kanban-state`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inProgressIds }),
        });
        const updatedTickets = kanbanData.tickets.filter((t) => t.id !== ticketId);
        setKanbanData(applyInProgressState({ ...kanbanData, tickets: updatedTickets }, inProgressIds));
        toast.success(`Ticket #${ticket.number} archived.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [projectId, kanbanData]
  );

  const runImplementAllForTickets = useRunStore((s) => s.runImplementAllForTickets);
  const handleRunInProgressTickets = useCallback(async () => {
    const repoPath = project.repoPath?.trim();
    const projectPath = repoPath ?? "";
    if (!projectPath) return;
    const tickets = kanbanData?.columns?.in_progress?.items ?? [];
    if (tickets.length === 0) {
      toast.error("No tickets in progress. Move tickets to In Progress in the Planner tab.");
      return;
    }
    try {
      const implementAllMd = repoPath
        ? (await readProjectFileOrEmpty(projectId, WORKER_IMPLEMENT_ALL_PROMPT_PATH, repoPath))?.trim() ?? ""
        : "";
      let gitRefAtStart = "";
      if (isTauri) {
        try {
          gitRefAtStart = (await invoke<string>("get_git_head", { projectPath })) ?? "";
        } catch {
          /* ignore */
        }
      }
      const slots: Array<{
        slot: 1 | 2 | 3;
        promptContent: string;
        label: string;
        meta?: {
          projectId: string;
          repoPath: string;
          ticketId: string;
          ticketNumber: number;
          ticketTitle: string;
          milestoneId?: number;
          ideaId?: number;
          gitRefAtStart?: string;
        };
      }> = [];
      const allAgentsBlock = await loadAllAgentsContent(projectId, repoPath ?? "");
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
              `${AGENTS_ROOT}/${agentId}.md`,
              repoPath
            );
            if (content?.trim()) parts.push(content.trim());
          }
          if (parts.length) agentMd = parts.join("\n\n---\n\n");
        }
        const ticketBlock = buildTicketPromptBlock(ticket, agentMd);
        const baseContent = (implementAllMd
          ? `${implementAllMd}\n\n---\n\n${ticketBlock}`
          : ticketBlock
        ).trim();
        const promptContent = (baseContent + allAgentsBlock).trim() || ticketBlock.trim();
        slots.push({
          slot,
          promptContent,
          label: `Ticket #${ticket.number}: ${ticket.title}`,
          meta: {
            projectId,
            repoPath: repoPath ?? "",
            ticketId: ticket.id,
            ticketNumber: ticket.number,
            ticketTitle: ticket.title,
            milestoneId: ticket.milestoneId,
            ideaId: ticket.ideaId,
            gitRefAtStart: gitRefAtStart || undefined,
          },
        });
      }
      await runImplementAllForTickets(projectPath, slots);
      toast.success(`${slots.length} ticket run(s) started. Check the terminals below.`);
    } catch {
      toast.error("Failed to start run.");
    }
  }, [projectId, project.repoPath, kanbanData, runImplementAllForTickets]);

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

      {/* ═══ Night shift — 3 agents, same prompt, loop until stop ═══ */}
      <WorkerNightShiftSection projectId={projectId} projectPath={project.repoPath?.trim() ?? ""} />

      {/* ═══ Asking — questions only, no file create/modify/delete; same terminal agent ═══ */}
      <WorkerAskingSection projectId={projectId} projectPath={project.repoPath?.trim() ?? ""} />

      {/* ═══ Fast development — type command, run agent immediately ═══ */}
      <WorkerFastDevelopmentSection
        projectId={projectId}
        projectPath={project.repoPath?.trim() ?? ""}
        onTicketCreated={loadTicketsAndKanban}
      />

      {/* ═══ Debugging — paste error logs, run terminal agent to fix ═══ */}
      <WorkerDebuggingSection
        projectId={projectId}
        projectPath={project.repoPath?.trim() ?? ""}
        repoPath={project.repoPath ?? ""}
      />

      {/* ═══ Terminal Output (Command Center + terminals) ═══ */}
      <WorkerTerminalsSection
        kanbanData={kanbanData}
        projectId={projectId}
        projectPath={project.repoPath?.trim() ?? ""}
        repoPath={project.repoPath ?? ""}
        onRunInProgress={handleRunInProgressTickets}
        handleMarkDone={handleMarkDone}
        handleRedo={handleRedo}
        handleArchive={handleArchive}
      />

      {/* ═══ Queue + Other in progress (together below Terminal) ═══ */}
      <WorkerGeneralQueueSection
        projectId={projectId}
        repoPath={project.repoPath ?? ""}
        projectPath={project.repoPath?.trim() ?? ""}
        kanbanData={kanbanData}
        onRunInProgress={handleRunInProgressTickets}
      />

      <WorkerTicketQueue
        kanbanData={kanbanData}
        projectId={projectId}
        handleMarkDone={handleMarkDone}
        handleRedo={handleRedo}
        handleArchive={handleArchive}
        ticketNumbersShownInTerminals={ticketNumbersShownInTerminals}
      />

      <WorkerHistorySection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   History — table of all agent terminal outputs
   ═══════════════════════════════════════════════════════════════════════════ */

const OUTPUT_PREVIEW_LEN = 80;

type HistorySortOrder = "newest" | "oldest" | "shortest" | "longest";
type ExitStatusFilter = "all" | "success" | "failed";
type DateRangeFilter = "all" | "24h" | "7d" | "30d";
type SlotFilter = "all" | "1" | "2" | "3";

const MS_24H = 24 * 60 * 60 * 1000;
const MS_7D = 7 * MS_24H;
const MS_30D = 30 * MS_24H;

function WorkerHistorySection() {
  const history = useRunStore((s) => s.terminalOutputHistory);
  const clearTerminalOutputHistory = useRunStore((s) => s.clearTerminalOutputHistory);
  const removeTerminalOutputFromHistory = useRunStore((s) => s.removeTerminalOutputFromHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [exitStatusFilter, setExitStatusFilter] = useState<ExitStatusFilter>(() => getRunHistoryPreferences().exitStatusFilter);
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>(() => getRunHistoryPreferences().dateRangeFilter);
  const [slotFilter, setSlotFilter] = useState<SlotFilter>(() => getRunHistoryPreferences().slotFilter);
  const [sortOrder, setSortOrder] = useState<HistorySortOrder>(() => getRunHistoryPreferences().sortOrder);
  useEffect(() => {
    setRunHistoryPreferences({ sortOrder, exitStatusFilter, dateRangeFilter, slotFilter });
  }, [sortOrder, exitStatusFilter, dateRangeFilter, slotFilter]);
  const trimmedQuery = filterQuery.trim().toLowerCase();
  const isNonDefaultPreferences =
    sortOrder !== DEFAULT_RUN_HISTORY_PREFERENCES.sortOrder ||
    exitStatusFilter !== DEFAULT_RUN_HISTORY_PREFERENCES.exitStatusFilter ||
    dateRangeFilter !== DEFAULT_RUN_HISTORY_PREFERENCES.dateRangeFilter ||
    slotFilter !== DEFAULT_RUN_HISTORY_PREFERENCES.slotFilter;
  const filteredHistory = useMemo(() => {
    const byLabel = !trimmedQuery
      ? history
      : history.filter((h) => h.label.toLowerCase().includes(trimmedQuery));
    let byStatus = byLabel;
    if (exitStatusFilter === "success") byStatus = byLabel.filter((h) => h.exitCode === 0);
    else if (exitStatusFilter === "failed") byStatus = byLabel.filter((h) => h.exitCode !== undefined && h.exitCode !== 0);
    let byDate = byStatus;
    if (dateRangeFilter !== "all") {
      const now = Date.now();
      const cutoff = dateRangeFilter === "24h" ? now - MS_24H : dateRangeFilter === "7d" ? now - MS_7D : now - MS_30D;
      byDate = byStatus.filter((h) => {
        try {
          const t = new Date(h.timestamp).getTime();
          return Number.isFinite(t) && t >= cutoff;
        } catch {
          return false;
        }
      });
    }
    if (slotFilter === "all") return byDate;
    const slotNum = Number(slotFilter) as 1 | 2 | 3;
    return byDate.filter((h) => h.slot === slotNum);
  }, [history, trimmedQuery, exitStatusFilter, dateRangeFilter, slotFilter]);
  const displayHistory = useMemo(() => {
    if (sortOrder === "oldest") return [...filteredHistory].reverse();
    if (sortOrder === "shortest") {
      return [...filteredHistory].sort((a, b) => {
        const am = a.durationMs ?? Infinity;
        const bm = b.durationMs ?? Infinity;
        return am - bm;
      });
    }
    if (sortOrder === "longest") {
      return [...filteredHistory].sort((a, b) => {
        const am = a.durationMs ?? -1;
        const bm = b.durationMs ?? -1;
        return bm - am;
      });
    }
    return filteredHistory;
  }, [filteredHistory, sortOrder]);
  const entry = expandedId ? history.find((e) => e.id === expandedId) : null;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden bg-gradient-to-r from-slate-500/[0.04] to-zinc-500/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-lg bg-slate-500/10">
            <History className="size-3.5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground tracking-tight">History</h3>
            <p className="text-[10px] text-muted-foreground normal-case">
              Outputs of completed agent runs
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyAllRunHistoryToClipboard(displayHistory)}
              className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Copy visible run history to clipboard"
              aria-label="Copy visible run history to clipboard"
            >
              <Copy className="size-3" />
              Copy all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadAllRunHistory(displayHistory)}
              className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Export visible run history as one file"
              aria-label="Export visible run history as one file"
            >
              <Download className="size-3" />
              Download all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadAllRunHistoryCsv(displayHistory)}
              className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Export visible run history as CSV"
              aria-label="Export visible run history as CSV"
            >
              <Download className="size-3" />
              Download as CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadAllRunHistoryJson(displayHistory)}
              className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Export visible run history as JSON"
              aria-label="Export visible run history as JSON"
            >
              <FileJson className="size-3" />
              Download as JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadAllRunHistoryMarkdown(displayHistory)}
              className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Export visible run history as Markdown"
              aria-label="Export visible run history as Markdown"
            >
              <FileText className="size-3" />
              Download as Markdown
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearConfirmOpen(true)}
              className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="size-3" />
              Clear history
            </Button>
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No runs yet. Completed terminal runs will appear here.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" aria-hidden />
                <Input
                  type="text"
                  placeholder="Filter by label…"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                  aria-label="Filter run history by label"
                />
              </div>
              {trimmedQuery && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterQuery("")}
                  className="h-8 gap-1.5 text-xs"
                  aria-label="Clear filter"
                >
                  <X className="size-3.5" aria-hidden />
                  Clear
                </Button>
              )}
              <Select value={exitStatusFilter} onValueChange={(v) => setExitStatusFilter(v as ExitStatusFilter)}>
                <SelectTrigger className="h-8 w-[110px] text-xs" aria-label="Filter run history by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  <SelectItem value="success" className="text-xs">Success</SelectItem>
                  <SelectItem value="failed" className="text-xs">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as HistorySortOrder)}>
                <SelectTrigger className="h-8 min-w-[140px] w-[140px] text-xs" aria-label="Sort run history">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-xs">Newest first</SelectItem>
                  <SelectItem value="oldest" className="text-xs">Oldest first</SelectItem>
                  <SelectItem value="shortest" className="text-xs">Shortest first</SelectItem>
                  <SelectItem value="longest" className="text-xs">Longest first</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRangeFilter} onValueChange={(v) => setDateRangeFilter(v as DateRangeFilter)}>
                <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="Filter run history by date range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All time</SelectItem>
                  <SelectItem value="24h" className="text-xs">Last 24 hours</SelectItem>
                  <SelectItem value="7d" className="text-xs">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="text-xs">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={slotFilter} onValueChange={(v) => setSlotFilter(v as SlotFilter)}>
                <SelectTrigger className="h-8 w-[100px] text-xs" aria-label="Filter run history by slot">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All slots</SelectItem>
                  <SelectItem value="1" className="text-xs">Slot 1</SelectItem>
                  <SelectItem value="2" className="text-xs">Slot 2</SelectItem>
                  <SelectItem value="3" className="text-xs">Slot 3</SelectItem>
                </SelectContent>
              </Select>
              {(trimmedQuery || exitStatusFilter !== "all" || dateRangeFilter !== "all" || slotFilter !== "all") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterQuery("");
                    setExitStatusFilter("all");
                    setDateRangeFilter("all");
                    setSlotFilter("all");
                  }}
                  className="h-8 gap-1.5 text-xs"
                  aria-label="Reset all filters"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Reset filters
                </Button>
              )}
              {isNonDefaultPreferences && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortOrder(DEFAULT_RUN_HISTORY_PREFERENCES.sortOrder);
                    setExitStatusFilter(DEFAULT_RUN_HISTORY_PREFERENCES.exitStatusFilter);
                    setDateRangeFilter(DEFAULT_RUN_HISTORY_PREFERENCES.dateRangeFilter);
                    setSlotFilter(DEFAULT_RUN_HISTORY_PREFERENCES.slotFilter);
                    setRunHistoryPreferences(DEFAULT_RUN_HISTORY_PREFERENCES);
                    toast.success("Preferences restored to defaults.");
                  }}
                  className="h-8 gap-1.5 text-xs"
                  aria-label="Restore default sort and filter preferences"
                  title="Restore default sort and filter preferences (and persist)"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Restore defaults
                </Button>
              )}
              {(trimmedQuery || exitStatusFilter !== "all" || dateRangeFilter !== "all" || slotFilter !== "all") && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Showing {filteredHistory.length} of {history.length} runs
                </span>
              )}
            </div>
            {filteredHistory.length > 0 ? (
            <div className="rounded-lg border border-border/40 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead className="min-w-[160px]">Label</TableHead>
                  <TableHead className="w-14">Slot</TableHead>
                  <TableHead className="w-14">Exit</TableHead>
                  <TableHead className="w-16">Duration</TableHead>
                  <TableHead>Output (preview)</TableHead>
                  <TableHead className="min-w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayHistory.map((h) => {
                  const preview = h.output.trim().slice(0, OUTPUT_PREVIEW_LEN);
                  const hasMore = h.output.trim().length > OUTPUT_PREVIEW_LEN;
                  return (
                    <TableRow key={h.id} className="group">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                        {formatTime(h.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs font-medium truncate max-w-[200px]" title={h.label}>
                        {h.label}
                      </TableCell>
                      <TableCell className="text-xs">
                        {h.slot != null ? `T${h.slot}` : "—"}
                      </TableCell>
                      <TableCell>
                        {h.exitCode !== undefined ? (
                          <span className={cn(
                            "text-xs font-mono px-1.5 py-0.5 rounded",
                            h.exitCode === 0 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                          )}>
                            {h.exitCode}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {h.durationMs != null && h.durationMs >= 0
                          ? h.durationMs < 1000
                            ? "<1s"
                            : formatElapsed(h.durationMs / 1000)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono max-w-[280px] truncate" title={preview}>
                        {preview}{hasMore ? "…" : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100"
                            onClick={() => copyTextToClipboard(h.id)}
                            title="Copy run ID"
                          >
                            <Hash className="size-3" />
                            Copy ID
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100"
                            onClick={() => copyTextToClipboard(h.output)}
                            title="Copy output"
                          >
                            <Copy className="size-3" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100"
                            onClick={() => downloadRunOutput(h.output, h.label)}
                            title="Download output as file"
                          >
                            <Download className="size-3" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100"
                            onClick={() => downloadRunAsJson(h)}
                            title="Export run as JSON"
                          >
                            <FileJson className="size-3" />
                            JSON
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100"
                            onClick={() => downloadRunAsMarkdown(h)}
                            title="Export run as Markdown"
                          >
                            <FileText className="size-3" />
                            MD
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100"
                            onClick={() => downloadRunAsCsv(h)}
                            title="Export run as CSV"
                          >
                            <FileSpreadsheet className="size-3" />
                            CSV
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              removeTerminalOutputFromHistory(h.id);
                              toast.success("Run removed from history");
                            }}
                            title="Remove from history"
                          >
                            <Trash2 className="size-3" />
                            Remove
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 opacity-70 group-hover:opacity-100"
                            onClick={() => setExpandedId(h.id)}
                          >
                            <ChevronDown className="size-3 rotate-[-90deg]" />
                            Full
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
            ) : trimmedQuery ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No runs match &quot;{filterQuery.trim()}&quot;.
              </p>
            ) : dateRangeFilter !== "all" ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No runs in this date range.
              </p>
            ) : exitStatusFilter === "success" ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No successful runs.
              </p>
            ) : exitStatusFilter === "failed" ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No failed runs.
              </p>
            ) : slotFilter !== "all" ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No runs in Slot {slotFilter}.
              </p>
            ) : null}
          </>
        )}
      </div>

      <Dialog open={!!expandedId} onOpenChange={(open) => !open && setExpandedId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold truncate pr-8">
              {entry?.label ?? "Output"}
            </DialogTitle>
          </DialogHeader>
          {entry && (
            <>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => copyTextToClipboard(entry.id)}
                  title="Copy run ID"
                  aria-label="Copy run ID to clipboard"
                >
                  <Hash className="size-3.5" />
                  Copy run ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => copyTextToClipboard(entry.output || "")}
                >
                  <Copy className="size-3.5" />
                  Copy output
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => downloadRunOutput(entry.output || "", entry.label)}
                >
                  <Download className="size-3.5" />
                  Download output
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => downloadRunAsJson(entry)}
                  title="Export run as JSON"
                >
                  <FileJson className="size-3.5" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => downloadRunAsMarkdown(entry)}
                  title="Export run as Markdown"
                >
                  <FileText className="size-3.5" />
                  Export Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => downloadRunAsCsv(entry)}
                  title="Export run as CSV"
                >
                  <FileSpreadsheet className="size-3.5" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    removeTerminalOutputFromHistory(entry.id);
                    setExpandedId(null);
                    toast.success("Run removed from history");
                  }}
                  title="Remove from history"
                >
                  <Trash2 className="size-3.5" />
                  Remove from history
                </Button>
              </div>
              <pre className="flex-1 overflow-auto rounded-lg bg-muted/50 p-4 text-xs font-mono whitespace-pre-wrap border border-border/40">
                {entry.output || "(no output)"}
              </pre>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear run history?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {history.length === 1
              ? "1 run will be removed from history. This cannot be undone."
              : `${history.length} runs will be removed from history. This cannot be undone.`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearTerminalOutputHistory();
                setClearConfirmOpen(false);
                toast.success("History cleared");
              }}
            >
              Clear history
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Status Bar — live overview of running terminals
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerStatusBar() {
  const runningRuns = useRunStore((s) => s.runningRuns);
  const pendingQueueLength = useRunStore((s) => s.pendingTempTicketQueue.length);
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
          {pendingQueueLength > 0 && (
            <StatusPill
              icon={<Circle className="size-3" />}
              label="Queued"
              count={pendingQueueLength}
              color="violet"
              pulse
            />
          )}
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
   Fast development — type command, run agent immediately
   ═══════════════════════════════════════════════════════════════════════════ */

const FAST_DEV_PROMPT_PREFIX = "Do the following in this project. Be concise and execute.\n\n";

/** Prefix for asking section: agent must never create, modify, or delete files; only answer. */
const ASK_ONLY_PROMPT_PREFIX = "You are in ask-only mode. Do NOT create, modify, or delete any files. Only answer the following question using the project context. You may use the terminal to run read-only commands (e.g. list, grep, cat) if needed.\n\n";

function WorkerAskingSection({ projectId, projectPath }: { projectId: string; projectPath: string }) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    const text = question.trim();
    if (!text) {
      toast.error("Enter a question above, then run the agent.");
      return;
    }
    if (!projectPath?.trim()) {
      toast.error("Project path is missing. Set the project repo path in project details.");
      return;
    }
    setLoading(true);
    try {
      const agentsBlock = await loadAllAgentsContent(projectId, projectPath);
      const fullPrompt = ASK_ONLY_PROMPT_PREFIX + text + agentsBlock;
      const labelSuffix = text.length > 40 ? `${text.slice(0, 37)}…` : text;
      const label = `Ask: ${labelSuffix}`;
      const runId = await runTempTicket(projectPath.trim(), fullPrompt, label);
      if (runId) {
        toast.success(runId === "queued" ? "Added to queue. Agent will start when a slot is free." : "Agent started. Check the terminal below.");
        setQuestion("");
      } else {
        toast.error("Failed to start agent.");
      }
    } catch {
      toast.error("Failed to start agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-center size-7 rounded-lg bg-sky-500/10">
          <MessageCircleQuestion className="size-3.5 text-sky-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">
            Asking
          </h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            Ask questions about the project; the agent answers only (no file changes), using the terminal below
          </p>
        </div>
      </div>
      <div className="px-5 pb-5 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Where is the login form defined?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
            className="flex-1 min-w-0 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={loading}
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="gap-1.5 bg-sky-500 hover:bg-sky-600 text-sky-950 shadow-sm text-xs h-8 rounded-lg shrink-0"
            title="Run the terminal agent in ask-only mode (same script as fast dev, no file edits)"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Ask
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkerFastDevelopmentSection({
  projectId,
  projectPath,
  onTicketCreated,
}: {
  projectId: string;
  projectPath: string;
  onTicketCreated: () => Promise<void>;
}) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRunAgent = async () => {
    const text = command.trim();
    if (!text) {
      toast.error("Enter a command or task above, then run the agent.");
      return;
    }
    if (!projectPath?.trim()) {
      toast.error("Project path is missing. Set the project repo path in project details.");
      return;
    }
    setLoading(true);
    try {
      const agentsBlock = await loadAllAgentsContent(projectId, projectPath.trim());
      const fullPrompt = FAST_DEV_PROMPT_PREFIX + text + agentsBlock;
      const title = text.length > 120 ? `${text.slice(0, 117)}…` : text;

      let milestoneId: number;
      if (isTauri) {
        const mils = await invoke<{ id: number; name: string }[]>("get_project_milestones", { projectIdArg: { projectId } });
        const general = mils?.find((m) => m.name === "General Development");
        milestoneId = general?.id ?? mils?.[0]?.id;
      } else {
        const milRes = await fetch(`/api/data/projects/${projectId}/milestones`);
        if (!milRes.ok) throw new Error("Failed to load milestones");
        const mils = (await milRes.json()) as { id: number; name: string }[];
        const general = mils.find((m) => m.name === "General Development");
        milestoneId = (general ?? mils[0])?.id;
      }
      if (milestoneId == null) {
        toast.error("No milestone found. Add a milestone in the Milestones tab (e.g. General Development).");
        setLoading(false);
        return;
      }

      const createRes = await fetch(`/api/data/projects/${projectId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: fullPrompt,
          priority: "P1",
          feature_name: "Fast development",
          milestone_id: milestoneId,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error((err as { error?: string }).error ?? "Failed to create ticket");
      }
      const newTicket = (await createRes.json()) as { id: string; number: number; title: string; milestone_id?: number };

      let inProgressIds: string[];
      if (isTauri) {
        const state = await invoke<{ inProgressIds: string[] }>("get_project_kanban_state", { projectIdArg: { projectId } });
        inProgressIds = state?.inProgressIds ?? [];
      } else {
        const stateRes = await fetch(`/api/data/projects/${projectId}/kanban-state`);
        if (!stateRes.ok) throw new Error("Failed to load kanban state");
        const state = (await stateRes.json()) as { inProgressIds: string[] };
        inProgressIds = state.inProgressIds ?? [];
      }
      inProgressIds = [...inProgressIds.filter((id) => id !== newTicket.id), newTicket.id];
      const patchRes = await fetch(`/api/data/projects/${projectId}/kanban-state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inProgressIds }),
      });
      if (!patchRes.ok) throw new Error("Failed to add ticket to queue");

      await onTicketCreated();

      const label = `Ticket #${newTicket.number}: ${title.length > 40 ? `${title.slice(0, 37)}…` : title}`;
      const runId = await runTempTicket(projectPath.trim(), fullPrompt, label, {
        ticketId: newTicket.id,
        ticketNumber: newTicket.number,
        ticketTitle: newTicket.title,
        milestoneId: newTicket.milestone_id,
      });
      if (runId) {
        toast.success(runId === "queued" ? "Ticket created and queued. Agent will start when a slot is free." : "Ticket created and agent started. Check the queue and terminal below.");
        setCommand("");
      } else {
        toast.error("Failed to start agent.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create ticket or start agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-center size-7 rounded-lg bg-violet-500/10">
          <Zap className="size-3.5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">
            Fast development
          </h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            Enter a command or task; the agent runs immediately in this project
          </p>
        </div>
      </div>
      <div className="px-5 pb-5 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Add a dark mode toggle to the header"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleRunAgent()}
            className="flex-1 min-w-0 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={loading}
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleRunAgent}
            disabled={loading || !command.trim()}
            className="gap-1.5 bg-violet-500 hover:bg-violet-600 text-violet-950 shadow-sm text-xs h-8 rounded-lg shrink-0"
            title="Run the terminal agent with this command (uses next free terminal slot)"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Run agent
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Debugging — paste error logs, run terminal agent to fix
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerDebuggingSection({
  projectId,
  projectPath,
  repoPath,
}: {
  projectId: string;
  projectPath: string;
  repoPath: string;
}) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const [errorLogs, setErrorLogs] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRunDebugAgent = async () => {
    const logs = errorLogs.trim();
    if (!logs) {
      toast.error("Paste error logs above, then run the agent.");
      return;
    }
    if (!projectPath?.trim()) {
      toast.error("Project path is missing. Set the project repo path in project details.");
      return;
    }
    setLoading(true);
    try {
      const fixBugMd =
        repoPath && projectId
          ? (await readProjectFileOrEmpty(projectId, WORKER_FIX_BUG_PROMPT_PATH, repoPath))?.trim()
          : "";
      const basePrompt = fixBugMd || DEBUG_ASSISTANT_PROMPT_FALLBACK;
      const promptWithLogs = basePrompt.endsWith("\n") ? basePrompt + logs : basePrompt + "\n\n" + logs;
      const agentsBlock = await loadAllAgentsContent(projectId, repoPath);
      const fullPrompt = (promptWithLogs + agentsBlock).trim();
      const runId = await runTempTicket(projectPath.trim(), fullPrompt, "Debug: fix errors");
      if (runId) {
        toast.success(runId === "queued" ? "Added to queue. Agent will start when a slot is free." : "Debug agent started. Check the terminal below.");
      } else {
        toast.error("Failed to start debug agent.");
      }
    } catch {
      toast.error("Failed to start debug agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-center size-7 rounded-lg bg-amber-500/10">
          <Bug className="size-3.5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">
            Debugging
          </h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            Paste error logs below; run the terminal agent to diagnose and fix (runs in this project)
          </p>
        </div>
      </div>
      <div className="px-5 pb-5 space-y-3">
        <Textarea
          placeholder="Paste error messages, stack traces, or build/runtime logs here…"
          value={errorLogs}
          onChange={(e) => setErrorLogs(e.target.value)}
          className="min-h-[120px] resize-y font-mono text-xs bg-muted/30 border-border/60"
          rows={5}
        />
        <Button
          variant="default"
          size="sm"
          onClick={handleRunDebugAgent}
          disabled={loading}
          className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-sm text-xs h-8 rounded-lg"
          title="Runs the debugging prompt + your logs in the terminal agent (uses next free terminal slot)"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Play className="size-3.5" />
          )}
          Run terminal agent to fix
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Terminals Section — each terminal with its ticket directly below
   ═══════════════════════════════════════════════════════════════════════════ */

interface WorkerTerminalsSectionProps {
  kanbanData: TodosKanbanData | null;
  projectId: string;
  projectPath: string;
  repoPath: string;
  onRunInProgress: () => Promise<void>;
  handleMarkDone: (id: string) => Promise<void>;
  handleRedo: (id: string) => Promise<void>;
  handleArchive: (id: string) => Promise<void>;
}

function WorkerTerminalsSection({
  kanbanData,
  projectId,
  projectPath,
  repoPath,
  onRunInProgress,
  handleMarkDone,
  handleRedo,
  handleArchive,
}: WorkerTerminalsSectionProps) {
  const runningRuns = useRunStore((s) => s.runningRuns);
  const runImplementAll = useRunStore((s) => s.runImplementAll);
  const stopAllImplementAll = useRunStore((s) => s.stopAllImplementAll);
  const clearImplementAllLogs = useRunStore((s) => s.clearImplementAllLogs);
  const archiveImplementAllLogs = useRunStore((s) => s.archiveImplementAllLogs);
  const [commandCenterLoading, setCommandCenterLoading] = useState(false);

  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const anyRunning = implementAllRuns.some((r) => r.status === "running");
  const tickets = kanbanData?.columns?.in_progress?.items ?? [];

  const handleImplementAll = async () => {
    setCommandCenterLoading(true);
    try {
      if (tickets.length > 0) {
        await onRunInProgress();
      } else {
        const implementAllMd = repoPath
          ? (await readProjectFileOrEmpty(projectId, WORKER_IMPLEMENT_ALL_PROMPT_PATH, repoPath))?.trim() ?? ""
          : "";
        const kanbanContext = kanbanData ? buildKanbanContextBlock(kanbanData) : "";
        const combinedPrompt = combinePromptRecordWithKanban(kanbanContext, implementAllMd);
        const agentsBlock = await loadAllAgentsContent(projectId, repoPath);
        const promptContent = (combinedPrompt.trim() + agentsBlock).trim() || undefined;
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
      setCommandCenterLoading(false);
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

  const runsForSlots: ((typeof implementAllRuns)[0] | null)[] = [null, null, null];
  for (const run of implementAllRuns) {
    const s = run.slot;
    if (s !== 1 && s !== 2 && s !== 3) continue;
    const existing = runsForSlots[s - 1];
    const preferThis =
      !existing || (run.status === "running" && existing.status !== "running");
    if (preferThis) runsForSlots[s - 1] = run;
  }

  const inProgressTickets = kanbanData?.columns?.in_progress?.items ?? [];

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden">
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
            Command Center and terminals — each slot shows the ticket below
          </p>
        </div>
      </div>

      {/* Command Center: Implement All, Stop all, Clear, Archive */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={handleImplementAll}
            disabled={commandCenterLoading}
            className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm shadow-emerald-500/20 text-xs h-8 rounded-lg transition-all duration-200"
            title="Runs in app with worker prompt and ticket agents."
          >
            {commandCenterLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            Implement All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopAll}
            disabled={!anyRunning}
            className={cn(
              "gap-1.5 text-xs h-8 rounded-lg transition-all duration-200",
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
            className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
          >
            <Eraser className="size-3" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={archiveImplementAllLogs}
            className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200"
          >
            <Archive className="size-3" />
            Archive
          </Button>
        </div>
      </div>

      {/* Terminals: each column = terminal + ticket below */}
      <div className="px-4 pb-4">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
          {runsForSlots.map((run, i) => {
            const ticketNum = parseTicketNumberFromRunLabel(run?.label ?? undefined);
            const ticket = ticketNum != null
              ? inProgressTickets.find((t) => t.number === ticketNum) ?? null
              : null;
            return (
              <div key={i} className="flex flex-col gap-3">
                <TerminalSlot run={run} slotIndex={i} />
                {/* Ticket executing in this terminal — directly below */}
                <div className="min-h-[100px]">
                  {ticket ? (
                    <div className="w-full max-w-[340px] mx-auto lg:max-w-none">
                      <KanbanTicketCard
                        ticket={ticket}
                        columnId="in_progress"
                        projectId={projectId}
                        onMarkDone={handleMarkDone}
                        onRedo={handleRedo}
                        onArchive={handleArchive}
                        onMoveToInProgress={async () => {}}
                      />
                    </div>
                  ) : run?.label ? (
                    <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
                      <p className="text-[11px] text-muted-foreground font-medium truncate" title={run.label}>
                        {run.label}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
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
  ticketNumbersShownInTerminals = new Set(),
}: {
  kanbanData: TodosKanbanData | null;
  projectId: string;
  handleMarkDone: (id: string) => Promise<void>;
  handleRedo: (id: string) => Promise<void>;
  handleArchive: (id: string) => Promise<void>;
  /** Ticket numbers already shown below terminals; only list the rest here. */
  ticketNumbersShownInTerminals?: Set<number>;
}) {
  if (!kanbanData) return null;

  const allInProgress = kanbanData.columns.in_progress?.items ?? [];
  const tickets = ticketNumbersShownInTerminals.size > 0
    ? allInProgress.filter((t) => !ticketNumbersShownInTerminals.has(t.number))
    : allInProgress;

  if (tickets.length === 0 && allInProgress.length > 0) {
    return null;
  }

  return (
    <div className="rounded-2xl surface-card border border-border/50 overflow-hidden flex flex-col bg-gradient-to-r from-blue-500/[0.04] to-violet-500/[0.04]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-1">
        <div className="flex items-center justify-center size-7 rounded-lg bg-blue-500/10">
          <Layers className="size-3.5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">Other in progress</h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            Tickets not currently running in a terminal above
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

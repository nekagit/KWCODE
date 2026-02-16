"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Project } from "@/types/project";
import {
  readProjectFile,
  readProjectFileOrEmpty,
  writeProjectFile,
  listProjectFiles,
  readAnalyzeQueue,
  writeAnalyzeQueue,
  runAnalyzeQueueProcessing,
  ANALYZE_QUEUE_PATH,
  type AnalyzeJob,
  type AnalyzeQueueData,
} from "@/lib/api-projects";
import { invoke, isTauri } from "@/lib/tauri";
import {
  buildKanbanFromTickets,
  applyInProgressState,
  type TodosKanbanData,
  type ParsedTicket,
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Sparkles,
  Activity,
  MonitorUp,
  Layers,
  Workflow,
  FileText,
  ScanSearch,
  Bug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isImplementAllRun, parseTicketNumberFromRunLabel } from "@/lib/run-helpers";
import { StatusPill } from "@/components/shared/DisplayPrimitives";
import { TerminalSlot } from "@/components/shared/TerminalSlot";
import { KanbanTicketCard } from "@/components/molecules/Kanban/KanbanTicketCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

/** System prompt for the debugging terminal agent. User pastes error logs below; this is prepended so the agent gets instructions + logs. */
const DEBUG_ASSISTANT_PROMPT = `You are an expert debugging assistant with deep knowledge across all tech stacks, frameworks, and languages.

CONTEXT ANALYSIS:
1. Carefully read ALL provided logs, error messages, and stack traces
2. Identify the root cause, not just symptoms
3. Consider version conflicts, dependency issues, configuration problems, and code logic errors

DEBUGGING APPROACH:
- Analyze error messages line by line
- Trace the execution flow from the error backwards
- Check for common pitfalls: missing dependencies, incorrect paths, permission issues, environment variables, API changes
- Consider the full context: OS, runtime version, framework version, recent changes

SOLUTION REQUIREMENTS:
1. Explain the root cause clearly and concisely
2. Provide the exact fix with file paths and line numbers
3. Show before/after code changes when applicable
4. Include any commands needed (install, configure, restart)
5. Suggest preventive measures to avoid similar issues

OUTPUT FORMAT:
**Root Cause:** [Clear explanation]
**Fix:** [Step-by-step solution]
**Why This Works:** [Brief technical explanation]
**Prevention:** [How to avoid this in future]

Be direct, accurate, and actionable. No generic advice - provide specific solutions based on the actual error.

ERROR/LOG INFORMATION:
`;

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
      const [ticketsRes, stateRes] = await Promise.all([
        fetch(`/api/data/projects/${projectId}/tickets`),
        fetch(`/api/data/projects/${projectId}/kanban-state`),
      ]);
      if (!ticketsRes.ok || !stateRes.ok) {
        throw new Error("Failed to load tickets");
      }
      const apiTickets = (await ticketsRes.json()) as {
        id: string;
        number: number;
        title: string;
        description?: string;
        priority: string;
        feature_name: string;
        done: boolean;
        status: string;
        agents?: string[];
        milestone_id?: number;
        idea_id?: number;
      }[];
      const { inProgressIds } = (await stateRes.json()) as { inProgressIds: string[] };
      const tickets: ParsedTicket[] = apiTickets.map((t) => ({
        id: t.id,
        number: t.number,
        title: t.title,
        description: t.description,
        priority: (t.priority as ParsedTicket["priority"]) || "P1",
        featureName: t.feature_name || "General",
        done: t.done,
        status: (t.status as ParsedTicket["status"]) || "Todo",
        agents: t.agents,
        milestoneId: t.milestone_id,
        ideaId: t.idea_id,
      }));
      const data = buildKanbanFromTickets(tickets, inProgressIds ?? []);
      setKanbanData(data);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
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

      {/* ═══ Queue & workflow (.cursor/worker) ═══ */}
      <WorkerQueueSection projectId={projectId} repoPath={project.repoPath ?? ""} />

      {/* ═══ Analyze queue (8 prompts, 3 at a time) ═══ */}
      <WorkerAnalyzeQueueSection projectId={projectId} repoPath={project.repoPath ?? ""} />

      {/* ═══ Command Center (Implement All) ═══ */}
      <WorkerCommandCenter
        projectPath={project.repoPath.trim()}
        projectId={projectId}
        repoPath={project.repoPath ?? ""}
        kanbanData={kanbanData}
      />

      {/* ═══ Debugging — paste error logs, run terminal agent to fix ═══ */}
      <WorkerDebuggingSection projectPath={project.repoPath.trim()} />

      {/* ═══ Terminals + ticket per slot (each ticket directly below its terminal) ═══ */}
      <WorkerTerminalsSection
        kanbanData={kanbanData}
        projectId={projectId}
        handleMarkDone={handleMarkDone}
        handleRedo={handleRedo}
        handleArchive={handleArchive}
      />

      {/* ═══ Other in-progress tickets (not currently in a terminal slot) ═══ */}
      <WorkerTicketQueue
        kanbanData={kanbanData}
        projectId={projectId}
        handleMarkDone={handleMarkDone}
        handleRedo={handleRedo}
        handleArchive={handleArchive}
        ticketNumbersShownInTerminals={ticketNumbersShownInTerminals}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Queue & workflow — .cursor/worker/queue and .cursor/worker/workflows
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerQueueSection({ projectId, repoPath }: { projectId: string; repoPath: string }) {
  const [queueFiles, setQueueFiles] = useState<string[]>([]);
  const [workflowFiles, setWorkflowFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (!repoPath) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      listProjectFiles(projectId, ".cursor/worker/queue", repoPath),
      listProjectFiles(projectId, ".cursor/worker/workflows", repoPath),
    ])
      .then(([queue, workflows]) => {
        if (cancelled) return;
        setQueueFiles(queue.filter((e) => !e.isDirectory).map((e) => e.name));
        setWorkflowFiles(workflows.filter((e) => !e.isDirectory).map((e) => e.name));
      })
      .catch(() => {
        if (!cancelled) {
          setQueueFiles([]);
          setWorkflowFiles([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, repoPath]);

  useEffect(() => {
    if (!previewPath || !repoPath) {
      setPreviewContent(null);
      return;
    }
    let cancelled = false;
    setLoadingPreview(true);
    const name = previewPath.split("/").pop() ?? "";
    const subdir = previewPath.includes("workflows/") ? ".cursor/worker/workflows" : ".cursor/worker/queue";
    readProjectFileOrEmpty(projectId, `${subdir}/${name}`, repoPath)
      .then((t) => {
        if (!cancelled) setPreviewContent(t?.trim() ?? null);
      })
      .catch(() => {
        if (!cancelled) setPreviewContent(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, repoPath, previewPath]);

  if (!repoPath) return null;

  const totalFiles = queueFiles.length + workflowFiles.length;
  if (loading && totalFiles === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Workflow className="size-4 text-rose-500" />
          <span className="text-xs font-medium">Queue & workflow</span>
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (totalFiles === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Workflow className="size-4 text-rose-500" />
          <span className="text-xs font-medium">Queue & workflow</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          No files in .cursor/worker/queue or .cursor/worker/workflows. Add ready.md, in-progress.md, completed.md, or ticket-workflow.md.
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden backdrop-blur-sm">
      <AccordionItem value="queue" className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-rose-500" />
            <span className="text-xs font-semibold">Queue & workflow</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-0">
          <div className="flex flex-col sm:flex-row gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            <div className="flex-1 p-4 min-w-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">.cursor/worker/queue/</p>
                  <ul className="space-y-1">
                    {queueFiles.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          onClick={() => setPreviewPath(`.cursor/worker/queue/${name}`)}
                          className={cn(
                            "text-xs font-mono hover:underline text-left",
                            previewPath === `.cursor/worker/queue/${name}` ? "text-rose-500 font-medium" : "text-foreground/80"
                          )}
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">.cursor/worker/workflows/</p>
                  <ul className="space-y-1">
                    {workflowFiles.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          onClick={() => setPreviewPath(`.cursor/worker/workflows/${name}`)}
                          className={cn(
                            "text-xs font-mono hover:underline text-left",
                            previewPath === `.cursor/worker/workflows/${name}` ? "text-rose-500 font-medium" : "text-foreground/80"
                          )}
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 max-h-[200px] sm:max-h-[160px] overflow-hidden flex flex-col">
              {loadingPreview ? (
                <div className="flex items-center justify-center flex-1 p-4">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : previewContent ? (
                <ScrollArea className="flex-1 p-3">
                  <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-sans">{previewContent}</pre>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center flex-1 p-4 text-xs text-muted-foreground">
                  <FileText className="size-4 mr-1.5" />
                  Click a file to preview
                </div>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Analyze queue — 8 prompts as jobs, process 3 at a time
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerAnalyzeQueueSection({ projectId, repoPath }: { projectId: string; repoPath: string }) {
  const [data, setData] = useState<AnalyzeQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadQueue = useCallback(async () => {
    if (!repoPath) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = await readAnalyzeQueue(projectId, repoPath);
      setData(q);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, repoPath]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const pendingCount = data?.jobs?.filter((j) => j.status === "pending").length ?? 0;
  const hasPending = pendingCount > 0;

  if (!repoPath) return null;

  return (
    <Accordion type="single" collapsible className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden backdrop-blur-sm">
      <AccordionItem value="analyze" className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
          <div className="flex items-center justify-between gap-2 w-full pr-2">
            <div className="flex items-center gap-2">
              <ScanSearch className="size-4 text-primary" />
              <span className="text-xs font-semibold">Analyze queue</span>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px]"
                disabled={loading || processing}
                onClick={async () => {
                  await writeAnalyzeQueue(projectId, repoPath);
                  await loadQueue();
                  toast.success("8 jobs enqueued.");
                }}
              >
                Enqueue (8 jobs)
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-7 text-[10px]"
                disabled={!hasPending || processing}
                onClick={async () => {
                  setProcessing(true);
                  try {
                    const { completed, failed } = await runAnalyzeQueueProcessing(projectId, repoPath, {
                      getQueue: () => readAnalyzeQueue(projectId, repoPath),
                      setQueue: (d) =>
                        writeProjectFile(projectId, ANALYZE_QUEUE_PATH, JSON.stringify(d, null, 2), repoPath),
                    });
                    await loadQueue();
                    if (failed === 0) toast.success(`All ${completed} done.`);
                    else toast.warning(`${completed} done, ${failed} failed.`);
                  } finally {
                    setProcessing(false);
                  }
                }}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1" />
                    Process…
                  </>
                ) : (
                  "Process (3 at a time)"
                )}
              </Button>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-0">
          <div className="p-4 min-h-[80px]">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-xs">Loading queue…</span>
              </div>
            ) : !data?.jobs?.length ? (
              <p className="text-xs text-muted-foreground">
                No analyze queue. Click &quot;Enqueue (8 jobs)&quot; to add ideas, project, design, architecture, testing, documentation, frontend, backend.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {data.jobs.map((job: AnalyzeJob) => (
                  <li key={job.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-foreground/90">{job.id}</span>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                        job.status === "done" && "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
                        job.status === "failed" && "bg-rose-500/10 border-rose-500/25 text-rose-400",
                        job.status === "running" && "bg-amber-500/10 border-amber-500/25 text-amber-400",
                        job.status === "pending" && "bg-muted/30 border-border/50 text-muted-foreground"
                      )}
                    >
                      {job.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
  const [loading, setLoading] = useState(false);

  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const anyRunning = implementAllRuns.some((r) => r.status === "running");

  const handleImplementAll = async () => {
    const tickets = kanbanData?.columns?.in_progress?.items ?? [];

    setLoading(true);
    try {
      // Use only .cursor/prompts/worker.md as the base prompt; agents are loaded per-ticket from .cursor/agents
      const workerMd = repoPath
        ? (await readProjectFileOrEmpty(projectId, ".cursor/prompts/worker.md", repoPath))?.trim() ?? ""
        : "";
      const userPrompt = workerMd;

      if (tickets.length > 0) {
        let gitRefAtStart = "";
        if (isTauri) {
          try {
            gitRefAtStart = (await invoke<string>("get_git_head", { projectPath })) ?? "";
          } catch {
            /* ignore */
          }
        }
        const slots: Array<{ slot: 1 | 2 | 3; promptContent: string; label: string; meta?: { projectId: string; repoPath: string; ticketNumber: number; ticketTitle: string; milestoneId?: number; ideaId?: number; gitRefAtStart?: string } }> = [];
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
            meta: {
              projectId,
              repoPath,
              ticketNumber: ticket.number,
              ticketTitle: ticket.title,
              milestoneId: ticket.milestoneId,
              ideaId: ticket.ideaId,
              gitRefAtStart: gitRefAtStart || undefined,
            },
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

      {/* Actions: single row */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={handleImplementAll}
            disabled={loading}
            className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm shadow-emerald-500/20 text-xs h-8 rounded-lg transition-all duration-200"
            title="Runs in app with worker prompt and ticket agents."
          >
            {loading ? (
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Debugging — paste error logs, run terminal agent to fix
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerDebuggingSection({ projectPath }: { projectPath: string }) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const [errorLogs, setErrorLogs] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRunDebugAgent = async () => {
    const logs = errorLogs.trim();
    if (!logs) {
      toast.error("Paste error logs above, then run the agent.");
      return;
    }
    setLoading(true);
    try {
      const fullPrompt = DEBUG_ASSISTANT_PROMPT + logs;
      const runId = await runTempTicket(projectPath, fullPrompt, "Debug: fix errors");
      if (runId) {
        toast.success("Debug agent started on slot 1. Check the terminal below.");
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
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-center size-7 rounded-lg bg-amber-500/10">
          <Bug className="size-3.5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">
            Debugging
          </h3>
          <p className="text-[10px] text-muted-foreground normal-case">
            Paste error logs below; run the terminal agent to diagnose and fix
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
          title="Runs the debugging prompt + your logs in the terminal agent (slot 1)"
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

function WorkerTerminalsSection({
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
  const runningRuns = useRunStore((s) => s.runningRuns);
  const implementAllRuns = runningRuns.filter(isImplementAllRun);

  const runsForSlots = [
    implementAllRuns[implementAllRuns.length - 3] ?? null,
    implementAllRuns[implementAllRuns.length - 2] ?? null,
    implementAllRuns[implementAllRuns.length - 1] ?? null,
  ];

  const inProgressTickets = kanbanData?.columns?.in_progress?.items ?? [];

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
            Each terminal shows the ticket executing in it directly below
          </p>
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
    <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-blue-500/[0.04] to-violet-500/[0.04] backdrop-blur-sm overflow-hidden flex flex-col">
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

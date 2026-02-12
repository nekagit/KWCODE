"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Project } from "@/types/project";
import { readProjectFile } from "@/lib/api-projects";
import { isTauri, invoke } from "@/lib/tauri";
import { buildKanbanFromMd, type TodosKanbanData } from "@/lib/todos-kanban";
import { buildKanbanContextBlock, combinePromptRecordWithKanban } from "@/lib/analysis-prompt";
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
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { Form } from "@/components/shared/Form";
import { GenericInputWithLabel } from "@/components/shared/GenericInputWithLabel";
import { GenericTextareaWithLabel } from "@/components/shared/GenericTextareaWithLabel";
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
  ChevronDown,
  Zap,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  Sparkles,
  Activity,
  MonitorUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const isImplementAllRun = (r: { label: string }) =>
  r.label === "Implement All" || r.label.startsWith("Implement All (");

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
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
      const [ticketsMd, featuresMd] = await Promise.all([
        readProjectFile(projectId, ".cursor/tickets.md", repoPath),
        readProjectFile(projectId, ".cursor/features.md", repoPath),
      ]);
      const data = buildKanbanFromMd(ticketsMd, featuresMd);
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

  if (!project.repoPath?.trim()) {
    return (
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-500/[0.03] p-8 backdrop-blur-sm">
        <EmptyState
          icon={<Terminal className="h-8 w-8 text-muted-foreground" />}
          title="No repo path"
          description="Set a repo path for this project in Stakeholder to run and view terminals here."
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

      {/* ═══ Command Center ═══ */}
      <WorkerCommandCenter
        projectPath={project.repoPath.trim()}
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

function StatusPill({
  icon,
  label,
  count,
  color,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: "emerald" | "sky" | "muted";
  pulse?: boolean;
}) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
    sky: "bg-sky-500/10 border-sky-500/25 text-sky-400",
    muted: "bg-muted/30 border-border/50 text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium tabular-nums transition-all duration-300",
        colorClasses[color],
        pulse && "animate-pulse"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Command Center — actions toolbar
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerCommandCenter({
  projectPath,
  kanbanData,
}: {
  projectPath: string;
  kanbanData: TodosKanbanData | null;
}) {
  const runImplementAll = useRunStore((s) => s.runImplementAll);
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
    const userPrompt = prompt?.content?.trim() ?? "";
    const kanbanContext = kanbanData ? buildKanbanContextBlock(kanbanData) : "";
    const combinedPrompt = combinePromptRecordWithKanban(kanbanContext, userPrompt);
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

/* ═══════════════════════════════════════════════════════════════════════════
   Add Prompt Dialog
   ═══════════════════════════════════════════════════════════════════════════ */

function AddPromptDialog({
  open,
  onOpenChange,
}: {
  open: "self" | "ai" | null;
  onOpenChange: (v: "self" | "ai" | null) => void;
}) {
  const addPrompt = useRunStore((s) => s.addPrompt);
  const refreshData = useRunStore((s) => s.refreshData);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const isSelf = open === "self";
  const isAI = open === "ai";

  const handleSave = useCallback(async () => {
    const t = title.trim();
    const c = value.trim();
    if (!t || !c) return;
    setSaving(true);
    try {
      if (isTauri) {
        await invoke("add_prompt", { title: t, content: c });
        await refreshData();
        toast.success("Prompt saved. It will appear in the dropdown.");
      } else {
        addPrompt(t, c);
        toast.success("Prompt saved. It will appear in the dropdown.");
        try {
          const res = await fetch("/api/data/prompts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: t, content: c }),
          });
          if (res.ok) await refreshData();
        } catch {
          // Store already updated
        }
      }
      setTitle("");
      setValue("");
      onOpenChange(null);
    } finally {
      setSaving(false);
    }
  }, [title, value, addPrompt, refreshData, onOpenChange]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      setValue("Generated prompt placeholder. Wire to your AI API.");
      toast.info("Generate prompt: connect to your AI API.");
    } finally {
      setGenerating(false);
    }
  }, []);

  const dialogTitle = isAI ? "AI generation prompt" : "Self-written prompt";
  return (
    <SharedDialog
      isOpen={open != null}
      title={dialogTitle}
      onClose={() => onOpenChange(null)}
      actions={
        <ButtonGroup alignment="right">
          <Button
            variant="outline"
            onClick={() => onOpenChange(null)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !value.trim() || saving}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save
          </Button>
        </ButtonGroup>
      }
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim() && value.trim()) handleSave();
        }}
      >
        <GenericInputWithLabel
          id="add-prompt-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Prompt title (shown in dropdown)"
        />
        <GenericTextareaWithLabel
          id="add-prompt-body"
          label="Prompt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            isSelf ? "Enter your prompt…" : "Generate or paste prompt…"
          }
          rows={5}
          className="min-h-[120px] font-mono text-sm"
        />
        {isAI && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Generate
          </Button>
        )}
      </Form>
    </SharedDialog>
  );
}

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
            <WorkerTerminalSlot key={i} run={run} slotIndex={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Single Terminal Slot
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkerTerminalSlot({
  run,
  slotIndex,
}: {
  run: {
    runId: string;
    label: string;
    logLines: string[];
    status: "running" | "done";
    startedAt?: number;
    doneAt?: number;
  } | null;
  slotIndex: number;
}) {
  const displayLogLines = run?.logLines ?? [];
  const running = run?.status === "running";
  const done = run?.status === "done";
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!run?.startedAt) return;
    if (run.status === "done" && run.doneAt != null) {
      setElapsedSeconds((run.doneAt - run.startedAt) / 1000);
      return;
    }
    const tick = () =>
      setElapsedSeconds(Math.floor((Date.now() - run.startedAt!) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [run?.runId, run?.status, run?.startedAt, run?.doneAt]);

  // Auto-scroll to bottom on new log lines
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [displayLogLines.length]);

  const statusColor = running
    ? "emerald"
    : done
      ? "sky"
      : "muted";

  const statusLabel = run
    ? running
      ? `Running — ${formatElapsed(elapsedSeconds)}`
      : run.doneAt != null && run.startedAt != null
        ? `Done in ${formatElapsed((run.doneAt - run.startedAt) / 1000)}`
        : "Done"
    : "Idle";

  const borderColor = {
    emerald: "border-emerald-500/30",
    sky: "border-sky-500/20",
    muted: "border-border/40",
  }[statusColor];

  const headerBg = {
    emerald: "bg-emerald-500/[0.06]",
    sky: "bg-sky-500/[0.04]",
    muted: "bg-muted/20",
  }[statusColor];

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border overflow-hidden transition-all duration-300",
        borderColor,
        running && "shadow-lg shadow-emerald-500/5"
      )}
    >
      {/* Terminal Header */}
      <div className={cn("flex items-center justify-between px-3.5 py-2.5", headerBg)}>
        <div className="flex items-center gap-2">
          {/* Terminal dots */}
          <div className="flex items-center gap-1">
            <div className={cn(
              "size-2 rounded-full transition-colors duration-300",
              running ? "bg-emerald-400 animate-pulse" : done ? "bg-sky-400" : "bg-muted-foreground/30"
            )} />
            <div className="size-2 rounded-full bg-muted-foreground/20" />
            <div className="size-2 rounded-full bg-muted-foreground/20" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Terminal {slotIndex + 1}
          </span>
        </div>

        {/* Status badge */}
        <div className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
          statusColor === "emerald" && "bg-emerald-500/15 text-emerald-400",
          statusColor === "sky" && "bg-sky-500/15 text-sky-400",
          statusColor === "muted" && "bg-muted/40 text-muted-foreground",
        )}>
          {running && <Loader2 className="size-2.5 animate-spin" />}
          {done && <CheckCircle2 className="size-2.5" />}
          {!run && <Circle className="size-2.5" />}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Terminal body */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))]/80">
        <ScrollArea
          ref={scrollRef}
          className="h-[280px] min-h-[200px]"
        >
          <div className="p-3 font-mono text-xs leading-relaxed">
            {displayLogLines.length === 0 && !running && (
              <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-center">
                <Terminal className="size-8 text-muted-foreground/30" />
                <p className="text-[11px] text-muted-foreground/60 normal-case">
                  No output yet
                </p>
              </div>
            )}
            {displayLogLines.length === 0 && running && (
              <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                  <Loader2 className="relative size-6 animate-spin text-emerald-400" />
                </div>
                <p className="text-[11px] text-muted-foreground normal-case">
                  Waiting for output…
                </p>
              </div>
            )}
            {displayLogLines.map((line, i) => (
              <div
                key={i}
                className="py-0.5 pr-2 text-muted-foreground/90 whitespace-pre-wrap break-all hover:text-foreground hover:bg-muted/20 rounded-sm transition-colors duration-150"
              >
                {line}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

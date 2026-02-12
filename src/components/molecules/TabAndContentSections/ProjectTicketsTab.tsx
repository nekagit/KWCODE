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
  Layers,
  Play,
  ChevronDown,
  Square,
  Eraser,
  Archive,
  Terminal,
  CheckCircle2,
  Circle,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { readProjectFile, writeProjectFile } from "@/lib/api-projects";
import { isTauri, invoke } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
import { Card } from "@/components/shared/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  buildKanbanFromMd,
  markTicketsDone,
  markTicketsNotDone,
  validateFeaturesTicketsCorrelation,
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
} from "@/lib/analysis-prompt";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { KanbanColumnCard } from "@/components/molecules/Kanban/KanbanColumnCard";
import { GenerateKanbanPromptSection } from "@/components/atoms/forms/GenerateKanbanPromptSection";
import { cn } from "@/lib/utils";

const PRIORITIES: Array<"P0" | "P1" | "P2" | "P3"> = ["P0", "P1", "P2", "P3"];

/** Tailwind border/text classes per feature index so features and their tickets share the same color. */
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

const isImplementAllRun = (r: { label: string }) =>
  r.label === "Implement All" || r.label.startsWith("Implement All (");

/* ═══════════════════════════════════════════════════════ */
/*  ImplementAllTerminalsGrid                             */
/* ═══════════════════════════════════════════════════════ */

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
        <ImplementAllTerminalSlot key={i} run={run} slotIndex={i} />
      ))}
    </div>
  );
}

/** Format seconds as m:ss or s. */
function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Single terminal slot. */
function ImplementAllTerminalSlot({
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

  const subtitle = run
    ? running
      ? `${run.label} — Running… ${formatElapsed(elapsedSeconds)}`
      : run.doneAt != null && run.startedAt != null
        ? `${run.label} — Done in ${formatElapsed((run.doneAt - run.startedAt) / 1000)}`
        : `${run.label} — Done`
    : "No run yet.";

  return (
    <div className="flex flex-col rounded-xl border border-border/40 bg-card/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-muted/20">
        <span className="text-xs font-medium text-muted-foreground">
          Terminal {slotIndex + 1}
        </span>
        {running && (
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {formatElapsed(elapsedSeconds)}
          </span>
        )}
      </div>
      <div className="p-2 min-h-0 flex-1">
        <ScrollArea className="h-[40vh] min-h-[120px] rounded-lg bg-black/40 p-2 font-mono text-xs">
          {displayLogLines.length === 0 && !running && (
            <p className="py-6 px-3 text-center text-muted-foreground/50 text-xs">
              No output yet.
            </p>
          )}
          {displayLogLines.length === 0 && running && (
            <p className="py-6 px-3 flex items-center gap-2 text-muted-foreground/50 text-xs">
              <Loader2 className="size-3 animate-spin" />
              Waiting for output…
            </p>
          )}
          {displayLogLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all py-0.5 pr-2 text-foreground/80">
              {line}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}

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

/* ═══════════════════════════════════════════════════════ */
/*  AddPromptDialog                                       */
/* ═══════════════════════════════════════════════════════ */

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
            {saving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
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
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Generate
          </Button>
        )}
      </Form>
    </SharedDialog>
  );
}

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
  const [showFeatureTicketWarning, setShowFeatureTicketWarning] =
    useState(false);
  const [addTicketOpen, setAddTicketOpen] = useState(false);
  const [addFeatureOpen, setAddFeatureOpen] = useState(false);
  const [addTicketTitle, setAddTicketTitle] = useState("");
  const [addTicketDesc, setAddTicketDesc] = useState("");
  const [addTicketPriority, setAddTicketPriority] = useState<
    "P0" | "P1" | "P2" | "P3"
  >("P1");
  const [addTicketFeature, setAddTicketFeature] = useState("");
  const [addFeatureTitle, setAddFeatureTitle] = useState("");
  const [addFeatureRefs, setAddFeatureRefs] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── Data loading ── */

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
      const [ticketsMd, featuresMd] = await Promise.all([
        readProjectFile(projectId, ".cursor/tickets.md", repoPath),
        readProjectFile(projectId, ".cursor/features.md", repoPath),
      ]);
      const data = buildKanbanFromMd(ticketsMd, featuresMd);
      setKanbanData(data);
      const { hasInvalidFeatures } =
        validateFeaturesTicketsCorrelation(data);
      setShowFeatureTicketWarning(hasInvalidFeatures);
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
          ".cursor/tickets.md",
          ticketsMd,
          project.repoPath
        );
        const ticket = updatedTickets.find((t) => t.id === ticketId);
        let featuresMd = await readProjectFile(
          projectId,
          ".cursor/features.md",
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
              ".cursor/features.md",
              featuresMd,
              project.repoPath
            );
          }
        }
        setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
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
        const ticket = kanbanData.tickets.find((t) => t.id === ticketId);
        const ticketsMd = serializeTicketsToMd(updatedTickets, {
          projectName: project.name,
        });
        await writeProjectFile(
          projectId,
          ".cursor/tickets.md",
          ticketsMd,
          project.repoPath
        );
        let featuresMd = await readProjectFile(
          projectId,
          ".cursor/features.md",
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
              ".cursor/features.md",
              featuresMd,
              project.repoPath
            );
          }
        }
        setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
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
          ".cursor/tickets.md",
          ticketsMd,
          project.repoPath
        );
        await writeProjectFile(
          projectId,
          ".cursor/features.md",
          featuresMd,
          project.repoPath
        );
        setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
        toast.success(`Ticket #${ticket.number} archived.`);
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
    let features = kanbanData.features.map((f) =>
      f.title.toLowerCase().trim() === featureName.toLowerCase()
        ? {
          ...f,
          ticketRefs: [...f.ticketRefs, nextNumber].sort((a, b) => a - b),
        }
        : f
    );
    const existingFeature = features.find(
      (f) => f.title.toLowerCase().trim() === featureName.toLowerCase()
    );
    if (!existingFeature) {
      features = [
        ...features,
        {
          id: `feature-${features.length + 1}-${featureName
            .slice(0, 30)
            .replace(/\s+/g, "-")}`,
          title: featureName,
          ticketRefs: [nextNumber],
          done: false,
        } as ParsedFeature,
      ];
    }
    setSaving(true);
    try {
      const ticketsMd = serializeTicketsToMd(updatedTickets, {
        projectName: project.name,
      });
      await writeProjectFile(
        projectId,
        ".cursor/tickets.md",
        ticketsMd,
        project.repoPath
      );
      const featuresMd = serializeFeaturesToMd(features);
      await writeProjectFile(
        projectId,
        ".cursor/features.md",
        featuresMd,
        project.repoPath
      );
      setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
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

  const handleMarkFeatureDone = useCallback(
    async (feature: ParsedFeature) => {
      if (!project?.repoPath || !kanbanData || feature.done) return;
      try {
        const ticketIdsToMark = feature.ticketRefs.map(
          (n) => `ticket-${n}`
        );
        const updatedTickets = markTicketsDone(
          kanbanData.tickets,
          ticketIdsToMark
        );
        const ticketsMd = serializeTicketsToMd(updatedTickets, {
          projectName: project.name,
        });
        await writeProjectFile(
          projectId,
          ".cursor/tickets.md",
          ticketsMd,
          project.repoPath
        );
        let featuresMd = await readProjectFile(
          projectId,
          ".cursor/features.md",
          project.repoPath
        );
        featuresMd = markFeatureDoneByTicketRefs(
          featuresMd,
          feature.ticketRefs
        );
        await writeProjectFile(
          projectId,
          ".cursor/features.md",
          featuresMd,
          project.repoPath
        );
        setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
        toast.success(`Feature "${feature.title}" marked done.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    },
    [project, projectId, kanbanData]
  );

  const handleAddFeature = useCallback(async () => {
    if (!project?.repoPath || !kanbanData || !addFeatureTitle.trim()) return;
    const refs = addFeatureRefs
      .split(/[\s,#]+/)
      .map((s) => parseInt(s.replace(/^#/, ""), 10))
      .filter((n) => !Number.isNaN(n) && n > 0);
    const newFeature: ParsedFeature = {
      id: `feature-${kanbanData.features.length + 1}-${addFeatureTitle
        .slice(0, 30)
        .replace(/\s+/g, "-")}`,
      title: addFeatureTitle.trim(),
      ticketRefs: refs,
      done: false,
    };
    const updatedFeatures = [...kanbanData.features, newFeature];
    setSaving(true);
    try {
      const featuresMd = serializeFeaturesToMd(updatedFeatures);
      await writeProjectFile(
        projectId,
        ".cursor/features.md",
        featuresMd,
        project.repoPath
      );
      const ticketsMd = await readProjectFile(
        projectId,
        ".cursor/tickets.md",
        project.repoPath
      );
      setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
      setAddFeatureOpen(false);
      setAddFeatureTitle("");
      setAddFeatureRefs("");
      toast.success("Feature added.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [project, projectId, kanbanData, addFeatureTitle, addFeatureRefs]);

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
      {/* ── Warning banner ── */}
      {showFeatureTicketWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertCircle className="size-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-xs text-amber-300/90">
            <span className="font-medium">Feature-Ticket Mismatch:</span>{" "}
            Some features reference tickets that do not exist or are not linked
            to this project.
          </div>
        </div>
      )}

      {/* ── No repo path ── */}
      {!project.repoPath?.trim() ? (
        <EmptyState
          icon={<TicketIcon className="size-6 text-muted-foreground" />}
          title="No repo path"
          description="Set a repo path for this project to load tickets and features from .cursor/tickets.md and .cursor/features.md."
        />
      ) : kanbanLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingState />
        </div>
      ) : kanbanError ? (
        <ErrorDisplay message={kanbanError} />
      ) : !kanbanData ? null : (
        <>
          {/* ═══════ Summary Bar ═══════ */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="flex items-center gap-4">
                <SummaryStatPill
                  label="Total"
                  value={totalTickets}
                  color="text-foreground"
                />
                <SummaryStatPill
                  label="Open"
                  value={totalTickets - doneTickets}
                  color="text-blue-400"
                />
                <SummaryStatPill
                  label="Done"
                  value={doneTickets}
                  color="text-emerald-400"
                />
                <SummaryStatPill
                  label="Features"
                  value={kanbanData.features.length}
                  color="text-violet-400"
                />
              </div>
              {/* Progress bar */}
              {totalTickets > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setAddTicketOpen(true)}
                className="gap-1.5 h-8 text-xs"
              >
                <Plus className="size-3" />
                Ticket
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddFeatureOpen(true)}
                className="gap-1.5 h-8 text-xs"
              >
                <Layers className="size-3" />
                Feature
              </Button>
            </div>
          </div>

          {/* ═══════ Kanban Board ═══════ */}
          <div data-testid="kanban-columns-grid">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const featureColorByTitle: Record<string, string> = {};
                kanbanData.features.forEach((f, i) => {
                  featureColorByTitle[f.title] = getFeaturePalette(i).ticketBorder;
                });
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
                      featureColorByTitle={featureColorByTitle}
                      projectId={projectId}
                      handleMarkDone={handleMarkDone}
                      handleRedo={handleRedo}
                      handleArchive={handleArchive}
                    />
                  );
                });
              })()}
            </div>
          </div>

          {/* ═══════ Features Section ═══════ */}
          {kanbanData.features.length > 0 && (
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
                <Layers className="size-4 text-violet-400" />
                <h3 className="text-sm font-semibold tracking-tight">
                  Features
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums ml-auto">
                  {kanbanData.features.filter((f) => f.done).length}/{kanbanData.features.length} done
                </span>
              </div>
              <div className="divide-y divide-border/20">
                {kanbanData.features.map((feature, idx) => {
                  const palette = getFeaturePalette(idx);
                  const ticketsByNumber = new Map(
                    kanbanData.tickets.map((t) => [t.number, t])
                  );
                  const totalRefs = feature.ticketRefs.length;
                  const doneRefs = feature.ticketRefs.filter(
                    (n) => ticketsByNumber.get(n)?.done
                  ).length;
                  const featureProgress =
                    totalRefs > 0
                      ? Math.round((doneRefs / totalRefs) * 100)
                      : 0;

                  return (
                    <div
                      key={feature.id}
                      className={cn(
                        "flex items-center gap-4 px-5 py-3 border-l-2 transition-colors hover:bg-muted/20",
                        palette.border
                      )}
                    >
                      {/* Status icon */}
                      <button
                        onClick={() => !feature.done && handleMarkFeatureDone(feature)}
                        className={cn(
                          "shrink-0 transition-colors",
                          feature.done
                            ? "text-emerald-400 cursor-default"
                            : "text-muted-foreground/40 hover:text-emerald-400 cursor-pointer"
                        )}
                        title={feature.done ? "Done" : "Mark as done"}
                        disabled={feature.done}
                      >
                        {feature.done ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </button>

                      {/* Feature info */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            feature.done &&
                            "line-through text-muted-foreground"
                          )}
                        >
                          {feature.title}
                        </span>
                      </div>

                      {/* Ticket refs */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {feature.ticketRefs.map((num) => {
                          const t = ticketsByNumber.get(num);
                          return (
                            <span
                              key={num}
                              className={cn(
                                "text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border",
                                t?.done
                                  ? "border-emerald-500/30 text-emerald-400/70 bg-emerald-500/5"
                                  : "border-border/40 text-muted-foreground bg-muted/20"
                              )}
                            >
                              #{num}
                            </span>
                          );
                        })}
                      </div>

                      {/* Mini progress */}
                      {totalRefs > 0 && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-12 h-1 rounded-full bg-muted/40 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${featureProgress}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-muted-foreground tabular-nums w-7 text-right">
                            {doneRefs}/{totalRefs}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════ Generate Kanban Prompt ═══════ */}
          <GenerateKanbanPromptSection
            kanbanData={kanbanData}
            kanbanPrompt={kanbanPrompt}
            kanbanPromptLoading={kanbanPromptLoading}
            generateKanbanPrompt={generateKanbanPrompt}
          />
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
              label="Feature (existing or new)"
              value={addTicketFeature}
              onChange={(e) => setAddTicketFeature(e.target.value)}
              placeholder="e.g. Testing & quality"
              list="ticket-feature-list"
            />
            <datalist id="ticket-feature-list">
              {kanbanData?.features.map((f) => (
                <option key={f.id} value={f.title} />
              ))}
            </datalist>
          </div>
        </Form>
      </SharedDialog>

      {/* ═══════ Add Feature Dialog ═══════ */}
      <SharedDialog
        isOpen={addFeatureOpen}
        title="Add feature"
        onClose={() => setAddFeatureOpen(false)}
        actions={
          <ButtonGroup alignment="right">
            <Button
              variant="outline"
              onClick={() => setAddFeatureOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFeature}
              disabled={saving || !addFeatureTitle.trim()}
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
            handleAddFeature();
          }}
        >
          <GenericInputWithLabel
            id="feature-title"
            label="Feature name"
            value={addFeatureTitle}
            onChange={(e) => setAddFeatureTitle(e.target.value)}
            placeholder="Feature name"
          />
          <GenericInputWithLabel
            id="feature-refs"
            label="Ticket refs (#1, #2, …)"
            value={addFeatureRefs}
            onChange={(e) => setAddFeatureRefs(e.target.value)}
            placeholder="#1, #2, #3"
          />
        </Form>
      </SharedDialog>
    </div>
  );
}

/* ═══════════════ Sub-components ═══════════════ */

function SummaryStatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("text-lg font-bold tabular-nums", color)}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

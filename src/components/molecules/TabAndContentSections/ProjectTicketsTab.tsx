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
import { Loader2, Plus, Ticket as TicketIcon, AlertCircle, Layers, Play, ChevronDown, Square, Eraser, Archive, Terminal } from "lucide-react";
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
import { buildKanbanContextBlock, combinePromptRecordWithKanban } from "@/lib/analysis-prompt";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { KanbanColumnCard } from "@/components/molecules/Kanban/KanbanColumnCard";
import { GenerateKanbanPromptSection } from "@/components/atoms/forms/GenerateKanbanPromptSection";
import { cn } from "@/lib/utils";
import { getClasses } from "@/components/molecules/tailwind-molecules";

const classes = getClasses("TabAndContentSections/ProjectTicketsTab.tsx");
const PRIORITIES: Array<"P0" | "P1" | "P2" | "P3"> = ["P0", "P1", "P2", "P3"];

/** Tailwind border/text classes per feature index so features and their tickets share the same color. */
const FEATURE_COLOR_CLASSES = [
  "border-blue-600 text-blue-600",
  "border-emerald-600 text-emerald-600",
  "border-amber-600 text-amber-600",
  "border-violet-600 text-violet-600",
  "border-rose-600 text-rose-600",
  "border-cyan-600 text-cyan-600",
  "border-orange-600 text-orange-600",
  "border-teal-600 text-teal-600",
] as const;

/** Full border classes for ticket cards (same order as FEATURE_COLOR_CLASSES). */
const FEATURE_TICKET_BORDER_CLASSES = [
  "border-2 border-blue-600",
  "border-2 border-emerald-600",
  "border-2 border-amber-600",
  "border-2 border-violet-600",
  "border-2 border-rose-600",
  "border-2 border-cyan-600",
  "border-2 border-orange-600",
  "border-2 border-teal-600",
] as const;

function getFeatureColorClasses(index: number): string {
  return FEATURE_COLOR_CLASSES[index % FEATURE_COLOR_CLASSES.length];
}

function getFeatureTicketBorderClasses(index: number): string {
  return FEATURE_TICKET_BORDER_CLASSES[index % FEATURE_TICKET_BORDER_CLASSES.length];
}

const isImplementAllRun = (r: { label: string }) =>
  r.label === "Implement All" || r.label.startsWith("Implement All (");

/** Grid of 3 terminal slots (last 3 Implement All runs). Full width, each slot 50vh. */
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

/** Single terminal slot: shows one run's logs, loading animation, and elapsed timer. */
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
    <Card
      title={`Terminal ${slotIndex + 1}`}
      subtitle={subtitle}
      className="overflow-hidden p-3"
    >
      <div className={cn(classes[1], "mt-3 min-h-0 flex flex-col gap-2")}>
        {running && (
          <div className={cn(classes[2], "mb-2")}>
            <Loader2 className={classes[3]} />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
        )}
        <ScrollArea className={cn(classes[4], "min-h-[120px]")}>
          {displayLogLines.length === 0 && !running && (
            <p className={cn(classes[5], "py-6 px-3 text-center text-muted-foreground")}>No output yet.</p>
          )}
          {displayLogLines.length === 0 && running && (
            <p className={cn(classes[6], "py-6 px-3 flex items-center gap-2 text-muted-foreground")}>
              <Loader2 className={classes[7]} />
              (waiting for output…)
            </p>
          )}
          {displayLogLines.map((line, i) => (
            <div key={i} className={cn(classes[8], "py-0.5 pr-2")}>
              {line}
            </div>
          ))}
        </ScrollArea>
      </div>
    </Card>
  );
}

/** Toolbar: Implement All button (print mode: selected prompt + ticket info), prompt selector, Stop / Clear / Archive. */
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
  const archiveImplementAllLogs = useRunStore((s) => s.archiveImplementAllLogs);
  const runningRuns = useRunStore((s) => s.runningRuns);
  const prompts = useRunStore((s) => s.prompts);
  const [loading, setLoading] = useState(false);
  const [addPromptOpen, setAddPromptOpen] = useState<"self" | "ai" | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const anyRunning = implementAllRuns.some((r) => r.status === "running");

  const handleImplementAll = async () => {
    const prompt = selectedPromptId != null ? prompts.find((p) => String(p.id) === selectedPromptId) : null;
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
      toast.success("Opened 3 Terminal.app windows with agent (interactive, like your MacBook).");
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className={classes[9]}>
      <Button
        variant="default"
        size="sm"
        onClick={handleOpenInSystemTerminal}
        className={cn(classes[10], "bg-teal-500 text-white hover:bg-teal-600")}
        title="Opens 3 Terminal.app windows with cd + agent. Interactive Cursor CLI (no prompt required)."
      >
        <Terminal className={classes[11]} />
        Open in system terminal
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={handleImplementAll}
        disabled={loading}
        className={cn(classes[12], "gap-2 bg-emerald-500 text-white hover:bg-emerald-600")}
        title="Runs in app; agent needs a prompt (print mode). For interactive agent use Open in system terminal."
      >
        {loading ? <Loader2 className={classes[7]} /> : <Play className={classes[11]} />}
        Implement All
      </Button>
      <Select value={selectedPromptId ?? ""} onValueChange={(v) => setSelectedPromptId(v || null)}>
        <SelectTrigger className={cn(classes[15], "w-[200px] bg-violet-500 text-white hover:bg-violet-600 border-violet-600")} aria-label="Select one prompt">
          <SelectValue placeholder="Select one prompt" />
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
          <Button variant="default" size="sm" className={cn(classes[16], "gap-1 bg-violet-500 text-white hover:bg-violet-600")}>
            Add prompt
            <ChevronDown className={classes[11]} />
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
      <Button
        variant="default"
        size="sm"
        onClick={handleStopAll}
        disabled={!anyRunning}
        className={cn(classes[18], "gap-2 bg-red-500 text-white hover:bg-red-600")}
      >
        <Square className={classes[11]} />
        Stop all
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={clearImplementAllLogs}
        className={cn(classes[20], "gap-2 bg-amber-500 text-white hover:bg-amber-600")}
      >
        <Eraser className={classes[11]} />
        Clear
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={archiveImplementAllLogs}
        className={cn(classes[22], "gap-2 bg-cyan-500 text-white hover:bg-cyan-600")}
      >
        <Archive className={classes[11]} />
        Archive
      </Button>
      <AddPromptDialog open={addPromptOpen} onOpenChange={setAddPromptOpen} />
    </div>
  );
}

/** Dialog for self-written or AI-generated prompt. Adds to run store so prompt appears in dropdown. */
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
          <Button variant="outline" onClick={() => onOpenChange(null)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !value.trim() || saving}>
            {saving ? <Loader2 className={classes[7]} /> : null}
            Save
          </Button>
        </ButtonGroup>
      }
    >
      <Form onSubmit={(e) => { e.preventDefault(); if (title.trim() && value.trim()) handleSave(); }}>
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
          placeholder={isSelf ? "Enter your prompt…" : "Generate or paste prompt…"}
          rows={5}
          className={classes[25]}
        />
        {isAI && (
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className={classes[7]} /> : null}
            Generate
          </Button>
        )}
      </Form>
    </SharedDialog>
  );
}

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
  const [showFeatureTicketWarning, setShowFeatureTicketWarning] = useState(false);
  const [addTicketOpen, setAddTicketOpen] = useState(false);
  const [addFeatureOpen, setAddFeatureOpen] = useState(false);
  const [addTicketTitle, setAddTicketTitle] = useState("");
  const [addTicketDesc, setAddTicketDesc] = useState("");
  const [addTicketPriority, setAddTicketPriority] = useState<"P0" | "P1" | "P2" | "P3">("P1");
  const [addTicketFeature, setAddTicketFeature] = useState("");
  const [addFeatureTitle, setAddFeatureTitle] = useState("");
  const [addFeatureRefs, setAddFeatureRefs] = useState("");
  const [saving, setSaving] = useState(false);

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
      const { hasInvalidFeatures } = validateFeaturesTicketsCorrelation(data);
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

  const handleMarkDone = useCallback(
    async (ticketId: string) => {
      if (!project?.repoPath || !kanbanData) return;
      try {
        const updatedTickets = markTicketsDone(kanbanData.tickets, [ticketId]);
        const ticketsMd = serializeTicketsToMd(updatedTickets, { projectName: project.name });
        await writeProjectFile(projectId, ".cursor/tickets.md", ticketsMd, project.repoPath);
        const ticket = updatedTickets.find((t) => t.id === ticketId);
        let featuresMd = await readProjectFile(projectId, ".cursor/features.md", project.repoPath);
        if (ticket && ticket.done) {
          const feature = kanbanData.features.find((f) =>
            f.ticketRefs.includes(ticket.number)
          );
          if (feature?.ticketRefs.every((n) => updatedTickets.find((t) => t.number === n)?.done)) {
            featuresMd = markFeatureDoneByTicketRefs(featuresMd, feature.ticketRefs);
            await writeProjectFile(projectId, ".cursor/features.md", featuresMd, project.repoPath);
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
        const updatedTickets = markTicketsNotDone(kanbanData.tickets, [ticketId]);
        const ticket = kanbanData.tickets.find((t) => t.id === ticketId);
        const ticketsMd = serializeTicketsToMd(updatedTickets, { projectName: project.name });
        await writeProjectFile(projectId, ".cursor/tickets.md", ticketsMd, project.repoPath);
        let featuresMd = await readProjectFile(projectId, ".cursor/features.md", project.repoPath);
        if (ticket) {
          const feature = kanbanData.features.find((f) => f.ticketRefs.includes(ticket.number));
          if (feature && !feature.ticketRefs.some((n) => updatedTickets.find((t) => t.number === n)?.done)) {
            featuresMd = markFeatureNotDoneByTicketRefs(featuresMd, feature.ticketRefs);
            await writeProjectFile(projectId, ".cursor/features.md", featuresMd, project.repoPath);
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
        const updatedTickets = kanbanData.tickets.filter((t) => t.id !== ticketId);
        const features = kanbanData.features.map((f) =>
          f.ticketRefs.includes(ticket.number)
            ? { ...f, ticketRefs: f.ticketRefs.filter((n) => n !== ticket.number) }
            : f
        );
        const ticketsMd = serializeTicketsToMd(updatedTickets, { projectName: project.name });
        const featuresMd = serializeFeaturesToMd(features);
        await writeProjectFile(projectId, ".cursor/tickets.md", ticketsMd, project.repoPath);
        await writeProjectFile(projectId, ".cursor/features.md", featuresMd, project.repoPath);
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
        ? { ...f, ticketRefs: [...f.ticketRefs, nextNumber].sort((a, b) => a - b) }
        : f
    );
    const existingFeature = features.find(
      (f) => f.title.toLowerCase().trim() === featureName.toLowerCase()
    );
    if (!existingFeature) {
      features = [
        ...features,
        {
          id: `feature-${features.length + 1}-${featureName.slice(0, 30).replace(/\s+/g, "-")}`,
          title: featureName,
          ticketRefs: [nextNumber],
          done: false,
        } as ParsedFeature,
      ];
    }
    setSaving(true);
    try {
      const ticketsMd = serializeTicketsToMd(updatedTickets, { projectName: project.name });
      await writeProjectFile(projectId, ".cursor/tickets.md", ticketsMd, project.repoPath);
      const featuresMd = serializeFeaturesToMd(features);
      await writeProjectFile(projectId, ".cursor/features.md", featuresMd, project.repoPath);
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
        const ticketIdsToMark = feature.ticketRefs.map((n) => `ticket-${n}`);
        const updatedTickets = markTicketsDone(kanbanData.tickets, ticketIdsToMark);
        const ticketsMd = serializeTicketsToMd(updatedTickets, { projectName: project.name });
        await writeProjectFile(projectId, ".cursor/tickets.md", ticketsMd, project.repoPath);
        let featuresMd = await readProjectFile(projectId, ".cursor/features.md", project.repoPath);
        featuresMd = markFeatureDoneByTicketRefs(featuresMd, feature.ticketRefs);
        await writeProjectFile(projectId, ".cursor/features.md", featuresMd, project.repoPath);
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
      id: `feature-${kanbanData.features.length + 1}-${addFeatureTitle.slice(0, 30).replace(/\s+/g, "-")}`,
      title: addFeatureTitle.trim(),
      ticketRefs: refs,
      done: false,
    };
    const updatedFeatures = [...kanbanData.features, newFeature];
    setSaving(true);
    try {
      const featuresMd = serializeFeaturesToMd(updatedFeatures);
      await writeProjectFile(projectId, ".cursor/features.md", featuresMd, project.repoPath);
      const ticketsMd = await readProjectFile(projectId, ".cursor/tickets.md", project.repoPath);
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

  return (
    <div className={cn(classes[27], "w-full shrink-0 p-4 md:p-6")}>
      <ProjectCategoryHeader
        title="Kanban"
        icon={<TicketIcon className={classes[28]} />}
        project={project}
      />

      {showFeatureTicketWarning && (
        <ErrorDisplay
          title="Feature-Ticket Mismatch"
          message="Some features reference tickets that do not exist or are not linked to this project. Consider editing your features."
          icon={<AlertCircle className={classes[29]} />}
        />
      )}

      {!project.repoPath?.trim() ? (
        <EmptyState
          icon={<TicketIcon className={classes[28]} />}
          title="No repo path"
          description="Set a repo path for this project to load tickets and features from .cursor/tickets.md and .cursor/features.md."
        />
      ) : kanbanLoading ? (
        <div className={classes[31]}>
          <LoadingState />
        </div>
      ) : kanbanError ? (
        <ErrorDisplay message={kanbanError} />
      ) : !kanbanData ? null : (
        <>
          <div className={cn(classes[9], "mb-4")}>
            <ButtonGroup alignment="left">
              <Button
                variant="default"
                size="sm"
                onClick={() => setAddTicketOpen(true)}
                className={classes[12]}
              >
                <Plus className={classes[11]} />
                Add ticket
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setAddFeatureOpen(true)}
                className={classes[16]}
              >
                <Layers className={classes[11]} />
                Add feature
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex w-full flex-col gap-4 shrink-0">
            {/* 1. Kanban */}
            <div className="flex min-h-0 min-w-0 flex-col rounded-lg bg-card p-4 shadow-sm overflow-auto">
              <h3 className={classes[33]}>
                <TicketIcon className={classes[11]} />
                Kanban
              </h3>
              <div className={classes[52]} data-testid="kanban-columns-grid">
                {(() => {
                  const featureColorByTitle: Record<string, string> = {};
                  kanbanData.features.forEach((f, i) => {
                    featureColorByTitle[f.title] = getFeatureTicketBorderClasses(i);
                  });
                  const kanbanColumnOrder = ["backlog", "in_progress", "done"] as const;
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

            {/* 3. Features */}
            <div className="relative z-10 flex min-h-0 min-w-0 flex-col rounded-lg border border-border bg-card p-3 shadow-sm overflow-auto max-h-[50vh]">
              <h3 className="text-xs font-medium flex items-center gap-2 shrink-0">
                <Layers className={classes[11]} />
                Features
              </h3>
              {kanbanData.features.length > 0 ? (() => {
                const ticketsByNumber = new Map(kanbanData.tickets.map((t) => [t.number, t]));
                const inProgress: Array<{ feature: ParsedFeature; index: number }> = [];
                const done: Array<{ feature: ParsedFeature; index: number; doneRefs: number[] }> = [];
                kanbanData.features.forEach((f, idx) => {
                  const inProgressRefs = f.ticketRefs.filter((num) => {
                    const t = ticketsByNumber.get(num);
                    return t && !t.done;
                  });
                  const doneRefs = f.ticketRefs.filter((num) => {
                    const t = ticketsByNumber.get(num);
                    return t && t.done;
                  });
                  if (inProgressRefs.length > 0) inProgress.push({ feature: f, index: idx });
                  if (doneRefs.length > 0) done.push({ feature: f, index: idx, doneRefs });
                });
                return (
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:gap-3 min-h-0">
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In progress</h4>
                        <ul className="space-y-1.5">
                          {inProgress.map(({ feature: f, index: idx }) => {
                            const colorClasses = getFeatureColorClasses(idx);
                            return (
                              <li key={`in-${f.id}`} className="flex">
                                <span className={cn("flex items-center gap-2 rounded border bg-background px-3 py-1.5 text-xs min-h-[2.5rem] w-full max-w-[240px]", colorClasses)}>
                                  <span className="truncate min-w-0 flex-1">{f.title}</span>
                                  <span className="opacity-80 shrink-0">— {f.ticketRefs.map((n) => `#${n}`).join(", ")}</span>
                                </span>
                              </li>
                            );
                          })}
                          {inProgress.length === 0 && (
                            <li className="text-xs text-muted-foreground">None</li>
                          )}
                        </ul>
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Done</h4>
                        <ul className="space-y-1.5">
                          {done.map(({ feature: f, index: idx, doneRefs }) => {
                            const colorClasses = getFeatureColorClasses(idx);
                            return (
                              <li key={`done-${f.id}`} className="flex">
                                <span className={cn("flex items-center gap-2 rounded border bg-muted/50 line-through opacity-90 px-3 py-1.5 text-xs min-h-[2.5rem] w-full max-w-[240px]", colorClasses)}>
                                  <span className="truncate min-w-0 flex-1">{f.title}</span>
                                  <span className="opacity-80 shrink-0">— {doneRefs.map((n) => `#${n}`).join(", ")}</span>
                                </span>
                              </li>
                            );
                          })}
                          {done.length === 0 && (
                            <li className="text-xs text-muted-foreground">None</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <p className="text-xs text-muted-foreground">No features yet.</p>
              )}
            </div>

            {/* 4. Tickets (at bottom) */}
            <div className="relative z-10 flex min-h-0 min-w-0 flex-col rounded-lg border border-border bg-card p-3 shadow-sm overflow-auto max-h-[50vh]">
              <h3 className="text-xs font-medium flex items-center gap-2 shrink-0">
                <TicketIcon className={classes[11]} />
                Tickets
              </h3>
              {kanbanData.tickets.length === 0 ? (
                <EmptyState
                  icon={<TicketIcon className={classes[28]} />}
                  title="No tickets yet"
                  description="Add a ticket above or add items to .cursor/tickets.md and .cursor/features.md in your repo."
                  action={
                    <Button variant="default" size="sm" onClick={() => setAddTicketOpen(true)} className={classes[10]}>
                      <Plus className={classes[11]} />
                      Add ticket
                    </Button>
                  }
                />
              ) : (
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:gap-3 min-h-0 overflow-auto">
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In progress</h4>
                      <ul className="space-y-1.5">
                        {kanbanData.tickets
                          .filter((t) => !t.done)
                          .map((t) => {
                            const featureIdx = kanbanData.features.findIndex((f) => f.title === t.featureName);
                            const colorClasses = featureIdx >= 0 ? getFeatureColorClasses(featureIdx) : "";
                            return (
                              <li key={t.id} className="flex">
                                <span className={cn("flex items-center gap-2 rounded border bg-background px-3 py-1.5 text-xs min-h-[2.5rem] w-full max-w-[280px]", colorClasses)}>
                                  <span className="truncate min-w-0 flex-1">#{t.number} — {t.title}</span>
                                  {t.featureName ? (
                                    <span className="opacity-80 shrink-0">· {t.featureName}</span>
                                  ) : null}
                                </span>
                              </li>
                            );
                          })}
                        {kanbanData.tickets.filter((t) => !t.done).length === 0 && (
                          <li className="text-xs text-muted-foreground">None</li>
                        )}
                      </ul>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Done</h4>
                      <ul className="space-y-1.5">
                        {kanbanData.tickets
                          .filter((t) => t.done)
                          .map((t) => {
                            const featureIdx = kanbanData.features.findIndex((f) => f.title === t.featureName);
                            const colorClasses = featureIdx >= 0 ? getFeatureColorClasses(featureIdx) : "";
                            return (
                              <li key={t.id} className="flex">
                                <span className={cn("flex items-center gap-2 rounded border bg-muted/50 line-through opacity-90 px-3 py-1.5 text-xs min-h-[2.5rem] w-full max-w-[280px]", colorClasses)}>
                                  <span className="truncate min-w-0 flex-1">#{t.number} — {t.title}</span>
                                  {t.featureName ? (
                                    <span className="opacity-80 shrink-0">· {t.featureName}</span>
                                  ) : null}
                                </span>
                              </li>
                            );
                          })}
                        {kanbanData.tickets.filter((t) => t.done).length === 0 && (
                          <li className="text-xs text-muted-foreground">None</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {Object.keys(kanbanData.columns).every((key) => kanbanData.columns[key].items.length === 0) && (
            <EmptyState
              icon={<TicketIcon className={classes[28]} />}
              title="No tickets yet"
              description="Add a ticket above or add items to .cursor/tickets.md and .cursor/features.md in your repo."
              action={
                <Button variant="outline" size="sm" onClick={() => setAddTicketOpen(true)} className={classes[10]}>
                  <Plus className={classes[11]} />
                  Add ticket
                </Button>
              }
            />
          )}
        </>
      )}

      <SharedDialog
        isOpen={addTicketOpen}
        title="Add ticket"
        onClose={() => setAddTicketOpen(false)}
        actions={
          <ButtonGroup alignment="right">
            <Button variant="outline" onClick={() => setAddTicketOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTicket} disabled={saving || !addTicketTitle.trim()}>
              {saving ? <Loader2 className={classes[7]} /> : null}
              Add
            </Button>
          </ButtonGroup>
        }
      >
        <Form onSubmit={(e) => { e.preventDefault(); handleAddTicket(); }}>
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
              onValueChange={(v) => setAddTicketPriority(v as "P0" | "P1" | "P2" | "P3")}
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
          <div className={classes[57]}>
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

      <SharedDialog
        isOpen={addFeatureOpen}
        title="Add feature"
        onClose={() => setAddFeatureOpen(false)}
        actions={
          <ButtonGroup alignment="right">
            <Button variant="outline" onClick={() => setAddFeatureOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFeature} disabled={saving || !addFeatureTitle.trim()}>
              {saving ? <Loader2 className={classes[7]} /> : null}
              Add
            </Button>
          </ButtonGroup>
        }
      >
        <Form onSubmit={(e) => { e.preventDefault(); handleAddFeature(); }}>
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

      <GenerateKanbanPromptSection
        kanbanData={kanbanData}
        kanbanPrompt={kanbanPrompt}
        kanbanPromptLoading={kanbanPromptLoading}
        generateKanbanPrompt={generateKanbanPrompt}
      />
    </div>
  );
}

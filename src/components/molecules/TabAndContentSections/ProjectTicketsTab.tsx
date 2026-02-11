"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { KanbanColumnCard } from "@/components/molecules/Kanban/KanbanColumnCard";
import { GenerateKanbanPromptSection } from "@/components/atoms/forms/GenerateKanbanPromptSection";

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
function ImplementAllTerminalsGrid() {
  const runningRuns = useRunStore((s) => s.runningRuns);
  const implementAllRuns = runningRuns.filter(isImplementAllRun);
  const runsForSlots = [
    implementAllRuns[implementAllRuns.length - 3] ?? null,
    implementAllRuns[implementAllRuns.length - 2] ?? null,
    implementAllRuns[implementAllRuns.length - 1] ?? null,
  ];
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
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
    <Card title={`Terminal ${slotIndex + 1}`} subtitle={subtitle}>
      <div className="relative">
        {running && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded bg-muted/80 px-2 py-1 font-mono text-sm tabular-nums">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
        )}
        <ScrollArea className="h-[50vh] min-h-[200px] rounded border bg-muted/30 p-3 font-mono text-sm">
          {displayLogLines.length === 0 && !running && (
            <p className="text-muted-foreground text-sm">No output yet.</p>
          )}
          {displayLogLines.length === 0 && running && (
            <p className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              (waiting for output…)
            </p>
          )}
          {displayLogLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line}
            </div>
          ))}
        </ScrollArea>
      </div>
    </Card>
  );
}

/** Toolbar: Implement All button (print mode: selected prompt + ticket info), prompt selector, Stop / Clear / Archive. */
function ImplementAllToolbar({
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
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={handleOpenInSystemTerminal}
        className="gap-2"
        title="Opens 3 Terminal.app windows with cd + agent. Interactive Cursor CLI (no prompt required)."
      >
        <Terminal className="h-4 w-4" />
        Open in system terminal
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={handleImplementAll}
        disabled={loading}
        className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
        title="Runs in app; agent needs a prompt (print mode). For interactive agent use Open in system terminal."
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Implement All
      </Button>
      <Select value={selectedPromptId ?? ""} onValueChange={(v) => setSelectedPromptId(v || null)}>
        <SelectTrigger className="w-[200px] bg-violet-500 text-white hover:bg-violet-600" aria-label="Select one prompt">
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
          <Button variant="default" size="sm" className="gap-1 bg-violet-500 text-white hover:bg-violet-600">
            Add prompt
            <ChevronDown className="h-4 w-4" />
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
        className="gap-2 bg-red-500 text-white hover:bg-red-600"
      >
        <Square className="h-4 w-4" />
        Stop all
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={clearImplementAllLogs}
        className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
      >
        <Eraser className="h-4 w-4" />
        Clear
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={archiveImplementAllLogs}
        className="gap-2 bg-cyan-500 text-white hover:bg-cyan-600"
      >
        <Archive className="h-4 w-4" />
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

  return (
    <Dialog open={open != null} onOpenChange={(o) => onOpenChange(o ? open : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAI ? "AI generation prompt" : "Self-written prompt"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="add-prompt-title">Title</Label>
            <Input
              id="add-prompt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Prompt title (shown in dropdown)"
            />
          </div>
          <div className="grid gap-2">
            <Label>Prompt</Label>
            <Textarea
              className="min-h-[120px] font-mono text-sm"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isSelf ? "Enter your prompt…" : "Generate or paste prompt…"}
            />
          </div>
          {isAI && (
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Generate
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !value.trim() || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <div className="mt-0 flex min-h-0 flex-1 flex-col gap-6">
      <ProjectCategoryHeader
        title="Tickets"
        icon={<TicketIcon className="h-6 w-6 text-warning/90" />}
        project={project}
      />

      {showFeatureTicketWarning && (
        <ErrorDisplay
          title="Feature-Ticket Mismatch"
          message="Some features reference tickets that do not exist or are not linked to this project. Consider editing your features."
          icon={<AlertCircle className="h-4 w-4 text-destructive/90" />}
        />
      )}

      {!project.repoPath?.trim() ? (
        <EmptyState
          icon={<TicketIcon className="h-6 w-6 text-warning/90" />}
          title="No repo path"
          description="Set a repo path for this project to load tickets and features from .cursor/tickets.md and .cursor/features.md."
        />
      ) : kanbanLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : kanbanError ? (
        <ErrorDisplay message={kanbanError} />
      ) : !kanbanData ? null : (
        <>
          {kanbanData.features.length > 0 && (() => {
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
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Features
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In progress</h4>
                    <ul className="flex flex-wrap gap-2">
                      {inProgress.map(({ feature: f, index: idx }) => {
                        const colorClasses = getFeatureColorClasses(idx);
                        return (
                          <li key={`in-${f.id}`}>
                            <span
                              className={`inline-flex items-center gap-2 rounded-md border-2 bg-background px-2 py-1 text-xs ${colorClasses}`}
                            >
                              <span>{f.title}</span>
                              <span className="opacity-80">
                                — {f.ticketRefs.map((n) => `#${n}`).join(", ")}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                      {inProgress.length === 0 && (
                        <li className="text-xs text-muted-foreground">None</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Done</h4>
                    <ul className="flex flex-wrap gap-2">
                      {done.map(({ feature: f, index: idx, doneRefs }) => {
                        const colorClasses = getFeatureColorClasses(idx);
                        return (
                          <li key={`done-${f.id}`}>
                            <span
                              className={`inline-flex items-center gap-2 rounded-md border-2 bg-muted/50 line-through opacity-90 px-2 py-1 text-xs ${colorClasses}`}
                            >
                              <span>{f.title}</span>
                              <span className="opacity-80">
                                — {doneRefs.map((n) => `#${n}`).join(", ")}
                              </span>
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
          })()}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddTicketOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add ticket
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddFeatureOpen(true)}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              Add feature
            </Button>
            {isTauri && project.repoPath?.trim() && (
              <ImplementAllToolbar projectPath={project.repoPath.trim()} kanbanData={kanbanData} />
            )}
          </div>
          {isTauri && <ImplementAllTerminalsGrid />}
          <div className="flex min-h-0 w-full flex-1 flex-col rounded-lg p-4">
            <div className="grid h-full min-h-0 w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="kanban-columns-grid">
              {(() => {
                const featureColorByTitle: Record<string, string> = {};
                kanbanData.features.forEach((f, i) => {
                  featureColorByTitle[f.title] = getFeatureTicketBorderClasses(i);
                });
                return Object.entries(kanbanData.columns).map(([columnId, column]) => (
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
                ));
              })()}
            </div>
          </div>
          {Object.keys(kanbanData.columns).every((key) => kanbanData.columns[key].items.length === 0) && (
            <EmptyState
              icon={<TicketIcon className="h-6 w-6 text-warning/90" />}
              title="No tickets yet"
              description="Add a ticket above or add items to .cursor/tickets.md and .cursor/features.md in your repo."
              action={
                <Button variant="outline" size="sm" onClick={() => setAddTicketOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add ticket
                </Button>
              }
            />
          )}
        </>
      )}

      <Dialog open={addTicketOpen} onOpenChange={setAddTicketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="ticket-title">Title</Label>
              <Input
                id="ticket-title"
                value={addTicketTitle}
                onChange={(e) => setAddTicketTitle(e.target.value)}
                placeholder="Ticket title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticket-desc">Description (optional)</Label>
              <Input
                id="ticket-desc"
                value={addTicketDesc}
                onChange={(e) => setAddTicketDesc(e.target.value)}
                placeholder="Short description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={addTicketPriority}
                onValueChange={(v) => setAddTicketPriority(v as "P0" | "P1" | "P2" | "P3")}
              >
                <SelectTrigger>
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticket-feature">Feature (existing or new)</Label>
              <Input
                id="ticket-feature"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTicketOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTicket} disabled={saving || !addTicketTitle.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addFeatureOpen} onOpenChange={setAddFeatureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add feature</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="feature-title">Feature name</Label>
              <Input
                id="feature-title"
                value={addFeatureTitle}
                onChange={(e) => setAddFeatureTitle(e.target.value)}
                placeholder="Feature name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feature-refs">Ticket refs (#1, #2, …)</Label>
              <Input
                id="feature-refs"
                value={addFeatureRefs}
                onChange={(e) => setAddFeatureRefs(e.target.value)}
                placeholder="#1, #2, #3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFeatureOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFeature} disabled={saving || !addFeatureTitle.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenerateKanbanPromptSection
        kanbanData={kanbanData}
        kanbanPrompt={kanbanPrompt}
        kanbanPromptLoading={kanbanPromptLoading}
        generateKanbanPrompt={generateKanbanPrompt}
      />
    </div>
  );
}

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
  Layers,
  Play,
  ChevronDown,
  Square,
  Eraser,
  Archive,
  Terminal,
  CheckCircle2,
  Circle,
  Trash,
  MoreVertical,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { readProjectFile, readProjectFileOrEmpty, writeProjectFile } from "@/lib/api-projects";
import { isTauri, invoke } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
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
import { isImplementAllRun, formatElapsed } from "@/lib/run-helpers";
import { AddPromptDialog } from "@/components/molecules/FormsAndDialogs/AddPromptDialog";
import { SummaryStatPill } from "@/components/shared/DisplayPrimitives";
import { TerminalSlot } from "@/components/shared/TerminalSlot";

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
  /* Planner Manager: AI-generated ticket from prompt */
  const [plannerManagerMode, setPlannerManagerMode] = useState<"ticket" | "feature">("ticket");
  const [plannerPromptInput, setPlannerPromptInput] = useState("");
  const [plannerPromptTextarea, setPlannerPromptTextarea] = useState("");
  const [generatedTicket, setGeneratedTicket] = useState<{
    title: string;
    description?: string;
    priority: "P0" | "P1" | "P2" | "P3";
    featureName: string;
  } | null>(null);
  const [generatingTicket, setGeneratingTicket] = useState(false);

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
        readProjectFileOrEmpty(projectId, ".cursor/planner/tickets.md", repoPath),
        readProjectFileOrEmpty(projectId, ".cursor/planner/features.md", repoPath),
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
        ".cursor/planner/tickets.md",
        ticketsMd,
        project.repoPath
      );
      const featuresMd = serializeFeaturesToMd(features);
      await writeProjectFile(
        projectId,
        ".cursor/planner/features.md",
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
          ".cursor/planner/tickets.md",
          ticketsMd,
          project.repoPath
        );
        let featuresMd = await readProjectFile(
          projectId,
          ".cursor/planner/features.md",
          project.repoPath
        );
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
        ".cursor/planner/features.md",
        featuresMd,
        project.repoPath
      );
      const ticketsMd = await readProjectFile(
        projectId,
        ".cursor/planner/tickets.md",
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
      const featuresMd = await readProjectFile(
        projectId,
        ".cursor/planner/features.md",
        project.repoPath
      );
      setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
      toast.success("All tickets removed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [project, projectId, kanbanData]);

  const handleRemoveAllFeatures = useCallback(async () => {
    if (!project?.repoPath || !kanbanData) return;
    if (
      !confirm(
        "Are you sure you want to remove ALL features? This cannot be undone."
      )
    )
      return;

    setSaving(true);
    try {
      const featuresMd = serializeFeaturesToMd([]);
      await writeProjectFile(
        projectId,
        ".cursor/planner/features.md",
        featuresMd,
        project.repoPath
      );
      const ticketsMd = await readProjectFile(
        projectId,
        ".cursor/planner/tickets.md",
        project.repoPath
      );
      setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
      toast.success("All features removed.");
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
    try {
      const existingFeatures = kanbanData?.features.map((f) => f.title) ?? [];
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
  }, [plannerPromptInput, plannerPromptTextarea, kanbanData?.features]);

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
    };
    const updatedTickets = [newTicket, ...kanbanData.tickets];
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
      await writeProjectFile(projectId, ".cursor/planner/tickets.md", ticketsMd, project.repoPath);
      const featuresMd = serializeFeaturesToMd(features);
      await writeProjectFile(projectId, ".cursor/planner/features.md", featuresMd, project.repoPath);
      setKanbanData(buildKanbanFromMd(ticketsMd, featuresMd));
      setGeneratedTicket(null);
      setPlannerPromptInput("");
      setPlannerPromptTextarea("");
      toast.success(`Ticket #${nextNumber} added to backlog.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [project, projectId, kanbanData, generatedTicket]);

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
          description="Set a repo path for this project to load tickets and features from .cursor/planner/tickets.md and .cursor/planner/features.md."
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
                    Manage tickets, features, and progress.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <div className="flex flex-col gap-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 backdrop-blur-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 text-violet-500 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers className="size-8" />
                      </div>
                      <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                        Features
                      </span>
                      <span className="text-2xl font-bold text-violet-500 tabular-nums">
                        {kanbanData.features.length}
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
                  {/* Mode badges: Ticket | Feature (only Ticket implemented) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlannerManagerMode("ticket")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        plannerManagerMode === "ticket"
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      )}
                      tabIndex={0}
                    >
                      <TicketIcon className="size-3.5" />
                      Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlannerManagerMode("feature")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        plannerManagerMode === "feature"
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      )}
                      tabIndex={0}
                    >
                      <Layers className="size-3.5" />
                      Feature
                    </button>
                  </div>

                  {/* Input + textarea + magic stick (tab order: input → textarea → button) */}
                  {plannerManagerMode === "ticket" && (
                    <>
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

                      {/* Confirm generated ticket → add to backlog at top */}
                      {generatedTicket && (
                        <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Generated ticket — confirm to add to top of backlog</p>
                          <div className="text-sm space-y-1">
                            <p><span className="font-medium">Title:</span> {generatedTicket.title}</p>
                            {generatedTicket.description && (
                              <p><span className="font-medium">Description:</span> {generatedTicket.description}</p>
                            )}
                            <p><span className="font-medium">Priority:</span> {generatedTicket.priority} · <span className="font-medium">Feature:</span> {generatedTicket.featureName}</p>
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
                    </>
                  )}
                  {plannerManagerMode === "feature" && (
                    <p className="text-sm text-muted-foreground">Feature from prompt coming soon. Use Ticket for now.</p>
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
                        <DropdownMenuItem
                          onClick={handleRemoveAllFeatures}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="size-4 mr-2" />
                          Remove all features
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ═══════ Features Section ═══════ */}
          {kanbanData.features.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Layers className="size-5 text-violet-500" />
                <h3 className="text-lg font-semibold tracking-tight">Active Features</h3>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {kanbanData.features.filter((f) => f.done).length}/{kanbanData.features.length} Done
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                        "group relative flex flex-col gap-3 rounded-xl border bg-card/40 p-5 transition-all duration-300 hover:shadow-lg hover:bg-card/60 backdrop-blur-sm",
                        feature.done ? "opacity-60 grayscale" : "",
                        palette.border.replace('border-l-2', 'border-l-4') // robust left border
                      )}
                    >
                      {/* Title & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <h4 className={cn("font-semibold text-sm leading-tight", feature.done && "line-through")}>
                          {feature.title}
                        </h4>
                        <button
                          onClick={() => !feature.done && handleMarkFeatureDone(feature)}
                          className={cn(
                            "shrink-0 transition-all duration-200",
                            feature.done
                              ? "text-emerald-500 cursor-default"
                              : "text-muted-foreground/30 hover:text-emerald-500 hover:scale-110"
                          )}
                          disabled={feature.done}
                        >
                          {feature.done ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <Circle className="size-5" />
                          )}
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {totalRefs > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{featureProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-500", feature.done ? "bg-emerald-500" : palette.bg.replace('/10', ''))}
                              style={{ width: `${featureProgress}%`, backgroundColor: feature.done ? undefined : 'currentColor' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tickets Pills */}
                      <div className="mt-auto pt-2 flex flex-wrap gap-1.5">
                        {feature.ticketRefs.map((num) => {
                          const t = ticketsByNumber.get(num);
                          const isTicketDone = t?.done;
                          return (
                            <span
                              key={num}
                              className={cn(
                                "text-[10px] tabular-nums px-1.5 py-0.5 rounded border transition-colors",
                                isTicketDone
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 decoration-emerald-500/30 line-through"
                                  : "bg-muted/30 border-border/40 text-muted-foreground"
                              )}
                            >
                              #{num}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

/* SummaryStatPill is now imported from @/components/shared/DisplayPrimitives */

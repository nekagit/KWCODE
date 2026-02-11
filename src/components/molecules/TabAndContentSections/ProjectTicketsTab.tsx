"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, Ticket as TicketIcon, AlertCircle, Layers } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { readProjectFile, writeProjectFile } from "@/lib/api-projects";
import {
  buildKanbanFromMd,
  markTicketsDone,
  validateFeaturesTicketsCorrelation,
  serializeTicketsToMd,
  serializeFeaturesToMd,
  markFeatureDoneByTicketRefs,
  type TodosKanbanData,
  type ParsedTicket,
  type ParsedFeature,
} from "@/lib/todos-kanban";
import { buildKanbanContextBlock } from "@/lib/analysis-prompt";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectTicketsKanbanColumn } from "@/components/organisms/ProjectTicketsKanbanColumn";
import { GenerateKanbanPromptSection } from "@/components/atoms/forms/GenerateKanbanPromptSection";

const PRIORITIES: Array<"P0" | "P1" | "P2" | "P3"> = ["P0", "P1", "P2", "P3"];

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
    <div className="mt-4 space-y-6">
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
          {kanbanData.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Features ({kanbanData.features.length})
              </h3>
              <ul className="flex flex-wrap gap-2 items-center">
                {kanbanData.features.map((f) => (
                  <li key={f.id} className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${
                        f.done ? "bg-muted line-through opacity-80" : "bg-background"
                      }`}
                    >
                      <span>{f.done ? "[x]" : "[ ]"}</span>
                      <span>{f.title}</span>
                      <span className="text-muted-foreground">
                        — {f.ticketRefs.map((n) => `#${n}`).join(", ")}
                      </span>
                    </span>
                    {!f.done && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleMarkFeatureDone(f)}
                      >
                        Mark done
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(kanbanData.columns).map(([columnId, column]) => (
              <ProjectTicketsKanbanColumn
                key={columnId}
                columnId={columnId}
                column={column}
                kanbanFeatures={kanbanData.features}
                projectId={projectId}
                handleMarkDone={handleMarkDone}
              />
            ))}
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

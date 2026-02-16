"use client";

import { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { EmptyState } from "@/components/shared/EmptyState";
import { Flag, Loader2, FileText, Plus, Pencil, Trash2, ListTodo } from "lucide-react";
import { ConvertToTicketsDialog } from "@/components/molecules/FormsAndDialogs/ConvertToTicketsDialog";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import type { MilestoneRecord } from "@/types/milestone";
import { cn } from "@/lib/utils";
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { GenericInputWithLabel } from "@/components/shared/GenericInputWithLabel";
import { GenericTextareaWithLabel } from "@/components/shared/GenericTextareaWithLabel";

const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 last:[&_p]:mb-0 [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1";

interface ProjectMilestonesTabProps {
  project: Project;
  projectId: string;
  onTicketAdded?: () => void;
}

export function ProjectMilestonesTab({
  project,
  projectId,
  onTicketAdded,
}: ProjectMilestonesTabProps) {
  const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [addContent, setAddContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [convertTicketsOpen, setConvertTicketsOpen] = useState(false);

  const loadMilestones = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/data/projects/${projectId}/milestones`);
      if (!res.ok) throw new Error("Failed to load milestones");
      const list = (await res.json()) as MilestoneRecord[];
      setMilestones(list);
      if (list.length > 0 && selectedMilestoneId === null) setSelectedMilestoneId(list[0].id);
    } catch {
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedMilestoneId]);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const handleAddMilestone = useCallback(async () => {
    const name = addName.trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/data/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: addSlug.trim() || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          content: addContent.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create milestone");
      }
      const created = (await res.json()) as MilestoneRecord;
      setMilestones((prev) => [...prev, created]);
      setSelectedMilestoneId(created.id);
      setAddOpen(false);
      setAddName("");
      setAddSlug("");
      setAddContent("");
      toast.success("Milestone created.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [projectId, addName, addSlug, addContent]);

  const openEdit = useCallback((m: MilestoneRecord) => {
    setSelectedMilestoneId(m.id);
    setEditName(m.name);
    setEditSlug(m.slug);
    setEditContent(m.content ?? "");
    setEditOpen(true);
  }, []);

  const handleUpdateMilestone = useCallback(async () => {
    if (selectedMilestoneId == null) return;
    setEditSaving(true);
    try {
      const res = await fetch(
        `/api/data/projects/${projectId}/milestones/${selectedMilestoneId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName.trim(),
            slug: editSlug.trim() || undefined,
            content: editContent.trim() || undefined,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update milestone");
      }
      await loadMilestones();
      setEditOpen(false);
      toast.success("Milestone updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setEditSaving(false);
    }
  }, [projectId, selectedMilestoneId, editName, editSlug, editContent, loadMilestones]);

  const handleDeleteMilestone = useCallback(async () => {
    if (selectedMilestoneId == null) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(
        `/api/data/projects/${projectId}/milestones/${selectedMilestoneId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete milestone");
      }
      setEditOpen(false);
      setSelectedMilestoneId(null);
      await loadMilestones();
      toast.success("Milestone removed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleteSaving(false);
    }
  }, [projectId, selectedMilestoneId, milestones, loadMilestones]);

  const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading milestones…</span>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="w-full flex flex-col gap-4">
        <EmptyState
          icon={<Flag className="size-6 text-muted-foreground" />}
          title="No milestones yet"
          description="Milestones are DB entries with an id so you can reference them from tickets and implementation log. Create one to assign to tickets."
          action={
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="size-4" />
              Add milestone
            </Button>
          }
        />
        <SharedDialog
          isOpen={addOpen}
          title="Add milestone"
          onClose={() => setAddOpen(false)}
          actions={
            <ButtonGroup alignment="right">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMilestone} disabled={saving || !addName.trim()}>
                {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Add
              </Button>
            </ButtonGroup>
          }
        >
          <GenericInputWithLabel id="milestone-name" label="Name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. v1.0" />
          <GenericInputWithLabel id="milestone-slug" label="Slug (optional)" value={addSlug} onChange={(e) => setAddSlug(e.target.value)} placeholder="e.g. v1-0" />
          <GenericTextareaWithLabel id="milestone-content" label="Content (optional)" value={addContent} onChange={(e) => setAddContent(e.target.value)} placeholder="Markdown content" />
        </SharedDialog>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold">Milestones</h3>
        <div className="flex items-center gap-1.5">
          {selectedMilestoneId != null && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConvertTicketsOpen(true)}
                className="gap-1"
              >
                <ListTodo className="size-3" />
                Convert to tickets
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const m = milestones.find((x) => x.id === selectedMilestoneId);
                  if (m) openEdit(m);
                }}
                className="gap-1"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMilestoneId == null) return;
                  if (window.confirm("Remove this milestone? Tickets that reference it will keep the id but the milestone name will no longer resolve.")) {
                    handleDeleteMilestone();
                  }
                }}
                disabled={deleteSaving}
                className="gap-1 text-destructive hover:text-destructive"
              >
                {deleteSaving ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                Delete
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="gap-1">
            <Plus className="size-3" />
            Add milestone
          </Button>
        </div>
      </div>
      <SectionCard accentColor="orange" className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold">Milestone list</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Milestones are DB entries with an id so you can reference them (e.g. tickets use milestone_id). Select one to view or edit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 flex-1 min-h-0">
          <div className="flex flex-wrap gap-1.5 min-w-0 sm:flex-col sm:flex-nowrap sm:max-w-[200px]">
            {milestones.map((m) => (
              <Button
                key={m.id}
                variant={selectedMilestoneId === m.id ? "secondary" : "outline"}
                size="sm"
                className="font-mono text-xs justify-start"
                onClick={() => setSelectedMilestoneId(m.id)}
              >
                {m.name}
              </Button>
            ))}
          </div>
          <div className="flex-1 min-w-0 border border-border/60 rounded-md overflow-hidden flex flex-col">
            {selectedMilestone?.content ? (
              <ScrollArea className="flex-1 min-h-[300px]">
                <div className={cn("p-4", markdownClasses)}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedMilestone.content}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <div className="p-6 text-sm text-muted-foreground text-center flex-1 flex items-center justify-center">
                No content for this milestone.
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SharedDialog
        isOpen={addOpen}
        title="Add milestone"
        onClose={() => setAddOpen(false)}
        actions={
          <ButtonGroup alignment="right">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMilestone} disabled={saving || !addName.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Add
            </Button>
          </ButtonGroup>
        }
      >
        <GenericInputWithLabel id="milestone-name" label="Name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. v1.0" />
        <GenericInputWithLabel id="milestone-slug" label="Slug (optional)" value={addSlug} onChange={(e) => setAddSlug(e.target.value)} placeholder="e.g. v1-0" />
        <GenericTextareaWithLabel id="milestone-content" label="Content (optional)" value={addContent} onChange={(e) => setAddContent(e.target.value)} placeholder="Markdown content" />
      </SharedDialog>

      <SharedDialog
        isOpen={editOpen}
        title={`Edit milestone${selectedMilestoneId != null ? ` (id ${selectedMilestoneId})` : ""}`}
        onClose={() => setEditOpen(false)}
        actions={
          <ButtonGroup alignment="right">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateMilestone} disabled={editSaving || !editName.trim()}>
              {editSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Update
            </Button>
          </ButtonGroup>
        }
      >
        <GenericInputWithLabel id="edit-milestone-name" label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. v1.0" />
        <GenericInputWithLabel id="edit-milestone-slug" label="Slug (optional)" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="e.g. v1-0" />
        <GenericTextareaWithLabel id="edit-milestone-content" label="Content (optional)" value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Markdown content" />
      </SharedDialog>

      {selectedMilestoneId != null && (
        <ConvertToTicketsDialog
          isOpen={convertTicketsOpen}
          onClose={() => setConvertTicketsOpen(false)}
          projectId={projectId}
          milestoneId={selectedMilestoneId}
          onSuccess={onTicketAdded}
        />
      )}
    </div>
  );
}

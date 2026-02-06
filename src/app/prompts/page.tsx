"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useRunState } from "@/context/run-state";
import { Plus, Pencil, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PromptRecord = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function PromptsPage() {
  const {
    error,
    prompts,
    selectedPromptIds,
    setSelectedPromptIds,
    refreshData,
    setError,
  } = useRunState();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formId, setFormId] = useState<number | undefined>(undefined);

  const [generateDescription, setGenerateDescription] = useState("");
  const [generateResult, setGenerateResult] = useState<{ title: string; content: string } | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const openCreate = useCallback(() => {
    setFormId(undefined);
    setFormTitle("");
    setFormContent("");
    setCreateOpen(true);
  }, []);

  const openEdit = useCallback(async () => {
    if (selectedPromptIds.length !== 1) return;
    const id = selectedPromptIds[0];
    setEditOpen(true);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/data/prompts");
      if (!res.ok) throw new Error(await res.text());
      const list: PromptRecord[] = await res.json();
      const one = list.find((p) => Number(p.id) === id);
      if (one) {
        setFormId(one.id);
        setFormTitle(one.title);
        setFormContent(one.content ?? "");
      } else {
        setError("Prompt not found");
        setEditOpen(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEditOpen(false);
    } finally {
      setSaveLoading(false);
    }
  }, [selectedPromptIds, setError]);

  const handleSaveCreate = useCallback(async () => {
    if (!formTitle.trim()) return;
    setSaveLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle.trim(), content: formContent }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await refreshData();
      setCreateOpen(false);
      setFormTitle("");
      setFormContent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaveLoading(false);
    }
  }, [formTitle, formContent, refreshData, setError]);

  const handleSaveEdit = useCallback(async () => {
    if (formId === undefined || !formTitle.trim()) return;
    setSaveLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formId,
          title: formTitle.trim(),
          content: formContent,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await refreshData();
      setEditOpen(false);
      setFormId(undefined);
      setFormTitle("");
      setFormContent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaveLoading(false);
    }
  }, [formId, formTitle, formContent, refreshData, setError]);

  const handleGenerate = useCallback(async () => {
    if (!generateDescription.trim()) return;
    setGenerateLoading(true);
    setGenerateResult(null);
    setError(null);
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: generateDescription.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setGenerateResult({ title: data.title ?? "", content: data.content ?? "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerateLoading(false);
    }
  }, [generateDescription, setError]);

  const useGeneratedAndCreate = useCallback(() => {
    if (generateResult) {
      setFormTitle(generateResult.title);
      setFormContent(generateResult.content);
      setFormId(undefined);
      setGenerateOpen(false);
      setGenerateResult(null);
      setGenerateDescription("");
      setCreateOpen(true);
    }
  }, [generateResult]);

  const saveGeneratedAsNew = useCallback(async () => {
    if (!generateResult || !generateResult.title.trim()) return;
    setSaveLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generateResult.title.trim(),
          content: generateResult.content,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await refreshData();
      setGenerateOpen(false);
      setGenerateResult(null);
      setGenerateDescription("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaveLoading(false);
    }
  }, [generateResult, refreshData, setError]);

  const canEdit = selectedPromptIds.length === 1;

  const handleDelete = useCallback(
    async (promptId: number) => {
      if (!confirm("Delete this prompt?")) return;
      setError(null);
      try {
        const res = await fetch(`/api/data/prompts/${promptId}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await refreshData();
        setSelectedPromptIds((prev) => prev.filter((id) => id !== promptId));
        toast.success("Prompt removed");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        toast.error(msg);
      }
    },
    [refreshData, setSelectedPromptIds, setError]
  );

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Prompts</CardTitle>
              <CardDescription className="mt-1">
                Select prompt IDs to run (script <code className="text-xs">-p ID ...</code>). To
                start the script, go to the{" "}
                <Link href="/run" className="underline hover:text-foreground">
                  Run
                </Link>{" "}
                page where you can set prompts, projects, and run. Configure timing on the{" "}
                <Link href="/configuration" className="underline hover:text-foreground">
                  Configuration
                </Link>{" "}
                page.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Create prompt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openEdit}
                disabled={!canEdit}
                title={canEdit ? "Edit selected prompt" : "Select exactly one prompt to edit"}
              >
                <Pencil className="h-4 w-4" />
                Edit prompt
              </Button>
              <Button variant="outline" size="sm" onClick={() => setGenerateOpen(true)}>
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50",
                  selectedPromptIds.includes(p.id) && "bg-muted/50"
                )}
              >
                <label className="flex cursor-pointer flex-1 min-w-0 items-center gap-2">
                  <Checkbox
                    checked={selectedPromptIds.includes(p.id)}
                    onCheckedChange={(checked) => {
                      setSelectedPromptIds((prev) =>
                        checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                      );
                    }}
                  />
                  <span className="text-sm truncate">
                    {p.id}: {p.title}
                  </span>
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
                  title="Delete prompt"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(p.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create prompt dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create prompt</DialogTitle>
            <DialogDescription>Add a new prompt. Title and content are required.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Run 3000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-content">Content</Label>
              <Textarea
                id="create-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Instructions for the AI..."
                rows={12}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCreate} disabled={!formTitle.trim() || saveLoading}>
              {saveLoading ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit prompt dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit prompt</DialogTitle>
            <DialogDescription>Update title and content. Changes are saved to the data file.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Content"
                rows={12}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!formTitle.trim() || saveLoading}>
              {saveLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate with AI dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate prompt with AI</DialogTitle>
            <DialogDescription>
              Describe what you want the prompt to do. We&apos;ll generate a title and full prompt
              text you can edit and save.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {!generateResult ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="generate-desc">Description</Label>
                  <Textarea
                    id="generate-desc"
                    value={generateDescription}
                    onChange={(e) => setGenerateDescription(e.target.value)}
                    placeholder="e.g. A prompt that refactors React components to use TypeScript and strict typing"
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!generateDescription.trim() || generateLoading}
                  >
                    {generateLoading ? "Generating..." : "Generate"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Generated title</Label>
                  <Input
                    value={generateResult.title}
                    onChange={(e) =>
                      setGenerateResult((r) => (r ? { ...r, title: e.target.value } : null))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Generated content</Label>
                  <Textarea
                    value={generateResult.content}
                    onChange={(e) =>
                      setGenerateResult((r) => (r ? { ...r, content: e.target.value } : null))
                    }
                    rows={10}
                    className="min-h-[200px]"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGenerateResult(null)}>
                    Back
                  </Button>
                  <Button variant="outline" onClick={useGeneratedAndCreate}>
                    Edit & create
                  </Button>
                  <Button
                    onClick={saveGeneratedAsNew}
                    disabled={!generateResult.title.trim() || saveLoading}
                  >
                    {saveLoading ? "Saving..." : "Save as new prompt"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

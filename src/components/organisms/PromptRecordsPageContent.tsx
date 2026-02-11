"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRunState } from "@/context/run-state";
import { PromptRecordActionButtons } from "@/components/molecules/ControlsAndButtons/PromptActionButtons"; // Corrected import
import { PromptRecordTable } from "@/components/molecules/ListsAndTables/PromptTable";
import { PromptRecordFormDialog } from "@/components/molecules/FormsAndDialogs/PromptFormDialog";
import { GeneratePromptRecordDialog } from "@/components/molecules/FormsAndDialogs/GeneratePromptDialog";
import { toast } from "sonner"; // Added import for toast, if not already imported elsewhere

type PromptRecordRecord = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export function PromptRecordsPageContent() {
  const {
    error,
    selectedPromptRecordIds,
    setSelectedPromptRecordIds,
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

  const [fullPromptRecords, setFullPromptRecords] = useState<PromptRecordRecord[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  const fetchFullPromptRecords = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await fetch("/api/data/prompts");
      if (res.ok) {
        const list: PromptRecordRecord[] = await res.json();
        setFullPromptRecords(Array.isArray(list) ? list : []);
      }
    } catch {
      setFullPromptRecords([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFullPromptRecords();
  }, [fetchFullPromptRecords]);

  const openCreate = useCallback(() => {
    setFormId(undefined);
    setFormTitle("");
    setFormContent("");
    setCreateOpen(true);
  }, []);

  const openEdit = useCallback(async () => {
    if (selectedPromptRecordIds.length !== 1) return;
    const id = selectedPromptRecordIds[0];
    setEditOpen(true);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/data/prompts");
      if (!res.ok) throw new Error(await res.text());
      const list: PromptRecordRecord[] = await res.json();
      const one = list.find((p) => Number(p.id) === id);
      if (one) {
        setFormId(one.id);
        setFormTitle(one.title);
        setFormContent(one.content ?? "");
      } else {
        setError("PromptRecord not found");
        setEditOpen(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEditOpen(false);
    } finally {
      setSaveLoading(false);
    }
  }, [selectedPromptRecordIds, setError]);

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
      fetchFullPromptRecords();
      setCreateOpen(false);
      setFormTitle("");
      setFormContent("");
      toast.success("PromptRecord added");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaveLoading(false);
    }
  }, [formTitle, formContent, refreshData, setError, fetchFullPromptRecords]);

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
      fetchFullPromptRecords();
      setEditOpen(false);
      setFormId(undefined);
      setFormTitle("");
      setFormContent("");
      toast.success("PromptRecord updated");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaveLoading(false);
    }
  }, [formId, formTitle, formContent, refreshData, setError, fetchFullPromptRecords]);

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
      fetchFullPromptRecords();
      setGenerateOpen(false);
      setGenerateResult(null);
      setGenerateDescription("");
      toast.success("PromptRecord added");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    finally {
      setSaveLoading(false);
    }
  }, [generateResult, refreshData, setError, fetchFullPromptRecords]);

  const canEdit = selectedPromptRecordIds.length === 1;

  const handleDelete = useCallback(
    async (promptId: number) => {
      setError(null);
      try {
        const res = await fetch(`/api/data/prompts/${promptId}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await refreshData();
        fetchFullPromptRecords();
        setSelectedPromptRecordIds((prev) => prev.filter((id) => id !== promptId));
        toast.success("PromptRecord removed");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        toast.error(msg);
      }
    },
    [refreshData, fetchFullPromptRecords, setSelectedPromptRecordIds, setError]
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
              <CardTitle className="text-base">All prompts data</CardTitle>
              <CardDescription className="mt-1">
                Full list of prompts with id, title, category, tags, dates, and content preview.
                Select in the table for run (script <code className="text-xs">-p ID ...</code>); go
                to the{" "}
                <Link href="/run" className="underline hover:text-foreground">
                  Run
                </Link>{" "}
                page to set prompts and run. Edit or delete from the table. Configure timing on the{" "}
                <Link href="/configuration" className="underline hover:text-foreground">
                  Configuration
                </Link>{" "}
                page.
              </CardDescription>
            </div>
            <PromptRecordActionButtons // Corrected component name
              openCreate={openCreate}
              openEdit={openEdit}
              setGenerateOpen={setGenerateOpen}
              canEdit={canEdit}
            />
          </div>
        </CardHeader>
        <CardContent>
          {tableLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading prompts…</p>
          ) : (
            <PromptRecordTable
              fullPromptRecords={fullPromptRecords}
              selectedPromptRecordIds={selectedPromptRecordIds}
              setSelectedPromptRecordIds={setSelectedPromptRecordIds}
              handleDelete={handleDelete}
              setEditOpen={setEditOpen}
              setFormId={setFormId}
              setFormTitle={setFormTitle}
              setFormContent={setFormContent}
            />
          )}
        </CardContent>
      </Card>

      <PromptRecordFormDialog
        open={createOpen}
        setOpen={setCreateOpen}
        title="Create prompt"
        description="Add a new prompt. Title and content are required."
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formContent={formContent}
        setFormContent={setFormContent}
        handleSave={handleSaveCreate}
        saveLoading={saveLoading}
      />

      <PromptRecordFormDialog
        open={editOpen}
        setOpen={setEditOpen}
        title="Edit prompt"
        description="Update title and content. Changes are saved to the data file."
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formContent={formContent}
        setFormContent={setFormContent}
        handleSave={handleSaveEdit}
        saveLoading={saveLoading}
      />

      <GeneratePromptRecordDialog
        open={generateOpen}
        setOpen={setGenerateOpen}
        generateDescription={generateDescription}
        setGenerateDescription={setGenerateDescription}
        handleGenerate={handleGenerate}
        generateLoading={generateLoading}
        generateResult={generateResult}
        setGenerateResult={setGenerateResult}
        useGeneratedAndCreate={useGeneratedAndCreate}
        saveGeneratedAsNew={saveGeneratedAsNew}
        saveLoading={saveLoading}
      />
    </div>
  );
}

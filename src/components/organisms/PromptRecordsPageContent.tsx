"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRunState } from "@/context/run-state";
import { isTauri } from "@/lib/tauri";
import { useRunStore, registerRunCompleteHandler } from "@/store/run-store";
import type { Project } from "@/types/project";
import { PromptRecordActionButtons } from "@/components/molecules/ControlsAndButtons/PromptRecordActionButtons";
import { PromptRecordTable } from "@/components/molecules/ListsAndTables/PromptRecordTable";
import { PromptRecordFormDialog } from "@/components/molecules/FormsAndDialogs/PromptRecordFormDialog";
import { GeneratePromptRecordDialog } from "@/components/molecules/FormsAndDialogs/GeneratePromptRecordDialog";
import { PromptContentViewDialog } from "@/components/molecules/FormsAndDialogs/PromptContentViewDialog";
import { toast } from "sonner"; // Added import for toast, if not already imported elsewhere
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("PromptRecordsPageContent.tsx");

const GENERAL_TAB = "general";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(GENERAL_TAB);
  const [viewingPrompt, setViewingPrompt] = useState<PromptRecordRecord | null>(null);
  const cancelledRef = useRef(false);
  const searchParams = useSearchParams();

  const fetchFullPromptRecords = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await fetch("/api/data/prompts");
      if (cancelledRef.current) return;
      if (res.ok) {
        const list: PromptRecordRecord[] = await res.json();
        if (!cancelledRef.current) setFullPromptRecords(Array.isArray(list) ? list : []);
      }
    } catch {
      if (!cancelledRef.current) setFullPromptRecords([]);
    } finally {
      if (!cancelledRef.current) setTableLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/data/projects");
      if (cancelledRef.current) return;
      if (res.ok) {
        const list: Project[] = await res.json();
        if (!cancelledRef.current) setProjects(Array.isArray(list) ? list : []);
      }
    } catch {
      if (!cancelledRef.current) setProjects([]);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    fetchFullPromptRecords();
    fetchProjects();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchFullPromptRecords, fetchProjects]);

  // Pre-select project tab when opening from project page (e.g. /prompts?projectId=...)
  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId && projects.some((p) => p.id === projectId && (p.promptIds?.length ?? 0) > 0)) {
      setActiveTab(projectId);
    }
  }, [searchParams, projects]);

  const { generalPrompts, projectsWithPrompts } = useMemo(() => {
    const allPromptIdsInProjects = new Set(projects.flatMap((p) => p.promptIds ?? []));
    const general = fullPromptRecords.filter((p) => !allPromptIdsInProjects.has(p.id));
    const withPrompts = projects.filter((p) => (p.promptIds?.length ?? 0) > 0);
    return { generalPrompts: general, projectsWithPrompts: withPrompts };
  }, [fullPromptRecords, projects]);

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

  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const defaultProjectPath = useRunStore((s) => s.activeProjects[0] ?? s.allProjects[0] ?? "");

  const handleGenerate = useCallback(async () => {
    if (!generateDescription.trim()) return;
    setGenerateLoading(true);
    setGenerateResult(null);
    setError(null);
    try {
      if (isTauri && defaultProjectPath) {
        const res = await fetch("/api/generate-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: generateDescription.trim(), promptOnly: true }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.detail || res.statusText);
        }
        const data = (await res.json()) as { prompt?: string };
        const prompt = data.prompt;
        if (!prompt) throw new Error("No prompt returned");
        const requestId = `prompt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        registerRunCompleteHandler(`parse_prompt:${requestId}`, (stdout: string) => {
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : stdout;
          try {
            const parsed = JSON.parse(jsonStr) as { title?: string; content?: string };
            setGenerateResult({
              title: String(parsed.title ?? "Generated prompt").slice(0, 500),
              content: String(parsed.content ?? "").slice(0, 50000),
            });
          } catch {
            setError("Could not parse agent output");
          }
          setGenerateLoading(false);
        });
        await runTempTicket(defaultProjectPath, prompt, "Generate prompt", {
          onComplete: "parse_prompt",
          payload: { requestId },
        });
        toast.success("Generate prompt running in Run tab.");
        return;
      }
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
  }, [generateDescription, setError, defaultProjectPath, runTempTicket]);

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
    <div className={c["0"]}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <div className={c["1"]}>
            <div>
              <CardTitle className={c["2"]}>Prompts</CardTitle>
              <CardDescription className={c["3"]}>
                <strong>General</strong> shows prompts you add here (not linked to a project). Each project tab shows prompts linked to that project.
                Select in the table for run (script <code className={c["4"]}>-p ID ...</code>).
                Edit or delete from the table. Configure timing on the{" "}
                <Link href="/configuration" className={c["6"]}>
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
            <p className={c["7"]}>Loading prompts…</p>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full flex-wrap gap-1 bg-muted/50">
                <TabsTrigger value={GENERAL_TAB}>General</TabsTrigger>
                {projectsWithPrompts.map((p) => (
                  <TabsTrigger key={p.id} value={p.id}>
                    {p.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={GENERAL_TAB} className="mt-4 focus-visible:outline-none">
                <PromptRecordTable
                  fullPromptRecords={generalPrompts}
                  selectedPromptRecordIds={selectedPromptRecordIds}
                  setSelectedPromptRecordIds={setSelectedPromptRecordIds}
                  handleDelete={handleDelete}
                  setEditOpen={setEditOpen}
                  setFormId={setFormId}
                  setFormTitle={setFormTitle}
                  setFormContent={setFormContent}
                  onViewPrompt={setViewingPrompt}
                />
              </TabsContent>
              {projectsWithPrompts.map((p) => (
                <TabsContent key={p.id} value={p.id} className="mt-4 focus-visible:outline-none">
                  <PromptRecordTable
                    fullPromptRecords={fullPromptRecords.filter((r) => (p.promptIds ?? []).includes(r.id))}
                    selectedPromptRecordIds={selectedPromptRecordIds}
                    setSelectedPromptRecordIds={setSelectedPromptRecordIds}
                    handleDelete={handleDelete}
                    setEditOpen={setEditOpen}
                    setFormId={setFormId}
                    setFormTitle={setFormTitle}
                    setFormContent={setFormContent}
                    onViewPrompt={setViewingPrompt}
                  />
                </TabsContent>
              ))}
            </Tabs>
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

      <PromptContentViewDialog
        open={!!viewingPrompt}
        onOpenChange={(open) => !open && setViewingPrompt(null)}
        prompt={viewingPrompt}
      />
    </div>
  );
}

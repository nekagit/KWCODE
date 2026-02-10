"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Ticket as TicketIcon,
  Layers,
  Lightbulb,
  Palette,
  Building2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Link2,
  Download,
  Tags,
  FolderOpen,
  Plus,
  FileText,
  Trash2,
  X,
  ClipboardCopy,
  FileSearch,
  Play,
  ListTodo,
  Sparkles,
  GitBranch,
  Settings,
  CheckCircle2,
  AlertCircle,
  Cloud,
  GitCommit,
  RefreshCw,
  ChevronRight,
  Archive,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project, EntityCategory, ProjectEntityCategories } from "@/types/project";
import { getProject, getProjectResolved, updateProject, getProjectExport } from "@/lib/api-projects";
import { isTauri, invoke, listen } from "@/lib/tauri";
import { designRecordToMarkdown } from "@/lib/design-to-markdown";
import { architectureRecordToMarkdown } from "@/lib/architecture-to-markdown";
import { featureToMarkdown } from "@/lib/feature-to-markdown";
import { CURSOR_BEST_PRACTICE_FILES } from "@/lib/cursor-best-practice";
import { CursorFilesTree } from "@/components/cursor-files-tree";
import {
  ANALYSIS_PROMPT,
  ANALYSIS_PROMPT_FILENAME,
  buildDesignAnalysisPrompt,
  buildArchitectureAnalysisPrompt,
  buildTicketsAnalysisPrompt,
  buildFeaturesAnalysisPrompt,
  buildKanbanContextBlock,
  combinePromptWithKanban,
} from "@/lib/analysis-prompt";
import { createDefaultDesignConfig } from "@/data/design-templates";
import {
  parseTodosToKanban,
  markTicketsDone,
  markFeatureDoneByTicketRefs,
  validateFeaturesTicketsCorrelation,
  type TodosKanbanData,
  type ParsedFeature,
} from "@/lib/todos-kanban";
import { toast } from "sonner";
import type { GitInfo } from "@/types/git";
import { useRunState } from "@/context/run-state";
import { useRunStore } from "@/store/run-store";

type WithCategory<T> = T & EntityCategory;

type ResolvedProject = Project & {
  prompts: WithCategory<{ id: number; title: string; content?: string }>[];
  tickets: WithCategory<{ id: string; title: string; status: string; description?: string }>[];
  features: WithCategory<{ id: string; title: string; prompt_ids: number[]; project_paths: string[] }>[];
  ideas: WithCategory<{ id: number; title: string; description: string; category: string }>[];
  designs?: WithCategory<{ id: string; name: string }>[];
  architectures?: WithCategory<{ id: string; name: string }>[];
};

const CATEGORY_FIELDS = ["phase", "step", "organization", "categorizer", "other"] as const;

type PromptItem = { id: number; title: string };
type TicketItem = { id: string; title: string };
type FeatureItem = { id: string; title: string };
type IdeaItem = { id: number; title: string };
type DesignItem = { id: string; name: string };
type ArchitectureItem = { id: string; name: string };

type DetailModalItem =
  | { kind: "prompt"; data: ResolvedProject["prompts"][number] }
  | { kind: "ticket"; data: ResolvedProject["tickets"][number] }
  | { kind: "feature"; data: ResolvedProject["features"][number] }
  | { kind: "idea"; data: ResolvedProject["ideas"][number] }
  | { kind: "design"; data: NonNullable<ResolvedProject["designs"]>[number] }
  | { kind: "architecture"; data: NonNullable<ResolvedProject["architectures"]>[number] };

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [promptIds, setPromptIds] = useState<number[]>([]);
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [ideaIds, setIdeaIds] = useState<number[]>([]);
  const [designIds, setDesignIds] = useState<string[]>([]);
  const [architectureIds, setArchitectureIds] = useState<string[]>([]);
  const [promptsList, setPromptsList] = useState<PromptItem[]>([]);
  const [ticketsList, setTicketsList] = useState<TicketItem[]>([]);
  const [featuresList, setFeaturesList] = useState<FeatureItem[]>([]);
  const [ideasList, setIdeasList] = useState<IdeaItem[]>([]);
  const [designsList, setDesignsList] = useState<DesignItem[]>([]);
  const [architecturesList, setArchitecturesList] = useState<ArchitectureItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksSaving, setLinksSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [entityCategories, setEntityCategories] = useState<ProjectEntityCategories>({});
  const [detailModalItem, setDetailModalItem] = useState<DetailModalItem | null>(null);
  const [cursorFiles, setCursorFiles] = useState<{ name: string; path: string }[]>([]);
  const [cursorFilesLoading, setCursorFilesLoading] = useState(false);
  const [cursorFilesError, setCursorFilesError] = useState<string | null>(null);
  const [specFilesSaving, setSpecFilesSaving] = useState(false);
  const [specPreview, setSpecPreview] = useState<{ path: string; name: string; content: string } | null>(null);
  const [specPreviewLoading, setSpecPreviewLoading] = useState(false);
  const [specPreviewError, setSpecPreviewError] = useState<string | null>(null);
  const [designExportingId, setDesignExportingId] = useState<string | null>(null);
  const [architectureExportingId, setArchitectureExportingId] = useState<string | null>(null);
  const [bestPracticeOpen, setBestPracticeOpen] = useState(false);
  const [featureExportingId, setFeatureExportingId] = useState<string | null>(null);
  const [downloadAllToCursorLoading, setDownloadAllToCursorLoading] = useState(false);
  const [analysisDialogPrompt, setAnalysisDialogPrompt] = useState<string | null>(null);
  const [analysisDialogPrompts, setAnalysisDialogPrompts] = useState<string[] | null>(null);
  const [analysisDialogTitle, setAnalysisDialogTitle] = useState<string>("");
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const [savingPromptToCursor, setSavingPromptToCursor] = useState(false);
  const [dragOverCard, setDragOverCard] = useState<string | null>(null);
  const [specDropLoading, setSpecDropLoading] = useState(false);
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [gitInfoLoading, setGitInfoLoading] = useState(false);
  const [gitInfoError, setGitInfoError] = useState<string | null>(null);
  const [cursorTicketsMd, setCursorTicketsMd] = useState<string | null>(null);
  const [cursorTicketsMdLoading, setCursorTicketsMdLoading] = useState(false);
  const [cursorTicketsMdError, setCursorTicketsMdError] = useState<string | null>(null);
  const [cursorFeaturesMd, setCursorFeaturesMd] = useState<string | null>(null);
  const [cursorFeaturesMdLoading, setCursorFeaturesMdLoading] = useState(false);
  const [cursorFeaturesMdError, setCursorFeaturesMdError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ ok: boolean; message: string; details: string[] } | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState<"tickets" | "features" | "both" | null>(null);

  const { runWithParams, addFeatureToQueue, runningRuns, error: runStoreError } = useRunState();

  /** Implement Features loop: run script for top To-do feature, on exit mark feature and tickets done, then next. Uses repo path of the project details that's open. */
  const [implementFeaturesRunning, setImplementFeaturesRunning] = useState(false);
  const [implementFeaturesRunId, setImplementFeaturesRunId] = useState<string | null>(null);
  const implementingFeatureRef = useRef<ParsedFeature | null>(null);
  /** Repo path and combined prompt text when Implement Features was started; used for the whole loop. */
  const implementRepoPathRef = useRef<string | null>(null);
  const implementActivePromptRef = useRef<string>("");

  /** Todos tab — Prompt card: choose existing prompt or write custom; always combined with Kanban features & tickets. */
  const [todosPromptSelectedId, setTodosPromptSelectedId] = useState<number | "custom" | "">("custom");
  const [todosPromptBody, setTodosPromptBody] = useState("");
  const [todosPromptContentLoading, setTodosPromptContentLoading] = useState(false);
  const [todosPromptCopied, setTodosPromptCopied] = useState(false);
  const [todosPromptSaving, setTodosPromptSaving] = useState(false);
  /** When true, the current prompt in this card is used by Implement Features. Set via "Active" button. */
  const [todosPromptIsActive, setTodosPromptIsActive] = useState(false);
  /** Add custom prompt dialog: save current prompt text as a new prompt. */
  const [addPromptDialogOpen, setAddPromptDialogOpen] = useState(false);
  const [addPromptTitle, setAddPromptTitle] = useState("");
  const [addPromptSaving, setAddPromptSaving] = useState(false);
  /** Generate AI prompt from current Kanban (features + tickets). */
  const [generatePromptLoading, setGeneratePromptLoading] = useState(false);

  /** Inline edit project name / repo path in header */
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingPath, setEditingPath] = useState(false);
  const [savingField, setSavingField] = useState<"title" | "path" | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const pathInputRef = useRef<HTMLInputElement>(null);

  const setProjectFromData = useCallback((data: Project | ResolvedProject) => {
    const r = data as ResolvedProject;
    setProject(r);
    setPromptIds(Array.isArray(r.promptIds) ? r.promptIds : []);
    setTicketIds(Array.isArray(r.ticketIds) ? r.ticketIds : []);
    setFeatureIds(Array.isArray(r.featureIds) ? r.featureIds : []);
    setIdeaIds(Array.isArray(r.ideaIds) ? r.ideaIds : []);
    setDesignIds(Array.isArray((r as ResolvedProject).designIds) ? ((r as ResolvedProject).designIds ?? []) : []);
    setArchitectureIds(Array.isArray((r as ResolvedProject).architectureIds) ? ((r as ResolvedProject).architectureIds ?? []) : []);
    setEntityCategories(r.entityCategories ?? {});
  }, []);

  const refetchProject = useCallback(() => {
    if (!id) return;
    if (isTauri()) {
      getProjectResolved(id)
        .then((data) => setProjectFromData(data as ResolvedProject))
        .catch(() => {});
      return;
    }
    fetch(`/api/data/projects/${id}`)
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || res.statusText)));
        return res.json();
      })
      .then((data) => setProjectFromData(data as ResolvedProject))
      .catch(() => {});
  }, [id, setProjectFromData]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (isTauri()) {
      getProjectResolved(id)
        .then((data) => {
          if (!cancelled) setProjectFromData(data as ResolvedProject);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
    fetch(`/api/data/projects/${id}`)
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || res.statusText)));
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setProjectFromData(data as ResolvedProject);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, setProjectFromData]);

  const refetchPromptsList = useCallback(() => {
    fetch("/api/data/prompts")
      .then((r) => (r.ok ? r.json() : []))
      .then((pList: { id: number; title: string }[]) => {
        setPromptsList(Array.isArray(pList) ? pList.map((x) => ({ id: Number(x.id), title: x.title ?? "" })) : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id || !project) return;
    let cancelled = false;
    setLinksLoading(true);
    Promise.all([
      fetch("/api/data/prompts").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/data").then((r) => (r.ok ? r.json() : { tickets: [], features: [] })),
      fetch("/api/data/ideas").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/data/designs").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/data/architectures").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([pList, data, iList, dList, aList]) => {
        if (cancelled) return;
        setPromptsList(Array.isArray(pList) ? pList.map((x: { id: number; title: string }) => ({ id: Number(x.id), title: x.title ?? "" })) : []);
        setTicketsList(Array.isArray(data.tickets) ? data.tickets : []);
        setFeaturesList(Array.isArray(data.features) ? data.features : []);
        setIdeasList(Array.isArray(iList) ? iList : []);
        setDesignsList(Array.isArray(dList) ? dList.map((x: { id: string; name: string }) => ({ id: x.id, name: x.name ?? "" })) : []);
        setArchitecturesList(Array.isArray(aList) ? aList.map((x: { id: string; name: string }) => ({ id: x.id, name: x.name ?? "" })) : []);
      })
      .finally(() => {
        if (!cancelled) setLinksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, project]);

  useEffect(() => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    let cancelled = false;
    setCursorFilesLoading(true);
    setCursorFilesError(null);
    invoke<{ name: string; path: string }[]>("list_cursor_folder", { projectPath: project.repoPath.trim() })
      .then((files) => {
        if (!cancelled) setCursorFiles(Array.isArray(files) ? files : []);
      })
      .catch((e) => {
        if (!cancelled) setCursorFilesError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setCursorFilesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [project?.repoPath]);

  useEffect(() => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    let cancelled = false;
    setGitInfoLoading(true);
    setGitInfoError(null);
    invoke<GitInfo>("get_git_info", { projectPath: project.repoPath.trim() })
      .then((info) => {
        if (!cancelled) setGitInfo(info);
      })
      .catch((e) => {
        if (!cancelled) setGitInfoError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setGitInfoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [project?.repoPath]);

  const fetchGitInfo = useCallback(() => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    setGitInfoLoading(true);
    setGitInfoError(null);
    invoke<GitInfo>("get_git_info", { projectPath: project.repoPath!.trim() })
      .then(setGitInfo)
      .catch((e) => setGitInfoError(e instanceof Error ? e.message : String(e)))
      .finally(() => setGitInfoLoading(false));
  }, [project?.repoPath]);

  const loadCursorTicketsMd = useCallback(() => {
    if (!project || !id) return;
    setCursorTicketsMdLoading(true);
    setCursorTicketsMdError(null);
    const path = ".cursor/tickets.md";
    if (isTauri() && project.repoPath?.trim()) {
      invoke<string>("read_file_text_under_root", { root: project.repoPath.trim(), path })
        .then((content) => {
          setCursorTicketsMd(content ?? "");
          setCursorTicketsMdError(null);
        })
        .catch(() => {
          setCursorTicketsMd("");
          setCursorTicketsMdError(null);
        })
        .finally(() => setCursorTicketsMdLoading(false));
    } else {
      fetch(`/api/data/projects/${id}/file?path=${encodeURIComponent(path)}`)
        .then((res) => {
          if (res.ok) return res.text().then((text) => ({ text, ok: true }));
          if (res.status === 404) return { text: "", ok: false };
          return res.json().then((j) => Promise.reject(new Error((j as { error?: string }).error ?? res.statusText)));
        })
        .then((result) => {
          setCursorTicketsMd(result.ok ? result.text : "");
          setCursorTicketsMdError(null);
        })
        .catch((e) => {
          setCursorTicketsMd(null);
          setCursorTicketsMdError(e instanceof Error ? e.message : String(e));
        })
        .finally(() => setCursorTicketsMdLoading(false));
    }
  }, [project, id]);

  useEffect(() => {
    loadCursorTicketsMd();
  }, [loadCursorTicketsMd]);

  const loadCursorFeaturesMd = useCallback(() => {
    if (!project || !id) return;
    setCursorFeaturesMdLoading(true);
    setCursorFeaturesMdError(null);
    const path = ".cursor/features.md";
    if (isTauri() && project.repoPath?.trim()) {
      invoke<string>("read_file_text_under_root", { root: project.repoPath.trim(), path })
        .then((content) => {
          setCursorFeaturesMd(content ?? "");
          setCursorFeaturesMdError(null);
        })
        .catch(() => {
          setCursorFeaturesMd("");
          setCursorFeaturesMdError(null);
        })
        .finally(() => setCursorFeaturesMdLoading(false));
    } else {
      fetch(`/api/data/projects/${id}/file?path=${encodeURIComponent(path)}`)
        .then((res) => {
          if (res.ok) return res.text().then((text) => ({ text, ok: true }));
          if (res.status === 404) return { text: "", ok: false };
          return res.json().then((j) => Promise.reject(new Error((j as { error?: string }).error ?? res.statusText)));
        })
        .then((result) => {
          setCursorFeaturesMd(result.ok ? result.text : "");
          setCursorFeaturesMdError(null);
        })
        .catch((e) => {
          setCursorFeaturesMd(null);
          setCursorFeaturesMdError(e instanceof Error ? e.message : String(e));
        })
        .finally(() => setCursorFeaturesMdLoading(false));
    }
  }, [project, id]);

  useEffect(() => {
    loadCursorFeaturesMd();
  }, [loadCursorFeaturesMd]);

  /** Parsed JSON from features.md + tickets.md for Kanban and export. Always an object so the board structure is always visible. */
  const kanbanData = useMemo((): TodosKanbanData => {
    const f = cursorFeaturesMd ?? "";
    const t = cursorTicketsMd ?? "";
    return parseTodosToKanban(f, t);
  }, [cursorFeaturesMd, cursorTicketsMd]);

  /** When both .md files are loaded (Tauri), write .cursor/todos-kanban.json so Kanban JSON is immediately available. */
  useEffect(() => {
    if (
      !isTauri() ||
      !project?.repoPath?.trim() ||
      cursorTicketsMd === null ||
      cursorFeaturesMd === null
    )
      return;
    const data = parseTodosToKanban(cursorFeaturesMd, cursorTicketsMd);
    const json = JSON.stringify(data, null, 2);
    invoke("write_spec_file", {
      projectPath: project.repoPath!.trim(),
      relativePath: ".cursor/todos-kanban.json",
      content: json,
    }).catch(() => {});
  }, [
    isTauri,
    project?.repoPath,
    cursorTicketsMd,
    cursorFeaturesMd,
  ]);

  /** Todos tab Prompt card: combined prompt = Kanban context (features + tickets) + user prompt body. Always includes Kanban. */
  const todosCombinedPrompt = useMemo(() => {
    const block = buildKanbanContextBlock(kanbanData);
    return combinePromptWithKanban(block, todosPromptBody);
  }, [kanbanData, todosPromptBody]);

  /** Load prompt content when user selects an existing prompt from dropdown. */
  const onTodosPromptSelect = useCallback((value: string) => {
    if (value === "custom" || value === "") {
      setTodosPromptSelectedId("custom");
      return;
    }
    const numId = Number(value);
    if (!Number.isInteger(numId)) return;
    setTodosPromptSelectedId(numId);
    setTodosPromptContentLoading(true);
    fetch(`/api/data/prompts/${numId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((record: { content?: string } | null) => {
        setTodosPromptBody(record?.content ?? "");
      })
      .catch(() => setTodosPromptBody(""))
      .finally(() => setTodosPromptContentLoading(false));
  }, []);

  const copyTodosPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(todosCombinedPrompt);
      setTodosPromptCopied(true);
      toast.success("Prompt (with Kanban context) copied to clipboard.");
      setTimeout(() => setTodosPromptCopied(false), 2000);
    } catch {
      toast.error("Could not copy.");
    }
  }, [todosCombinedPrompt]);

  const saveTodosPromptToCursor = useCallback(async () => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    setTodosPromptSaving(true);
    try {
      await invoke("write_spec_file", {
        projectPath: project.repoPath.trim(),
        relativePath: `.cursor/${ANALYSIS_PROMPT_FILENAME}`,
        content: todosCombinedPrompt,
      });
      toast.success("Prompt saved to .cursor/analysis-prompt.md (includes Kanban features & tickets).");
      refetchProject();
    } finally {
      setTodosPromptSaving(false);
    }
  }, [project?.repoPath, todosCombinedPrompt, refetchProject]);

  const runTodosPromptInCursor = useCallback(async () => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    setTodosPromptSaving(true);
    try {
      await invoke("write_spec_file", {
        projectPath: project.repoPath.trim(),
        relativePath: `.cursor/${ANALYSIS_PROMPT_FILENAME}`,
        content: todosCombinedPrompt,
      });
      await invoke("run_analysis_script", { projectPath: project.repoPath.trim() });
      toast.success("Prompt saved and analysis script started. Cursor will run the prompt; results in .cursor/");
      refetchProject();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to run analysis script");
    } finally {
      setTodosPromptSaving(false);
    }
  }, [project?.repoPath, todosCombinedPrompt, refetchProject]);

  /** Save current prompt text as a new prompt (Add custom prompt). */
  const handleAddPromptSave = useCallback(async () => {
    const title = addPromptTitle.trim();
    if (!title) {
      toast.error("Enter a title for the prompt.");
      return;
    }
    setAddPromptSaving(true);
    try {
      const res = await fetch("/api/data/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: todosPromptBody }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      refetchPromptsList();
      setAddPromptDialogOpen(false);
      setAddPromptTitle("");
      toast.success("Prompt added. Select it from Source or continue editing.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save prompt");
    } finally {
      setAddPromptSaving(false);
    }
  }, [addPromptTitle, todosPromptBody, refetchPromptsList]);

  /** Generate Cursor prompt from current Kanban (features + tickets) via AI. */
  const handleGeneratePromptFromKanban = useCallback(async () => {
    const pendingFeatures = kanbanData.features.filter((f) => !f.done);
    const pendingTickets = kanbanData.tickets.filter((t) => !t.done);
    if (pendingFeatures.length === 0 && pendingTickets.length === 0) {
      toast.error("No pending features or tickets. Run Sync or add items in features.md and tickets.md.");
      return;
    }
    setGeneratePromptLoading(true);
    try {
      const res = await fetch("/api/generate-prompt-from-kanban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: kanbanData.features,
          tickets: kanbanData.tickets,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const data = await res.json();
      setTodosPromptBody(data.content ?? "");
      const title = data.title ?? "Generated prompt";
      toast.success(`Generated: "${title}". Edit as needed and set Active.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate prompt");
    } finally {
      setGeneratePromptLoading(false);
    }
  }, [kanbanData.features, kanbanData.tickets]);

  /** Check if .cursor/features.md and .cursor/tickets.md are correlating and up to date (see .cursor/sync.md). */
  const runSync = useCallback(() => {
    if (!id || !project) return;
    setSyncLoading(true);
    setSyncStatus(null);
    const pathTickets = ".cursor/tickets.md";
    const pathFeatures = ".cursor/features.md";
    const fetchFile = (path: string): Promise<string> => {
      if (isTauri() && project.repoPath?.trim()) {
        return invoke<string>("read_file_text_under_root", { root: project.repoPath!.trim(), path })
          .then((c) => c ?? "");
      }
      return fetch(`/api/data/projects/${id}/file?path=${encodeURIComponent(path)}`)
        .then((res) => {
          if (res.ok) return res.text();
          if (res.status === 404) return "";
          return res.json().then((j) => Promise.reject(new Error((j as { error?: string }).error ?? res.statusText)));
        });
    };
    Promise.all([fetchFile(pathFeatures), fetchFile(pathTickets)])
      .then(([featuresContent, ticketsContent]) => {
        const data = parseTodosToKanban(featuresContent, ticketsContent);
        // If any feature is done, mark its ticket refs as done in tickets.md so the two files stay in sync.
        const ticketNumbersFromDoneFeatures = data.features
          .filter((f) => f.done)
          .flatMap((f) => f.ticketRefs);
        let finalTicketsContent = ticketsContent;
        if (ticketNumbersFromDoneFeatures.length > 0) {
          const updatedTickets = markTicketsDone(ticketsContent, ticketNumbersFromDoneFeatures);
          if (updatedTickets !== ticketsContent && isTauri() && project.repoPath?.trim()) {
            finalTicketsContent = updatedTickets;
            invoke("write_spec_file", {
              projectPath: project.repoPath!.trim(),
              relativePath: pathTickets,
              content: updatedTickets,
            }).catch(() => {});
          } else if (updatedTickets !== ticketsContent) {
            finalTicketsContent = updatedTickets;
          }
        }
        setCursorFeaturesMd(featuresContent);
        setCursorTicketsMd(finalTicketsContent);
        if (isTauri() && project.repoPath?.trim()) {
          const json = JSON.stringify(
            parseTodosToKanban(featuresContent, finalTicketsContent),
            null,
            2
          );
          invoke("write_spec_file", {
            projectPath: project.repoPath!.trim(),
            relativePath: ".cursor/todos-kanban.json",
            content: json,
          }).catch(() => {});
        }
        if (finalTicketsContent.trim() === "" && featuresContent.trim() === "") {
          setSyncStatus({ ok: true, message: "No features.md or tickets.md yet; nothing to sync.", details: [] });
          return;
        }
        if (finalTicketsContent.trim() === "") {
          setSyncStatus({ ok: false, message: "tickets.md is missing or empty.", details: ["Create .cursor/tickets.md (e.g. via Analysis: Tickets) then add features.md to match."] });
          return;
        }
        if (featuresContent.trim() === "") {
          setSyncStatus({ ok: false, message: "features.md is missing or empty.", details: ["Create .cursor/features.md derived from tickets.md (e.g. run Analysis: Tickets to generate both)."] });
          return;
        }
        const validation = validateFeaturesTicketsCorrelation(featuresContent, finalTicketsContent);
        const details = [...validation.details];
        if (finalTicketsContent !== ticketsContent && ticketNumbersFromDoneFeatures.length > 0) {
          details.unshift(
            `Updated tickets.md: marked #${[...new Set(ticketNumbersFromDoneFeatures)].sort((a, b) => a - b).join(", #")} as done to match done features.`
          );
        }
        const ok = validation.ok;
        setSyncStatus({
          ok,
          message: ok
            ? finalTicketsContent !== ticketsContent
              ? "features.md and tickets.md synced; tickets updated to match done features."
              : validation.message
            : validation.message,
          details,
        });
      })
      .catch((e) => {
        setSyncStatus({
          ok: false,
          message: "Could not read repo files.",
          details: [e instanceof Error ? e.message : String(e)],
        });
      })
      .finally(() => setSyncLoading(false));
  }, [id, project]);

  /** Archive .cursor/tickets.md or .cursor/features.md to .cursor/legacy/{file}-YYYY-MM-DD.md and create new file (Tauri only). */
  const archiveCursorFile = useCallback(
    async (kind: "tickets" | "features") => {
      if (!isTauri() || !project?.repoPath?.trim()) return;
      setArchiveLoading(kind);
      try {
        await invoke("archive_cursor_file", {
          projectPath: project.repoPath!.trim(),
          fileKind: kind,
        });
        loadCursorTicketsMd();
        loadCursorFeaturesMd();
        toast.success(`Archived to .cursor/legacy/${kind}-YYYY-MM-DD.md and created new .cursor/${kind}.md`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Archive failed");
      } finally {
        setArchiveLoading(null);
      }
    },
    [project?.repoPath, loadCursorTicketsMd, loadCursorFeaturesMd]
  );

  /** Archive both .cursor/tickets.md and .cursor/features.md (Tauri only). */
  const archiveBothCursorFiles = useCallback(async () => {
    if (!isTauri() || !project?.repoPath?.trim()) return;
    setArchiveLoading("both");
    try {
      await invoke("archive_cursor_file", {
        projectPath: project.repoPath!.trim(),
        fileKind: "tickets",
      });
      await invoke("archive_cursor_file", {
        projectPath: project.repoPath!.trim(),
        fileKind: "features",
      });
      loadCursorTicketsMd();
      loadCursorFeaturesMd();
      toast.success("Archived both tickets.md and features.md to .cursor/legacy/ and created new files.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Archive failed");
    } finally {
      setArchiveLoading(null);
    }
  }, [project?.repoPath, loadCursorTicketsMd, loadCursorFeaturesMd]);

  /** When the Implement Features run exits: mark feature and its tickets done in .cursor files, then run next or stop. Uses repo path of the project details that was open when Implement Features started. */
  useEffect(() => {
    if (!implementFeaturesRunId || !isTauri()) return;
    const repoPath = implementRepoPathRef.current?.trim();
    if (!repoPath) return;
    const run = runningRuns.find((r) => r.runId === implementFeaturesRunId);
    if (!run || run.status !== "done") return;
    setImplementFeaturesRunId(null);
    const feature = implementingFeatureRef.current;
    if (!feature) return;
    const ticketsMd = cursorTicketsMd ?? "";
    const featuresMd = cursorFeaturesMd ?? "";
    const updatedTickets = markTicketsDone(ticketsMd, feature.ticketRefs);
    const updatedFeatures = markFeatureDoneByTicketRefs(featuresMd, feature.ticketRefs);
    invoke("write_spec_file", {
      projectPath: repoPath,
      relativePath: ".cursor/tickets.md",
      content: updatedTickets,
    })
      .then(() =>
        invoke("write_spec_file", {
          projectPath: repoPath,
          relativePath: ".cursor/features.md",
          content: updatedFeatures,
        })
      )
      .then(() => {
        setCursorTicketsMd(updatedTickets);
        setCursorFeaturesMd(updatedFeatures);
        implementingFeatureRef.current = null;
        toast.success(`Implemented: ${feature.title}`);
        const nextData = parseTodosToKanban(updatedFeatures, updatedTickets);
        const nextFeature = nextData.features.find((f) => !f.done);
        if (nextFeature) {
          implementingFeatureRef.current = nextFeature;
          const combinedPrompt = implementActivePromptRef.current;
          if (!combinedPrompt.trim()) {
            setImplementFeaturesRunning(false);
            implementRepoPathRef.current = null;
            implementActivePromptRef.current = "";
            toast.error("No active prompt; stopping Implement Features.");
            return;
          }
          runWithParams({
            combinedPrompt,
            activeProjects: [repoPath],
            runLabel: `Implement: ${nextFeature.title}`,
          }).then((rid) => {
            if (rid) setImplementFeaturesRunId(rid);
            else setImplementFeaturesRunning(false);
          });
        } else {
          setImplementFeaturesRunning(false);
          implementRepoPathRef.current = null;
          implementActivePromptRef.current = "";
          toast.success("All features implemented.");
        }
      })
      .catch((e) => {
        implementingFeatureRef.current = null;
        setImplementFeaturesRunId(null);
        setImplementFeaturesRunning(false);
        implementRepoPathRef.current = null;
        implementActivePromptRef.current = "";
        toast.error(e instanceof Error ? e.message : "Failed to update tickets/features");
      });
  }, [implementFeaturesRunId, runningRuns, cursorTicketsMd, cursorFeaturesMd, runWithParams]);

  /** Start Implement Features: run script for top To-do feature using the active prompt (Todo tab). Combines prompt + Kanban features & tickets. */
  const startImplementFeatures = useCallback(() => {
    const repoPath = project?.repoPath?.trim();
    if (!repoPath || !isTauri()) {
      toast.error("Implement Features requires Tauri and a project repo path.");
      return;
    }
    const todoFeatures = kanbanData.features.filter((f) => !f.done);
    const first = todoFeatures[0];
    if (!first) {
      toast.success("All features already done.");
      return;
    }
    if (!todosPromptIsActive) {
      toast.error("Set a prompt as active first (Todos tab → Prompt card → Active).");
      return;
    }
    const combined = todosCombinedPrompt.trim();
    if (!combined) {
      toast.error("Active prompt is empty. Add prompt text or select a prompt, then click Active.");
      return;
    }
    setImplementFeaturesRunning(true);
    implementingFeatureRef.current = first;
    implementRepoPathRef.current = repoPath;
    implementActivePromptRef.current = combined;
    runWithParams({
      combinedPrompt: combined,
      activeProjects: [repoPath],
      runLabel: `Implement: ${first.title}`,
    }).then((rid) => {
      if (rid) setImplementFeaturesRunId(rid);
      else {
        setImplementFeaturesRunning(false);
        const err = useRunStore.getState().error;
        if (err) toast.error("Implement Features failed: " + err);
      }
    });
  }, [project?.repoPath, kanbanData.features, todosPromptIsActive, todosCombinedPrompt, runWithParams]);

  const togglePrompt = useCallback((pid: number) => {
    setPromptIds((prev) => (prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]));
  }, []);
  const toggleTicket = useCallback((tid: string) => {
    setTicketIds((prev) => (prev.includes(tid) ? prev.filter((id) => id !== tid) : [...prev, tid]));
  }, []);
  const toggleFeature = useCallback((fid: string) => {
    setFeatureIds((prev) => (prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid]));
  }, []);
  const toggleIdea = useCallback((iid: number) => {
    setIdeaIds((prev) => (prev.includes(iid) ? prev.filter((id) => id !== iid) : [...prev, iid]));
  }, []);
  const toggleDesign = useCallback((did: string) => {
    setDesignIds((prev) => (prev.includes(did) ? prev.filter((id) => id !== did) : [...prev, did]));
  }, []);
  const toggleArchitecture = useCallback((aid: string) => {
    setArchitectureIds((prev) => (prev.includes(aid) ? prev.filter((id) => id !== aid) : [...prev, aid]));
  }, []);

  const specFiles = Array.isArray(project?.specFiles) ? project.specFiles : [];
  const specFilesTickets = Array.isArray(project?.specFilesTickets) ? project.specFilesTickets : [];
  const specFilesFeatures = Array.isArray(project?.specFilesFeatures) ? project.specFilesFeatures : [];
  const addToSpec = useCallback(
    async (file: { name: string; path: string }) => {
      if (!id || !project || specFiles.some((f) => f.path === file.path)) return;
      setSpecFilesSaving(true);
      try {
        await updateProject(id, {
          ...project,
          specFiles: [...specFiles, file],
        });
        refetchProject();
      } finally {
        setSpecFilesSaving(false);
      }
    },
    [id, project, specFiles, refetchProject]
  );
  const removeFromSpec = useCallback(
    async (path: string) => {
      if (!id || !project) return;
      const next = specFiles.filter((f) => f.path !== path);
      setSpecFilesSaving(true);
      try {
        await updateProject(id, { ...project, specFiles: next });
        refetchProject();
      } finally {
        setSpecFilesSaving(false);
      }
    },
    [id, project, specFiles, refetchProject]
  );

  const addGeneratedToSpec = useCallback(
    async (file: { name: string; path: string; content: string }) => {
      if (!id || !project || specFiles.some((f) => f.path === file.path)) return;
      setSpecFilesSaving(true);
      try {
        await updateProject(id, {
          ...project,
          specFiles: [...specFiles, { ...file, content: file.content }],
        });
        refetchProject();
      } finally {
        setSpecFilesSaving(false);
      }
    },
    [id, project, specFiles, refetchProject]
  );

  const openSpecFilePreview = useCallback(
    async (f: { name: string; path: string; content?: string }) => {
      setSpecPreviewError(null);
      if (f.content != null && f.content !== "") {
        setSpecPreview({ path: f.path, name: f.name, content: f.content });
        return;
      }
      // Show panel immediately so user sees loading state (panel only renders when specPreview is set)
      setSpecPreview({ path: f.path, name: f.name, content: "" });
      setSpecPreviewLoading(true);
      try {
        let content: string;
        if (isTauri()) {
          // Spec files may live under the project's repo path (e.g. .cursor/DESIGN.md), not the app root
          const repoPath = project?.repoPath?.trim();
          if (repoPath) {
            content = await invoke<string>("read_file_text_under_root", { root: repoPath, path: f.path });
          } else {
            content = await invoke<string>("read_file_text", { path: f.path });
          }
        } else {
          const res = await fetch(`/api/data/file?path=${encodeURIComponent(f.path)}`);
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error ?? "Failed to load file");
          }
          content = await res.text();
        }
        setSpecPreview({ path: f.path, name: f.name, content });
      } catch (e) {
        setSpecPreviewError(e instanceof Error ? e.message : String(e));
        // Keep specPreview so the panel stays visible and shows the error
      } finally {
        setSpecPreviewLoading(false);
      }
    },
    [project?.repoPath]
  );

  const closeSpecPreview = useCallback(() => {
    setSpecPreview(null);
    setSpecPreviewError(null);
  }, []);

  const handleExportDesignToSpec = useCallback(
    async (designId: string) => {
      const path = `.cursor/design-${designId}.md`;
      if (specFiles.some((f) => f.path === path)) return;
      setDesignExportingId(designId);
      try {
        const res = await fetch(`/api/data/designs/${designId}`);
        if (!res.ok) throw new Error("Design not found");
        const record = await res.json();
        const content = designRecordToMarkdown(record);
        await addGeneratedToSpec({
          name: `design-${designId}.md`,
          path,
          content,
        });
      } finally {
        setDesignExportingId(null);
      }
    },
    [specFiles, addGeneratedToSpec]
  );

  const handleExportArchitectureToSpec = useCallback(
    async (architectureId: string) => {
      const path = `.cursor/architecture-${architectureId}.md`;
      if (specFiles.some((f) => f.path === path)) return;
      setArchitectureExportingId(architectureId);
      try {
        const res = await fetch(`/api/data/architectures/${architectureId}`);
        if (!res.ok) throw new Error("Architecture not found");
        const record = await res.json();
        const content = architectureRecordToMarkdown(record);
        await addGeneratedToSpec({
          name: `architecture-${architectureId}.md`,
          path,
          content,
        });
      } finally {
        setArchitectureExportingId(null);
      }
    },
    [specFiles, addGeneratedToSpec]
  );

  const handleExportFeatureToSpec = useCallback(
    async (feature: ResolvedProject["features"][number]) => {
      const path = `.cursor/feature-${feature.id}.md`;
      if (specFiles.some((f) => f.path === path)) return;
      setFeatureExportingId(feature.id);
      try {
        const content = featureToMarkdown(feature);
        await addGeneratedToSpec({
          name: `feature-${feature.id}.md`,
          path,
          content,
        });
      } finally {
        setFeatureExportingId(null);
      }
    },
    [specFiles, addGeneratedToSpec]
  );

  const downloadAllSpecFilesToCursor = useCallback(async () => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    const withContent = specFiles.filter((f): f is typeof f & { content: string } => Boolean(f.content));
    if (withContent.length === 0) return;
    setDownloadAllToCursorLoading(true);
    try {
      for (const f of withContent) {
        await invoke("write_spec_file", {
          projectPath: project.repoPath.trim(),
          relativePath: f.path,
          content: f.content,
        });
      }
      refetchProject();
    } finally {
      setDownloadAllToCursorLoading(false);
    }
  }, [project?.repoPath, specFiles, refetchProject]);

  const getEntityCategory = useCallback(
    (kind: keyof ProjectEntityCategories, entityId: string | number): EntityCategory => {
      const map = entityCategories[kind];
      if (!map || typeof map !== "object") return {};
      const key = typeof entityId === "number" ? String(entityId) : entityId;
      return map[key] ?? {};
    },
    [entityCategories]
  );

  const setEntityCategoryField = useCallback(
    (kind: keyof ProjectEntityCategories, entityId: string | number, field: keyof EntityCategory, value: string) => {
      const key = typeof entityId === "number" ? String(entityId) : entityId;
      setEntityCategories((prev) => {
        const next = { ...prev };
        const map = { ...(next[kind] ?? {}), [key]: { ...(next[kind]?.[key] ?? {}), [field]: value.trim() || undefined } };
        next[kind] = map;
        return next;
      });
    },
    []
  );

  const openDetailModal = useCallback((item: DetailModalItem) => {
    setDetailModalItem(item);
  }, []);

  const openPromptById = useCallback(
    (promptId: number) => {
      fetch(`/api/data/prompts/${promptId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((full) => {
          if (full) openDetailModal({ kind: "prompt", data: { ...full, id: Number(full.id), title: full.title ?? "", content: full.content } });
        })
        .catch(() => {});
    },
    [openDetailModal]
  );

  const openAnalysisDialog = useCallback(
    (kind: "design" | "architecture" | "tickets" | "features" | "tickets-and-features" | "full") => {
      const projectName = project?.name ?? "This project";
      setAnalysisDialogPrompts(null);
      if (kind === "full") {
        setAnalysisDialogTitle("Analysis");
        setAnalysisDialogPrompt(ANALYSIS_PROMPT);
      } else if (kind === "design") {
        setAnalysisDialogTitle("Analysis: Design");
        setAnalysisDialogPrompt(
          buildDesignAnalysisPrompt({
            projectName,
            designNames: (project?.designs ?? []).map((d) => d.name),
          })
        );
      } else if (kind === "architecture") {
        setAnalysisDialogTitle("Analysis: Architecture");
        setAnalysisDialogPrompt(
          buildArchitectureAnalysisPrompt({
            projectName,
            architectureNames: (project?.architectures ?? []).map((a) => a.name),
          })
        );
      } else if (kind === "tickets") {
        setAnalysisDialogTitle("Analysis: Tickets");
        setAnalysisDialogPrompt(
          buildTicketsAnalysisPrompt({
            projectName,
            ticketSummaries: (project?.tickets ?? []).map((t) => ({ title: t.title, status: t.status })),
          })
        );
      } else if (kind === "features") {
        setAnalysisDialogTitle("Analysis: Features");
        setAnalysisDialogPrompt(
          buildFeaturesAnalysisPrompt({
            projectName,
            featureTitles: (project?.features ?? []).map((f) => f.title),
            ticketsMdContent: cursorTicketsMd ?? undefined,
          })
        );
      } else if (kind === "tickets-and-features") {
        setAnalysisDialogTitle("Analysis: Tickets & Features");
        setAnalysisDialogPrompts(null);
        setAnalysisDialogPrompt(
          buildTicketsAnalysisPrompt({
            projectName,
            ticketSummaries: (project?.tickets ?? []).map((t) => ({ title: t.title, status: t.status })),
          })
        );
      }
      setAnalysisCopied(false);
    },
    [project, cursorTicketsMd]
  );

  const saveAnalysisPromptToCursor = useCallback(async () => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    const content =
      analysisDialogPrompts?.length ? analysisDialogPrompts[0] : (analysisDialogPrompt ?? ANALYSIS_PROMPT);
    setSavingPromptToCursor(true);
    try {
      await invoke("write_spec_file", {
        projectPath: project.repoPath.trim(),
        relativePath: `.cursor/${ANALYSIS_PROMPT_FILENAME}`,
        content,
      });
      refetchProject();
      toast.success("Prompt saved to .cursor/analysis-prompt.md");
    } finally {
      setSavingPromptToCursor(false);
    }
  }, [project?.repoPath, analysisDialogPrompt, analysisDialogPrompts, refetchProject]);

  const runAnalysisInCursor = useCallback(async () => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    const prompt = analysisDialogPrompt ?? ANALYSIS_PROMPT;
    setSavingPromptToCursor(true);
    try {
      const projectPath = project.repoPath.trim();
      await invoke("write_spec_file", {
        projectPath,
        relativePath: `.cursor/${ANALYSIS_PROMPT_FILENAME}`,
        content: prompt,
      });
      await invoke<{ run_id: string }>("run_analysis_script", { projectPath });
      toast.success(
        "Analysis script started. Cursor will open once and create both .cursor/tickets.md and .cursor/features.md. When done, click Sync to load the Kanban."
      );
      refetchProject();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to run analysis script");
    } finally {
      setSavingPromptToCursor(false);
    }
  }, [project?.repoPath, analysisDialogPrompt, refetchProject]);

  const closeAnalysisDialog = useCallback(() => {
    setAnalysisDialogPrompt(null);
    setAnalysisDialogPrompts(null);
    setAnalysisDialogTitle("");
    setAnalysisCopied(false);
  }, []);

  // Defer close handlers so they never run during render (avoids "Cannot update HotReload while rendering ProjectDetailsPage").
  const onDetailModalOpenChange = useCallback((open: boolean) => {
    if (!open) queueMicrotask(() => setDetailModalItem(null));
  }, []);
  const onBestPracticeOpenChange = useCallback((open: boolean) => {
    queueMicrotask(() => setBestPracticeOpen(open));
  }, []);
  const onAnalysisDialogOpenChange = useCallback((open: boolean) => {
    if (!open) queueMicrotask(closeAnalysisDialog);
  }, [closeAnalysisDialog]);

  const copyAnalysisPrompt = useCallback(async () => {
    if (!analysisDialogPrompt) return;
    try {
      await navigator.clipboard.writeText(analysisDialogPrompt);
      setAnalysisCopied(true);
      setTimeout(() => setAnalysisCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [analysisDialogPrompt]);

  const SPEC_FILE_DRAG_TYPE = "application/x-project-spec-file";

  const handleSpecFileDrop = useCallback(
    async (targetCard: "designs" | "architectures" | "features", path: string, name: string) => {
      if (!id || !project) return;
      setSpecDropLoading(true);
      try {
        const baseName = name.replace(/\.md$/i, "") || "spec";

        if (targetCard === "designs") {
          const designMatch = path.match(/design-([a-f0-9-]{36})\.md$/i);
          let designId: string;
          if (designMatch && designMatch[1]) {
            designId = designMatch[1];
            const exists = designsList.some((d) => d.id === designId);
            if (!exists) {
              toast.error("Design not found in library. Save it from the Design page first.");
              return;
            }
          } else {
            const res = await fetch("/api/data/designs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: baseName,
                config: createDefaultDesignConfig("landing"),
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error ?? "Failed to create design");
            }
            const created = await res.json();
            designId = created.id;
            toast.success(`Design "${baseName}" created and linked.`);
          }
          const nextDesignIds = designIds.includes(designId) ? designIds : [...designIds, designId];
          await updateProject(id, { ...project, designIds: nextDesignIds });
          setDesignIds(nextDesignIds);
          if (!designMatch) refetchProject();
          else toast.success("Design linked to project.");
        } else if (targetCard === "architectures") {
          const archMatch = path.match(/architecture-([a-f0-9-]{36})\.md$/i);
          let architectureId: string;
          if (archMatch && archMatch[1]) {
            architectureId = archMatch[1];
            const exists = architecturesList.some((a) => a.id === architectureId);
            if (!exists) {
              toast.error("Architecture not found in library. Add it from the Architecture page first.");
              return;
            }
          } else {
            const res = await fetch("/api/data/architectures", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: baseName,
                category: "scenario",
                description: `From spec file: ${path}`,
                practices: "",
                scenarios: "",
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error ?? "Failed to create architecture");
            }
            const created = await res.json();
            architectureId = created.id;
            toast.success(`Architecture "${baseName}" created and linked.`);
          }
          const nextArchIds = architectureIds.includes(architectureId) ? architectureIds : [...architectureIds, architectureId];
          await updateProject(id, { ...project, architectureIds: nextArchIds });
          setArchitectureIds(nextArchIds);
          if (!archMatch) refetchProject();
          else toast.success("Architecture linked to project.");
        } else if (targetCard === "features") {
          const featureMatch = path.match(/feature-([a-f0-9-]{36})\.md$/i);
          if (!featureMatch || !featureMatch[1]) {
            toast.info("Drop a feature-<id>.md file from the spec to link an existing feature.");
            return;
          }
          const featureId = featureMatch[1];
          const exists = featuresList.some((f) => f.id === featureId);
          if (!exists) {
            toast.error("Feature not found. Link it from the Feature tab first.");
            return;
          }
          const nextFeatureIds = featureIds.includes(featureId) ? featureIds : [...featureIds, featureId];
          await updateProject(id, { ...project, featureIds: nextFeatureIds });
          setFeatureIds(nextFeatureIds);
          refetchProject();
          toast.success("Feature linked to project.");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to link from spec file");
      } finally {
        setSpecDropLoading(false);
      }
    },
    [
      id,
      project,
      designIds,
      architectureIds,
      featureIds,
      designsList,
      architecturesList,
      featuresList,
      refetchProject,
    ]
  );

  /** Link a spec file (by path) to the Tickets or Features card. Adds to specFiles if not already there. */
  const handleSpecFileLinkToCard = useCallback(
    async (target: "tickets-spec" | "features-spec", path: string, name: string) => {
      if (!id || !project) return;
      setSpecDropLoading(true);
      try {
        let nextSpecFiles = specFiles;
        if (!specFiles.some((f) => f.path === path)) {
          nextSpecFiles = [...specFiles, { name, path }];
        }
        if (target === "tickets-spec") {
          const next = specFilesTickets.includes(path) ? specFilesTickets : [...specFilesTickets, path];
          await updateProject(id, { ...project, specFiles: nextSpecFiles, specFilesTickets: next });
          setProject((p) => (p ? { ...p, specFiles: nextSpecFiles, specFilesTickets: next } : null));
          toast.success(`"${name}" linked to Tickets card.`);
        } else {
          const next = specFilesFeatures.includes(path) ? specFilesFeatures : [...specFilesFeatures, path];
          await updateProject(id, { ...project, specFiles: nextSpecFiles, specFilesFeatures: next });
          setProject((p) => (p ? { ...p, specFiles: nextSpecFiles, specFilesFeatures: next } : null));
          toast.success(`"${name}" linked to Features card.`);
        }
        refetchProject();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to link spec file");
      } finally {
        setSpecDropLoading(false);
      }
    },
    [id, project, specFiles, specFilesTickets, specFilesFeatures, refetchProject]
  );

  const removeSpecFileFromTickets = useCallback(
    async (path: string) => {
      if (!id || !project) return;
      const next = specFilesTickets.filter((p) => p !== path);
      setSpecDropLoading(true);
      try {
        await updateProject(id, { ...project, specFilesTickets: next });
        setProject((p) => (p ? { ...p, specFilesTickets: next } : null));
        refetchProject();
        toast.success("Removed from Tickets card.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update");
      } finally {
        setSpecDropLoading(false);
      }
    },
    [id, project, specFilesTickets, refetchProject]
  );

  const removeSpecFileFromFeatures = useCallback(
    async (path: string) => {
      if (!id || !project) return;
      const next = specFilesFeatures.filter((p) => p !== path);
      setSpecDropLoading(true);
      try {
        await updateProject(id, { ...project, specFilesFeatures: next });
        setProject((p) => (p ? { ...p, specFilesFeatures: next } : null));
        refetchProject();
        toast.success("Removed from Features card.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update");
      } finally {
        setSpecDropLoading(false);
      }
    },
    [id, project, specFilesFeatures, refetchProject]
  );

  const categoryBadges = (e: EntityCategory) => (
    <span className="flex flex-wrap gap-1 mt-1">
      {CATEGORY_FIELDS.map(
        (f) =>
          e[f] && (
            <Badge key={f} variant="secondary" className="text-xs font-normal">
              {f}: {e[f]}
            </Badge>
          )
      )}
    </span>
  );

  const saveLinks = async () => {
    if (!id || !project) return;
    setLinksSaving(true);
    try {
      await updateProject(id, {
        name: project.name,
        description: project.description,
        repoPath: project.repoPath,
        promptIds,
        ticketIds,
        featureIds,
        ideaIds,
        designIds,
        architectureIds,
        entityCategories,
      });
      refetchProject();
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLinksSaving(false);
    }
  };

  const saveProjectName = useCallback(
    async (value: string) => {
      if (!id || !project || value.trim() === "" || value === project.name) {
        setEditingTitle(false);
        setSavingField(null);
        return;
      }
      setSavingField("title");
      try {
        await updateProject(id, { ...project, name: value.trim() });
        setProject((p) => (p ? { ...p, name: value.trim() } : null));
        refetchProject();
        toast.success("Project name updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update name");
      } finally {
        setSavingField(null);
        setEditingTitle(false);
      }
    },
    [id, project, refetchProject]
  );

  const saveProjectPath = useCallback(
    async (value: string) => {
      if (!id || !project) {
        setEditingPath(false);
        setSavingField(null);
        return;
      }
      const trimmed = value.trim();
      if (trimmed === (project.repoPath ?? "")) {
        setEditingPath(false);
        setSavingField(null);
        return;
      }
      setSavingField("path");
      try {
        await updateProject(id, { ...project, repoPath: trimmed || undefined });
        setProject((p) => (p ? { ...p, repoPath: trimmed || undefined } : null));
        refetchProject();
        toast.success("Repo path updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update path");
      } finally {
        setSavingField(null);
        setEditingPath(false);
      }
    },
    [id, project, refetchProject]
  );

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);
  useEffect(() => {
    if (editingPath) pathInputRef.current?.focus();
  }, [editingPath]);

  const exportAsJson = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const data = await getProjectExport(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${project?.name ?? id}.json`.replace(/[^a-zA-Z0-9._-]/g, "_");
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } finally {
      setExporting(false);
    }
  };

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Missing project id.</p>
        <Button asChild variant="outline">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error || "Project not found."}</p>
        <Button asChild variant="outline">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const renderDetailModalContent = () => {
    if (!detailModalItem) return null;
    const { kind, data } = detailModalItem;
    const cat = "phase" in data ? categoryBadges(data as EntityCategory) : null;
    switch (kind) {
      case "prompt": {
        const p = data as ResolvedProject["prompts"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{p.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{p.title || `#${p.id}`}</p>
            </div>
            {p.content != null && p.content !== "" && (
              <div>
                <span className="text-muted-foreground">Content</span>
                <pre className="mt-1 rounded border bg-muted/30 p-3 text-xs whitespace-pre-wrap max-h-[200px] overflow-auto">
                  {p.content}
                </pre>
              </div>
            )}
            {cat}
          </div>
        );
      }
      case "ticket": {
        const t = data as ResolvedProject["tickets"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{t.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{t.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p><Badge variant="outline">{t.status}</Badge></p>
            </div>
            {t.description != null && t.description !== "" && (
              <div>
                <span className="text-muted-foreground">Description</span>
                <p className="mt-1 whitespace-pre-wrap">{t.description}</p>
              </div>
            )}
            {cat}
          </div>
        );
      }
      case "feature": {
        const f = data as ResolvedProject["features"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{f.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{f.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Prompts</span>
              <p className="font-mono text-xs">{(f.prompt_ids ?? []).join(", ") || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Project paths</span>
              <p className="text-xs">{(f.project_paths ?? []).join(", ") || "—"}</p>
            </div>
            {cat}
          </div>
        );
      }
      case "idea": {
        const i = data as ResolvedProject["ideas"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{i.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{i.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Category</span>
              <p><Badge variant="secondary">{i.category}</Badge></p>
            </div>
            {i.description != null && i.description !== "" && (
              <div>
                <span className="text-muted-foreground">Description</span>
                <p className="mt-1 whitespace-pre-wrap">{i.description}</p>
              </div>
            )}
            {cat}
          </div>
        );
      }
      case "design": {
        const d = data as NonNullable<ResolvedProject["designs"]>[number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{d.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium">{d.name}</p>
            </div>
            {cat}
          </div>
        );
      }
      case "architecture": {
        const a = data as NonNullable<ResolvedProject["architectures"]>[number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{a.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium">{a.name}</p>
            </div>
            {cat}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const detailModalTitle = detailModalItem
    ? detailModalItem.kind.charAt(0).toUpperCase() + detailModalItem.kind.slice(1) + " details"
    : "";

  return (
    <div className="space-y-6">
      <Dialog open={!!detailModalItem} onOpenChange={onDetailModalOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailModalTitle}</DialogTitle>
          </DialogHeader>
          {renderDetailModalContent()}
        </DialogContent>
      </Dialog>

      <Dialog open={bestPracticeOpen} onOpenChange={onBestPracticeOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Best practice .cursor structure</DialogTitle>
            <DialogDescription>
              Recommended files and folders when starting a project. For .md files, add the suggested content so AI agents and tools can use them.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 rounded border p-3 -mx-1">
            <ul className="space-y-3 text-sm">
              {CURSOR_BEST_PRACTICE_FILES.map((entry) => (
                <li key={entry.path} className="space-y-1">
                  <span className="font-mono text-foreground bg-muted/60 px-1.5 py-0.5 rounded break-all">
                    {entry.path}
                  </span>
                  {entry.description != null && (
                    <p className="text-muted-foreground pl-1 border-l-2 border-muted">
                      {entry.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!(analysisDialogPrompt || (analysisDialogPrompts && analysisDialogPrompts.length > 0))}
        onOpenChange={onAnalysisDialogOpenChange}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{analysisDialogTitle}</DialogTitle>
            <DialogDescription>
              {(analysisDialogPrompts?.length ?? 0) >= 2
                ? "Run both prompts in Cursor one after the other (tickets first, then features). Copy saves both with a separator."
                : "Copy this prompt and run it in Cursor (in this project's repo). The AI will generate documents in the project's .cursor folder."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 rounded border p-3 text-sm font-mono whitespace-pre-wrap space-y-4">
            {(analysisDialogPrompts?.length ?? 0) >= 2 && analysisDialogPrompts ? (
              <>
                <div>
                  <p className="font-semibold text-foreground mb-1">1. Tickets (creates .cursor/tickets.md &amp; .cursor/features.md)</p>
                  <pre className="whitespace-pre-wrap text-xs">{analysisDialogPrompts[0]}</pre>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">2. Features (updates .cursor/features.md)</p>
                  <pre className="whitespace-pre-wrap text-xs">{analysisDialogPrompts[1]}</pre>
                </div>
              </>
            ) : (
              (analysisDialogPrompt ?? "")
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-2 shrink-0 flex-wrap">
            <Button variant="outline" size="sm" onClick={closeAnalysisDialog}>
              Close
            </Button>
            <Button variant="outline" size="sm" onClick={copyAnalysisPrompt}>
              <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />
              {analysisCopied ? "Copied" : "Copy to clipboard"}
            </Button>
            {isTauri() && project?.repoPath?.trim() && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveAnalysisPromptToCursor}
                  disabled={savingPromptToCursor}
                  title="Write prompt to project's .cursor/analysis-prompt.md only"
                >
                  {savingPromptToCursor ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                  Save prompt to .cursor
                </Button>
                <Button
                  size="sm"
                  onClick={runAnalysisInCursor}
                  disabled={savingPromptToCursor}
                  title="Save prompt to .cursor and run script: open Cursor, paste prompt, submit. Results saved in .cursor/"
                >
                  {savingPromptToCursor ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileSearch className="h-3.5 w-3.5 mr-1.5" />}
                  Run in Cursor
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <Input
                ref={titleInputRef}
                className="text-2xl font-semibold tracking-tight h-9 max-w-md"
                defaultValue={project.name}
                disabled={savingField === "title"}
                onBlur={(e) => saveProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                  if (e.key === "Escape") {
                    setEditingTitle(false);
                  }
                }}
              />
            ) : (
              <h1
                className="text-2xl font-semibold tracking-tight truncate cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
                tabIndex={0}
                role="button"
                onClick={() => setEditingTitle(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingTitle(true);
                  }
                }}
              >
                {savingField === "title" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {project.name}
                  </span>
                ) : (
                  project.name
                )}
              </h1>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground text-sm mt-0.5">{project.description}</p>
          )}
          {editingPath ? (
            <Input
              ref={pathInputRef}
              className="text-xs font-mono mt-1 max-w-full h-7"
              defaultValue={project.repoPath ?? ""}
              placeholder="Repo path"
              disabled={savingField === "path"}
              onBlur={(e) => saveProjectPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setEditingPath(false);
              }}
            />
          ) : (
            <p
              className="text-xs text-muted-foreground font-mono mt-1 truncate cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
              title={project.repoPath ?? "Click to set repo path"}
              tabIndex={0}
              role="button"
              onClick={() => setEditingPath(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditingPath(true);
                }
              }}
            >
              {savingField === "path" && project.repoPath ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {project.repoPath}
                </span>
              ) : project.repoPath ? (
                project.repoPath
              ) : (
                <span className="text-muted-foreground/70">Click to set repo path</span>
              )}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="git" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Git
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup
          </TabsTrigger>
        </TabsList>
        <TabsContent value="git" className="mt-0">
          {!project.repoPath?.trim() ? (
            <p className="text-sm text-muted-foreground">Set a repo path on this project (edit project) to see git info.</p>
          ) : !isTauri() ? (
            <p className="text-sm text-muted-foreground">Open this app in the desktop (Tauri) build to see git info.</p>
          ) : gitInfoLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading git info…
            </div>
          ) : gitInfoError ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{gitInfoError}</p>
            </div>
          ) : gitInfo ? (
            (() => {
              const statusFirstLine = gitInfo.status_short.split("\n")[0] ?? "";
              const aheadMatch = statusFirstLine.match(/ahead (\d+)/);
              const behindMatch = statusFirstLine.match(/behind (\d+)/);
              const ahead = aheadMatch ? parseInt(aheadMatch[1], 10) : 0;
              const behind = behindMatch ? parseInt(behindMatch[1], 10) : 0;
              const statusLines = gitInfo.status_short.split("\n").slice(1).filter((l) => l.trim());
              const modified = statusLines.filter((l) => /^[ MADRCU]/.test(l) && !/^\?\?/.test(l)).length;
              const untracked = statusLines.filter((l) => /^\?\?/.test(l)).length;
              const isClean = modified === 0 && untracked === 0 && ahead === 0 && behind === 0;
              const localBranches = gitInfo.branches.filter((b) => !b.includes("remotes/"));
              const remoteBranches = gitInfo.branches.filter((b) => b.includes("remotes/"));
              const currentBranch = gitInfo.current_branch || "(detached)";
              const remotesParsed: { name: string; url: string }[] = [];
              if (gitInfo.remotes) {
                const seen = new Set<string>();
                for (const line of gitInfo.remotes.split("\n")) {
                  const parts = line.trim().split(/\s+/);
                  if (parts.length >= 2 && !seen.has(parts[0])) {
                    seen.add(parts[0]);
                    remotesParsed.push({ name: parts[0], url: parts[1] });
                  }
                }
              }
              const commitsParsed = gitInfo.last_commits.map((line) => {
                const firstSpace = line.indexOf(" ");
                const hash = firstSpace > 0 ? line.slice(0, firstSpace) : line;
                const message = firstSpace > 0 ? line.slice(firstSpace + 1).trim() : "";
                return { hash: hash.slice(0, 7), fullHash: hash, message: message || "(no message)" };
              });
              const remoteTree: Record<string, string[]> = {};
              for (const b of remoteBranches) {
                const m = b.match(/remotes\/([^/]+)\/(.*)/);
                if (m) {
                  const [, remoteName, branchName] = m;
                  if (!remoteTree[remoteName]) remoteTree[remoteName] = [];
                  remoteTree[remoteName].push(branchName);
                }
              }
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-foreground">Repository</h2>
                    <Button variant="outline" size="sm" onClick={fetchGitInfo} disabled={gitInfoLoading} className="gap-1.5">
                      <RefreshCw className={`h-3.5 w-3.5 ${gitInfoLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="overflow-hidden border-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                          <GitBranch className="h-4 w-4 text-primary" />
                          Current branch
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="font-mono font-semibold text-base text-primary">
                          {currentBranch}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate" title={gitInfo.head_ref}>
                          {gitInfo.head_ref}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className={`overflow-hidden border-2 ${isClean ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                          {isClean ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          )}
                          Working tree
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {isClean ? (
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Clean</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {ahead > 0 && <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300">Ahead {ahead}</Badge>}
                            {behind > 0 && <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 dark:text-orange-300">Behind {behind}</Badge>}
                            {modified > 0 && <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-300">{modified} modified</Badge>}
                            {untracked > 0 && <Badge variant="secondary" className="bg-slate-500/20 text-slate-700 dark:text-slate-300">{untracked} untracked</Badge>}
                          </div>
                        )}
                        {statusFirstLine && (
                          <p className="text-xs text-muted-foreground mt-2 font-mono truncate" title={gitInfo.status_short}>
                            {statusFirstLine}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {statusLines.length > 0 ? (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Changed files (git status)
                        </CardTitle>
                        <CardDescription>Files with uncommitted changes</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ScrollArea className="h-[200px] rounded-lg border bg-muted/20 font-mono text-sm">
                          <ul className="p-2 space-y-1">
                            {statusLines.map((line, i) => {
                              const staged = line.startsWith("M ") || line.startsWith("A ") || line.startsWith("D ") || line.startsWith("R ") || line.startsWith("C ") || line.startsWith("U ");
                              const unstaged = line.startsWith(" M") || line.startsWith(" A") || line.startsWith(" D") || line.startsWith(" R") || line.startsWith(" C") || line.startsWith(" U");
                              const untracked = line.startsWith("??");
                              const path = untracked ? line.slice(2).trim() : line.slice(2).trim();
                              const code = line.slice(0, 2).trim() || (untracked ? "??" : "");
                              return (
                                <li key={`${i}-${path}`} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50">
                                  <span className={`shrink-0 w-6 text-xs ${untracked ? "text-slate-500" : staged ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`} title={line.slice(0, 2)}>
                                    {code || "  "}
                                  </span>
                                  <span className="text-foreground truncate" title={path}>{path}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ) : null}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        Branch tree
                      </CardTitle>
                      <CardDescription>Local and remote branches</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="rounded-lg border bg-muted/30 p-3 font-mono text-sm space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ChevronRight className="h-4 w-4 shrink-0" />
                          <span className="font-medium">Local</span>
                        </div>
                        {localBranches.length === 0 ? (
                          <div className="pl-6 text-muted-foreground text-xs">No local branches</div>
                        ) : (
                          localBranches.map((b) => {
                            const name = b.replace(/^\*?\s*/, "");
                            const isCurrent = b.startsWith("*");
                            return (
                              <div key={name} className="pl-6 flex items-center gap-2 py-0.5">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? "bg-primary" : "bg-muted-foreground/50"}`} />
                                <span className={isCurrent ? "font-semibold text-primary" : "text-foreground"}>{name}</span>
                                {isCurrent && <Badge variant="secondary" className="text-xs">current</Badge>}
                              </div>
                            );
                          })
                        )}
                        {Object.keys(remoteTree).length > 0 && (
                          <>
                            <div className="flex items-center gap-2 text-muted-foreground mt-3 pt-2 border-t">
                              <Cloud className="h-4 w-4 shrink-0" />
                              <span className="font-medium">Remotes</span>
                            </div>
                            {Object.entries(remoteTree).map(([remoteName, branches]) => (
                              <div key={remoteName} className="pl-6">
                                <div className="flex items-center gap-2 py-1 text-foreground/90">
                                  <span className="w-2 h-2 rounded-full shrink-0 bg-violet-500/70" />
                                  <span className="font-medium">{remoteName}</span>
                                </div>
                                {branches.slice(0, 15).map((branchName) => (
                                  <div key={`${remoteName}/${branchName}`} className="pl-6 flex items-center gap-2 py-0.5 text-muted-foreground">
                                    <span className="text-xs">└</span>
                                    <span>{branchName}</span>
                                  </div>
                                ))}
                                {branches.length > 15 && <div className="pl-6 text-xs text-muted-foreground">… and {branches.length - 15} more</div>}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {remotesParsed.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Cloud className="h-4 w-4 text-muted-foreground" />
                          Remotes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {remotesParsed.map((r) => (
                            <div key={r.name} className="rounded-lg border bg-muted/20 p-3 flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0 font-mono">{r.name}</Badge>
                              <span className="text-xs text-muted-foreground break-all font-mono" title={r.url}>{r.url}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-muted-foreground" />
                        Recent commits
                      </CardTitle>
                      <CardDescription>Last 30 commits on current branch</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-[220px] rounded-lg border bg-muted/20">
                        <ul className="p-2 space-y-1">
                          {commitsParsed.map((c, i) => (
                            <li key={`${c.fullHash}-${i}`} className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 text-sm">
                              <span className="font-mono text-xs text-muted-foreground shrink-0 w-14" title={c.fullHash}>{c.hash}</span>
                              <span className="text-foreground line-clamp-2 break-words">{c.message}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {gitInfo.config_preview ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="config" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                          .git/config (preview)
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-[140px] rounded border bg-muted/30 p-3">
                            <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{gitInfo.config_preview}</pre>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : null}
                </div>
              );
            })()
          ) : null}
        </TabsContent>
        <TabsContent value="todos" className="mt-0">
          <Accordion type="multiple" className="w-full" defaultValue={["todos-kanban"]}>
        <AccordionItem value="todos-kanban" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Layers className="h-4 w-4" />
              Kanban (from features.md &amp; tickets.md)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm text-muted-foreground">
                Check that .cursor/features.md and .cursor/tickets.md exist, have correct format, and can be parsed to JSON for the board (see .cursor/sync.md). Click Sync to load and validate.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const hasRepo = !!project?.repoPath?.trim();
                  const hasActivePrompt = todosPromptIsActive && todosCombinedPrompt.trim().length > 0;
                  const todoCount = kanbanData.features.filter((f) => !f.done).length;
                  const implementDisabled =
                    implementFeaturesRunning ||
                    !isTauri() ||
                    !hasRepo ||
                    !hasActivePrompt ||
                    todoCount === 0;
                  const whyDisabled = !implementDisabled
                    ? null
                    : !isTauri()
                      ? "Requires desktop (Tauri) app."
                      : !hasRepo
                        ? "Set project repo path (Edit project)."
                        : !todosPromptIsActive
                          ? "Set a prompt as active (Todos tab → Prompt card → Active)."
                          : !todosCombinedPrompt.trim()
                            ? "Active prompt is empty. Add text or select a prompt, then click Active."
                            : todoCount === 0
                              ? "No features in To do. Run Sync or add features in features.md."
                              : null;
                  return (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={startImplementFeatures}
                        disabled={implementDisabled}
                        className="gap-1.5"
                        title={whyDisabled ?? "Run script for the top To-do feature and its tickets; when done, mark done and repeat until all are done."}
                      >
                        {implementFeaturesRunning ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        Implement Features
                      </Button>
                      {whyDisabled && (
                        <span className="text-xs text-muted-foreground" title={whyDisabled}>
                          {whyDisabled}
                        </span>
                      )}
                    </>
                  );
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runSync}
                  disabled={syncLoading || !project?.repoPath?.trim()}
                  className="gap-1.5"
                  title="Load .md files, check format and correlation, and refresh Kanban data"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncLoading ? "animate-spin" : ""}`} />
                  Sync
                </Button>
              </div>
            </div>
            {runStoreError && (
              <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <p className="font-medium">Run error</p>
                <p className="mt-0.5">{runStoreError}</p>
              </div>
            )}
            {implementFeaturesRunId != null && (() => {
              const run = runningRuns.find((r) => r.runId === implementFeaturesRunId);
              const logLines = run?.logLines ?? [];
              return (
                <div className="mb-3 rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Implement Features run log {run?.status === "running" ? "(running…)" : "(finished)"}
                  </p>
                  <ScrollArea className="h-[180px] rounded border bg-background/80 font-mono text-xs p-2">
                    {logLines.length === 0 ? (
                      <span className="text-muted-foreground">Waiting for script output…</span>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words">
                        {logLines.join("\n")}
                      </pre>
                    )}
                  </ScrollArea>
                </div>
              );
            })()}
            {syncStatus && (
              <div
                className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                  syncStatus.ok
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-200"
                }`}
              >
                <p className="font-medium">{syncStatus.message}</p>
                {syncStatus.details.length > 0 && (
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {syncStatus.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {(kanbanData.features.length === 0 && kanbanData.tickets.length === 0) && (
              <p className="text-sm text-muted-foreground mb-3">
                No features or tickets. Run Sync to load from .cursor/features.md and .cursor/tickets.md, or use Analysis / Create to generate them.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const json = JSON.stringify(kanbanData, null, 2);
                  navigator.clipboard.writeText(json).then(() => toast.success("Kanban JSON copied to clipboard.")).catch(() => toast.error("Could not copy."));
                }}
                title="Copy Kanban data as JSON"
              >
                Copy JSON
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Features (To do / Done)</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["To do", "Done"] as const).map((col) => (
                    <div key={col} className="rounded-lg border bg-muted/20 min-h-[200px] flex flex-col">
                      <div className="px-3 py-2 border-b bg-muted/40 rounded-t-lg flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="capitalize font-medium">{col}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {kanbanData.features.filter((f) => (col === "Done" ? f.done : !f.done)).length}
                        </span>
                      </div>
                      <ScrollArea className="flex-1 p-2">
                        <div className="space-y-2">
                          {kanbanData.features
                            .filter((f) => (col === "Done" ? f.done : !f.done))
                            .map((f) => (
                              <div
                                key={f.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("application/x-feature-id", f.id);
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                className="rounded border bg-background px-2 py-1.5 text-sm cursor-grab active:cursor-grabbing"
                              >
                                <span className="font-medium">{f.title}</span>
                                {f.ticketRefs.length > 0 && (
                                  <span className="text-muted-foreground ml-1">#{f.ticketRefs.join(", #")}</span>
                                )}
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Tickets by priority</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["P0", "P1", "P2"] as const).map((priority) => (
                    <div key={priority} className="rounded-lg border bg-muted/20 min-h-[200px] flex flex-col">
                      <div className="px-3 py-2 border-b bg-muted/40 rounded-t-lg flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="font-medium">{priority}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {kanbanData.tickets.filter((t) => t.priority === priority).length}
                        </span>
                      </div>
                      <ScrollArea className="flex-1 p-2">
                        <div className="space-y-2">
                          {kanbanData.tickets
                            .filter((t) => t.priority === priority)
                            .map((t) => (
                              <div
                                key={t.id}
                                className="rounded border bg-background px-2 py-1.5 text-sm"
                              >
                                <span className="font-medium">#{t.id}</span> {t.title}
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="todos-prompt" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <MessageSquare className="h-4 w-4" />
              Prompt
              {todosPromptIsActive && (
                <Badge variant="default" className="text-xs">active</Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-3">
              Choose an existing prompt or write your own. The prompt is always combined with the Kanban board (features and tickets from .cursor/features.md and .cursor/tickets.md) so the model has full context.
            </p>
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Source</Label>
                <Select
                  value={todosPromptSelectedId === "custom" || todosPromptSelectedId === "" ? "custom" : String(todosPromptSelectedId)}
                  onValueChange={onTodosPromptSelect}
                >
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Custom (write your own)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (write your own)</SelectItem>
                    {promptsList.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title || `#${p.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Prompt text (combined with Kanban features &amp; tickets above)</Label>
                <Textarea
                  placeholder="Write your prompt here, or select an existing prompt to load its content. Kanban context is always prepended when you copy, save, or run."
                  value={todosPromptBody}
                  onChange={(e) => setTodosPromptBody(e.target.value)}
                  rows={8}
                  className="resize-y font-mono text-sm"
                />
                {todosPromptContentLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading prompt…
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddPromptTitle("");
                    setAddPromptDialogOpen(true);
                  }}
                  className="gap-1.5"
                  title="Save current prompt text as a new prompt in the library"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePromptFromKanban}
                  disabled={generatePromptLoading}
                  className="gap-1.5"
                  title="Analyse current tickets and features and generate a Cursor prompt to finish them"
                >
                  {generatePromptLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Generate AI
                </Button>
                <Button
                  variant={todosPromptIsActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (todosCombinedPrompt.trim()) {
                      setTodosPromptIsActive(true);
                      toast.success("This prompt is now active for Implement Features.");
                    } else {
                      toast.error("Add prompt text or select a prompt first.");
                    }
                  }}
                  className="gap-1.5"
                  title="Use this prompt (with features & tickets) when you click Implement Features"
                >
                  {todosPromptIsActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  Active
                </Button>
                <Button variant="outline" size="sm" onClick={copyTodosPrompt} className="gap-1.5">
                  {todosPromptCopied ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <ClipboardCopy className="h-3.5 w-3.5" />
                  )}
                  {todosPromptCopied ? "Copied" : "Copy to clipboard"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveTodosPromptToCursor}
                  disabled={todosPromptSaving || !project?.repoPath?.trim() || !isTauri()}
                  className="gap-1.5"
                  title="Save combined prompt (Kanban + your text) to .cursor/analysis-prompt.md"
                >
                  {todosPromptSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Save to .cursor
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runTodosPromptInCursor}
                  disabled={todosPromptSaving || !project?.repoPath?.trim() || !isTauri()}
                  className="gap-1.5"
                  title="Save to .cursor and run analysis script in Cursor"
                >
                  {todosPromptSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSearch className="h-3.5 w-3.5" />}
                  Run in Cursor
                </Button>
              </div>
              <Dialog open={addPromptDialogOpen} onOpenChange={setAddPromptDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add custom prompt</DialogTitle>
                    <DialogDescription>
                      Save the current prompt text as a new prompt. It will appear in the Source dropdown and on the Prompts page.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                      placeholder="e.g. Complete P0 tickets"
                      value={addPromptTitle}
                      onChange={(e) => setAddPromptTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPromptSave()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Content: current prompt text ({todosPromptBody.length} chars) will be saved.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setAddPromptDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddPromptSave} disabled={addPromptSaving || !addPromptTitle.trim()} className="gap-1.5">
                      {addPromptSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save prompt
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cursor-files" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <FolderOpen className="h-4 w-4" />
              Files in .cursor ({project.repoPath ? (cursorFilesLoading ? "…" : cursorFiles.length) : "—"})
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBestPracticeOpen(true)}
                title="Show recommended .cursor files and what to put in each"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Show best practice .cursor structure
              </Button>
            </div>
            {!project.repoPath?.trim() ? (
              <p className="text-sm text-muted-foreground">
                Set a repo path on this project (edit project) to load files from the project&apos;s <code className="text-xs bg-muted px-1 rounded">.cursor</code> folder.
              </p>
            ) : !isTauri() ? (
              <p className="text-sm text-muted-foreground">
                Open this app in the desktop (Tauri) build to list files from the project&apos;s <code className="text-xs bg-muted px-1 rounded">.cursor</code> folder.
              </p>
            ) : cursorFilesError ? (
              <p className="text-sm text-destructive">{cursorFilesError}</p>
            ) : cursorFilesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading files from <span className="font-mono text-xs">{project.repoPath}/.cursor</span>…
              </div>
            ) : cursorFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No files in <span className="font-mono text-xs">{project.repoPath}/.cursor</span>. The folder may not exist or may be empty.
              </p>
            ) : (
              <ScrollArea className="h-[280px] rounded border p-2">
                <CursorFilesTree
                  cursorFiles={cursorFiles}
                  repoPath={project.repoPath ?? ""}
                  specFiles={specFiles}
                  specFilesSaving={specFilesSaving}
                  addToSpec={addToSpec}
                />
              </ScrollArea>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="todos-features-tickets" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Layers className="h-4 w-4" />
              <TicketIcon className="h-4 w-4" />
              Features &amp; Tickets ({project.features.length} linked features, {project.tickets.length} linked tickets)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-3">
              .cursor/features.md and .cursor/tickets.md are shown together. Analysis creates both; Archive archives both. Sync (in Kanban card above) loads and validates both.
            </p>
            {/* .cursor/features.md */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">.cursor/features.md — features roadmap</p>
              {cursorFeaturesMdLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : cursorFeaturesMdError ? (
                <p className="text-sm text-destructive">{cursorFeaturesMdError}</p>
              ) : cursorFeaturesMd !== null && cursorFeaturesMd !== "" ? (
                <ScrollArea className="h-[240px] rounded border bg-muted/30 p-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cursorFeaturesMd}</ReactMarkdown>
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">No .cursor/features.md in this repo.</p>
              )}
            </div>
            {/* .cursor/tickets.md */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">.cursor/tickets.md — work items checklist by feature</p>
              {cursorTicketsMdLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : cursorTicketsMdError ? (
                <p className="text-sm text-destructive">{cursorTicketsMdError}</p>
              ) : cursorTicketsMd !== null && cursorTicketsMd !== "" ? (
                <ScrollArea className="h-[240px] rounded border bg-muted/30 p-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cursorTicketsMd}</ReactMarkdown>
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">No .cursor/tickets.md in this repo.</p>
              )}
            </div>
            {/* Spec files: features & tickets together */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div
                className={`rounded-md transition-colors min-h-[40px] p-2 ${dragOverCard === "features-spec" ? "ring-2 ring-primary bg-primary/5" : ""} ${specDropLoading ? "pointer-events-none opacity-70" : ""}`}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOverCard("features-spec"); }}
                onDragLeave={() => setDragOverCard(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCard(null);
                  const raw = e.dataTransfer.getData(SPEC_FILE_DRAG_TYPE);
                  if (!raw) return;
                  try {
                    const { path, name } = JSON.parse(raw) as { path: string; name: string };
                    handleSpecFileLinkToCard("features-spec", path, name);
                  } catch { /* ignore */ }
                }}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">Spec files for features</p>
                {specFilesFeatures.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {specFilesFeatures.map((path) => {
                      const f = specFiles.find((s) => s.path === path);
                      const label = f?.name ?? path.split("/").pop() ?? path;
                      return (
                        <span key={path} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-mono">
                          {label}
                          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => removeSpecFileFromFeatures(path)} disabled={specDropLoading} title="Remove">
                            <X className="h-3 w-3" />
                          </Button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Drag a file here or use Analysis.</p>
                )}
              </div>
              <div
                className={`rounded-md transition-colors min-h-[40px] p-2 ${dragOverCard === "tickets-spec" ? "ring-2 ring-primary bg-primary/5" : ""} ${specDropLoading ? "pointer-events-none opacity-70" : ""}`}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOverCard("tickets-spec"); }}
                onDragLeave={() => setDragOverCard(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCard(null);
                  const raw = e.dataTransfer.getData(SPEC_FILE_DRAG_TYPE);
                  if (!raw) return;
                  try {
                    const { path, name } = JSON.parse(raw) as { path: string; name: string };
                    handleSpecFileLinkToCard("tickets-spec", path, name);
                  } catch { /* ignore */ }
                }}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">Spec files for tickets</p>
                {specFilesTickets.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {specFilesTickets.map((path) => {
                      const f = specFiles.find((s) => s.path === path);
                      const label = f?.name ?? path.split("/").pop() ?? path;
                      return (
                        <span key={path} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-mono">
                          {label}
                          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => removeSpecFileFromTickets(path)} disabled={specDropLoading} title="Remove">
                            <X className="h-3 w-3" />
                          </Button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Drag a file here or use Analysis.</p>
                )}
              </div>
            </div>
            {/* Linked features and tickets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Linked features — Run / Queue</h4>
                {project.features.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No features linked. Link in Setup tab.</p>
                ) : (
                  <ScrollArea className="h-[160px] rounded border p-2">
                    <ul className="space-y-2 text-sm">
                      {project.features.map((f) => {
                        const projectsForRun = (f.project_paths?.length ? f.project_paths : (project.repoPath ? [project.repoPath] : [])) as string[];
                        return (
                          <li key={f.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 group">
                            <span className="flex-1 min-w-0 font-medium truncate">{f.title}</span>
                            {categoryBadges(f)}
                            <div className="flex gap-1 shrink-0">
                              <Button variant="outline" size="sm" className="h-7" onClick={() => runWithParams({ promptIds: f.prompt_ids ?? [], activeProjects: projectsForRun, runLabel: f.title })} disabled={!projectsForRun.length || !(f.prompt_ids?.length)} title="Run now">
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Run
                              </Button>
                              <Button variant="outline" size="sm" className="h-7" onClick={() => addFeatureToQueue({ id: f.id, title: f.title, prompt_ids: f.prompt_ids ?? [], project_paths: projectsForRun })} title="Add to queue">
                                <ListTodo className="h-3.5 w-3.5 mr-1" />
                                Queue
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Linked tickets — Run</h4>
                {project.tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tickets linked. Link in Setup tab.</p>
                ) : (
                  <ScrollArea className="h-[160px] rounded border p-2">
                    <ul className="space-y-2 text-sm">
                      {project.tickets.map((t) => {
                        const promptIds = (t as { prompt_ids?: number[] }).prompt_ids ?? [];
                        const projectsForRun = project.repoPath ? [project.repoPath] : [];
                        return (
                          <li key={t.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 group">
                            <Badge variant="outline" className="text-xs shrink-0">{t.status}</Badge>
                            <span className="flex-1 min-w-0 truncate">{t.title}</span>
                            {categoryBadges(t)}
                            <Button variant="outline" size="sm" className="h-7 shrink-0" onClick={() => runWithParams({ promptIds, activeProjects: projectsForRun, runLabel: t.title })} disabled={!projectsForRun.length} title="Run">
                              <Play className="h-3.5 w-3.5 mr-1" />
                              Run
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                )}
              </div>
            </div>
            {/* Buttons: Analysis (both), Analysis: Features from tickets, and Archive (both) */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAnalysisDialog("tickets-and-features")}
                title="Analyze codebase and create both .cursor/tickets.md and .cursor/features.md in one run"
              >
                <FileSearch className="h-3.5 w-3.5 mr-1" />
                Analysis (tickets &amp; features)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAnalysisDialog("features")}
                disabled={!cursorTicketsMd?.trim()}
                title="Populate features.md from existing tickets.md (requires tickets.md loaded)"
              >
                <FileSearch className="h-3.5 w-3.5 mr-1" />
                Analysis: Features (from tickets)
              </Button>
              {isTauri() && project.repoPath?.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={archiveBothCursorFiles}
                  disabled={archiveLoading !== null}
                  title="Archive both .cursor/tickets.md and .cursor/features.md to .cursor/legacy/ and create new files"
                >
                  {archiveLoading === "both" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Archive className="h-3.5 w-3.5 mr-1" />}
                  Archive both
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
        </TabsContent>
        <TabsContent value="setup" className="mt-0">
          <Accordion type="multiple" className="w-full" defaultValue={["link"]}>
        <AccordionItem value="designs" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Palette className="h-4 w-4" />
              Designs ({(project.designs?.length ?? 0)} linked)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div
              className={`rounded-md transition-colors min-h-[80px] ${dragOverCard === "designs" ? "ring-2 ring-primary bg-primary/5" : ""} ${specDropLoading ? "pointer-events-none opacity-70" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                setDragOverCard("designs");
              }}
              onDragLeave={() => setDragOverCard(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCard(null);
                const raw = e.dataTransfer.getData(SPEC_FILE_DRAG_TYPE);
                if (!raw) return;
                try {
                  const { path, name } = JSON.parse(raw) as { path: string; name: string };
                  handleSpecFileDrop("designs", path, name);
                } catch {
                  // ignore invalid drop data
                }
              }}
            >
            {project.designs && project.designs.length > 0 ? (
              <ScrollArea className="h-[120px] rounded border p-2 mb-2">
                <ul className="space-y-2 text-sm">
                  {project.designs.map((d) => {
                    const specPath = `.cursor/design-${d.id}.md`;
                    const inSpec = specFiles.some((f) => f.path === specPath);
                    const exporting = designExportingId === d.id;
                    return (
                      <li
                        key={d.id}
                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted/50 group"
                      >
                        <span
                          role="button"
                          tabIndex={0}
                          className="cursor-pointer flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded"
                          onClick={() => openDetailModal({ kind: "design", data: d })}
                          onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "design", data: d })}
                        >
                          <span className="font-medium">{d.name}</span>
                          {categoryBadges(d)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleExportDesignToSpec(d.id); }}
                          disabled={inSpec || specFilesSaving || exporting}
                          title={inSpec ? "Already in Project Spec" : "Export as .md and add to Project Spec"}
                        >
                          {exporting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : inSpec ? (
                            "Added"
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">
                No designs linked. Use &quot;Link to this project&quot; below to link designs (save them from the Design page first). Or drag a spec file (e.g. design.md) here to create and link.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAnalysisDialog("design")}
                title="Copy a prompt to run in Cursor; generates .cursor/analysis-design.md"
              >
                <FileSearch className="h-3.5 w-3.5 mr-1" />
                Analysis
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/design">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Open Design page
                </Link>
              </Button>
            </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="architectures" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Building2 className="h-4 w-4" />
              Architecture ({(project.architectures?.length ?? 0)} linked)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div
              className={`rounded-md transition-colors min-h-[80px] ${dragOverCard === "architectures" ? "ring-2 ring-primary bg-primary/5" : ""} ${specDropLoading ? "pointer-events-none opacity-70" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                setDragOverCard("architectures");
              }}
              onDragLeave={() => setDragOverCard(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCard(null);
                const raw = e.dataTransfer.getData(SPEC_FILE_DRAG_TYPE);
                if (!raw) return;
                try {
                  const { path, name } = JSON.parse(raw) as { path: string; name: string };
                  handleSpecFileDrop("architectures", path, name);
                } catch {
                  // ignore invalid drop data
                }
              }}
            >
            {project.architectures && project.architectures.length > 0 ? (
              <ScrollArea className="h-[120px] rounded border p-2 mb-2">
                <ul className="space-y-2 text-sm">
                  {project.architectures.map((a) => {
                    const specPath = `.cursor/architecture-${a.id}.md`;
                    const inSpec = specFiles.some((f) => f.path === specPath);
                    const exporting = architectureExportingId === a.id;
                    return (
                      <li
                        key={a.id}
                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted/50 group"
                      >
                        <span
                          role="button"
                          tabIndex={0}
                          className="cursor-pointer flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded"
                          onClick={() => openDetailModal({ kind: "architecture", data: a })}
                          onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "architecture", data: a })}
                        >
                          <span className="font-medium">{a.name}</span>
                          {categoryBadges(a)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleExportArchitectureToSpec(a.id); }}
                          disabled={inSpec || specFilesSaving || exporting}
                          title={inSpec ? "Already in Project Spec" : "Export as .md and add to Project Spec"}
                        >
                          {exporting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : inSpec ? (
                            "Added"
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">
                No architectures linked. Use &quot;Link to this project&quot; below to link architecture definitions (add them from the Architecture page first). Or drag a spec file (e.g. architecture.md) here to create and link.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAnalysisDialog("architecture")}
                title="Copy a prompt to run in Cursor; generates .cursor/analysis-architecture.md"
              >
                <FileSearch className="h-3.5 w-3.5 mr-1" />
                Analysis
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/architecture">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Open Architecture page
                </Link>
              </Button>
            </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ideas" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Lightbulb className="h-4 w-4" />
              Ideas ({project.ideas.length} linked)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {project.ideas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ideas linked. Edit project to add idea IDs.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <ul className="space-y-2 text-sm">
                  {project.ideas.map((i) => (
                    <li
                      key={i.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "idea", data: i })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "idea", data: i })}
                    >
                      <span className="font-medium">{i.title}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">{i.category}</Badge>
                      {i.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{i.description}</p>
                      )}
                      {categoryBadges(i)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/ideas">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Ideas page
              </Link>
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="categorization" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Tags className="h-4 w-4" />
              Categorization
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Assign phase, step, organization, categorizer, or other to each entity.
            </p>
            {(["prompts", "tickets", "features", "ideas", "designs", "architectures"] as const).map((kind) => {
              const list =
                kind === "prompts"
                  ? project.prompts
                  : kind === "tickets"
                    ? project.tickets
                    : kind === "features"
                      ? project.features
                      : kind === "ideas"
                        ? project.ideas
                        : kind === "designs"
                          ? project.designs ?? []
                          : project.architectures ?? [];
              const title = (e: { id: number | string; title?: string; name?: string }) => "title" in e ? e.title : e.name;
              const eid = (e: { id: number | string }) => e.id;
              if (list.length === 0) return null;
              return (
                <div key={kind} className="space-y-2 mb-4">
                  <Label className="text-xs capitalize">{kind}</Label>
                  <div className="rounded border divide-y text-sm">
                    {list.map((e) => (
                      <div key={String(eid(e))} className="p-2 grid grid-cols-[1fr_auto] gap-2 items-center">
                        <span className="truncate font-medium">{title(e) ?? String(eid(e))}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORY_FIELDS.map((f) => (
                            <Input
                              key={f}
                              placeholder={f}
                              className="h-7 w-24 text-xs"
                              value={getEntityCategory(kind, eid(e))[f] ?? ""}
                              onChange={(ev) => setEntityCategoryField(kind, eid(e), f, ev.target.value)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="link" className="border rounded-lg px-4 mt-2 bg-primary/5 border-primary/30">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Link2 className="h-4 w-4" />
              Link to this project
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Check items to link to this project. Changes apply when you click Save links.
            </p>
            {linksLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading prompts, tickets, features, ideas, designs, architectures…
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Prompts ({promptIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {promptsList.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={promptIds.includes(p.id)} onCheckedChange={() => togglePrompt(p.id)} />
                      <span className="truncate">{p.title || `#${p.id}`}</span>
                    </label>
                  ))}
                  {promptsList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <TicketIcon className="h-3.5 w-3.5" />
                  Tickets ({ticketIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {ticketsList.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={ticketIds.includes(t.id)} onCheckedChange={() => toggleTicket(t.id)} />
                      <span className="truncate">{t.title}</span>
                    </label>
                  ))}
                  {ticketsList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Features ({featureIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {featuresList.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={featureIds.includes(f.id)} onCheckedChange={() => toggleFeature(f.id)} />
                      <span className="truncate">{f.title}</span>
                    </label>
                  ))}
                  {featuresList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Ideas ({ideaIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {ideasList.map((i) => (
                    <label key={i.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={ideaIds.includes(i.id)} onCheckedChange={() => toggleIdea(i.id)} />
                      <span className="truncate">{i.title}</span>
                    </label>
                  ))}
                  {ideasList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  Designs ({designIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {designsList.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={designIds.includes(d.id)} onCheckedChange={() => toggleDesign(d.id)} />
                      <span className="truncate">{d.name}</span>
                    </label>
                  ))}
                  {designsList.length === 0 && (
                    <p className="text-xs text-muted-foreground p-2">None. Save designs from the Design page.</p>
                  )}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Architecture ({architectureIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {architecturesList.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={architectureIds.includes(a.id)} onCheckedChange={() => toggleArchitecture(a.id)} />
                      <span className="truncate">{a.name}</span>
                    </label>
                  ))}
                  {architecturesList.length === 0 && (
                    <p className="text-xs text-muted-foreground p-2">None. Add definitions from the Architecture page.</p>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
            <Button onClick={saveLinks} disabled={linksSaving || linksLoading} size="sm" className="mt-4">
              {linksSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save links"
              )}
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}

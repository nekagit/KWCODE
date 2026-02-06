"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  GitBranch,
  Settings,
  CheckCircle2,
  AlertCircle,
  Cloud,
  GitCommit,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project, EntityCategory, ProjectEntityCategories } from "@/types/project";
import { getProject, getProjectResolved, updateProject, getProjectExport } from "@/lib/api-projects";
import { isTauri, invoke } from "@/lib/tauri";
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
} from "@/lib/analysis-prompt";
import { createDefaultDesignConfig } from "@/data/design-templates";
import { toast } from "sonner";
import type { GitInfo } from "@/types/git";
import { useRunState } from "@/context/run-state";

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
  const [analysisDialogTitle, setAnalysisDialogTitle] = useState<string>("");
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const [savingPromptToCursor, setSavingPromptToCursor] = useState(false);
  const [dragOverCard, setDragOverCard] = useState<string | null>(null);
  const [specDropLoading, setSpecDropLoading] = useState(false);
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [gitInfoLoading, setGitInfoLoading] = useState(false);
  const [gitInfoError, setGitInfoError] = useState<string | null>(null);

  const { runWithParams, addFeatureToQueue } = useRunState();

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

  const openAnalysisDialog = useCallback(
    (kind: "design" | "architecture" | "tickets" | "full") => {
      const projectName = project?.name ?? "This project";
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
      } else {
        setAnalysisDialogTitle("Analysis: Tickets");
        setAnalysisDialogPrompt(
          buildTicketsAnalysisPrompt({
            projectName,
            ticketSummaries: (project?.tickets ?? []).map((t) => ({ title: t.title, status: t.status })),
          })
        );
      }
      setAnalysisCopied(false);
    },
    [project]
  );

  const saveAnalysisPromptToCursor = useCallback(async () => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    setSavingPromptToCursor(true);
    try {
      await invoke("write_spec_file", {
        projectPath: project.repoPath.trim(),
        relativePath: `.cursor/${ANALYSIS_PROMPT_FILENAME}`,
        content: analysisDialogPrompt ?? ANALYSIS_PROMPT,
      });
      refetchProject();
    } finally {
      setSavingPromptToCursor(false);
    }
  }, [project?.repoPath, analysisDialogPrompt, refetchProject]);

  const runAnalysisInCursor = useCallback(async () => {
    if (!project?.repoPath?.trim() || !isTauri()) return;
    setSavingPromptToCursor(true);
    try {
      await invoke("write_spec_file", {
        projectPath: project.repoPath.trim(),
        relativePath: `.cursor/${ANALYSIS_PROMPT_FILENAME}`,
        content: analysisDialogPrompt ?? ANALYSIS_PROMPT,
      });
      await invoke("run_analysis_script", { projectPath: project.repoPath.trim() });
      toast.success("Analysis script started. Cursor will open and run the prompt; results will be saved in .cursor/");
      refetchProject();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to run analysis script");
    } finally {
      setSavingPromptToCursor(false);
    }
  }, [project?.repoPath, analysisDialogPrompt, refetchProject]);

  const closeAnalysisDialog = useCallback(() => {
    setAnalysisDialogPrompt(null);
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

      <Dialog open={!!analysisDialogPrompt} onOpenChange={onAnalysisDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{analysisDialogTitle}</DialogTitle>
            <DialogDescription>
              Copy this prompt and run it in Cursor (in this project&apos;s repo). The AI will generate documents (e.g. <code className="text-xs bg-muted px-1 rounded">.cursor/ANALYSIS.md</code>, <code className="text-xs bg-muted px-1 rounded">.cursor/architecture.md</code>, <code className="text-xs bg-muted px-1 rounded">.cursor/design.md</code>) in the project&apos;s <code className="text-xs bg-muted px-1 rounded">.cursor</code> folder.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 rounded border p-3 text-sm font-mono whitespace-pre-wrap">
            {analysisDialogPrompt ?? ""}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-2 shrink-0 flex-wrap">
            <Button variant="outline" size="sm" onClick={closeAnalysisDialog}>
              Close
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
            <Button variant="outline" size="sm" onClick={copyAnalysisPrompt}>
              <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />
              {analysisCopied ? "Copied" : "Copy to clipboard"}
            </Button>
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
            <h1 className="text-2xl font-semibold tracking-tight truncate">{project.name}</h1>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.id}/edit`}>Edit</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAnalysisDialog("full")}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsJson}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="ml-1.5">Export as JSON</span>
            </Button>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-sm mt-0.5">{project.description}</p>
          )}
          {project.repoPath && (
            <p className="text-xs text-muted-foreground font-mono mt-1 truncate" title={project.repoPath}>
              {project.repoPath}
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
          <Accordion type="multiple" className="w-full" defaultValue={["spec", "cursor-files"]}>
        <AccordionItem value="spec" className="border rounded-lg px-4 mt-2 bg-primary/5 border-primary/30">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <FileText className="h-4 w-4" />
              Project Spec ({specFiles.length} files)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className={specPreview ? "grid grid-cols-1 md:grid-cols-2 gap-4" : undefined}>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Files from this project&apos;s .cursor folder or exported from Design / Architecture / Features. Add from &quot;Files in .cursor&quot; or use + Add on the Design, Architecture, and Features cards to export .md here. Click a file to preview.
                </p>
                {specFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No files in the project spec yet. Set a repo path, add from &quot;Files in .cursor&quot;, or use + Add on Design / Architecture / Features cards to export .md files.
                  </p>
                ) : (
                  <ScrollArea className="h-[240px] rounded border p-2">
                    <ul className="space-y-2 text-sm">
                      {specFiles.map((f) => (
                        <li
                          key={f.path}
                          role="button"
                          tabIndex={0}
                          draggable
                          className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 group cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                          onClick={() => openSpecFilePreview(f)}
                          onKeyDown={(e) => e.key === "Enter" && openSpecFilePreview(f)}
                          onDragStart={(e) => {
                            e.dataTransfer.setData(SPEC_FILE_DRAG_TYPE, JSON.stringify({ path: f.path, name: f.name }));
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                        >
                          <span className="font-mono truncate flex-1 min-w-0" title={f.path}>
                            {f.name}
                          </span>
                          {f.content != null && (
                            <span className="text-xs text-muted-foreground shrink-0">(exported)</span>
                          )}
                          <span className="text-muted-foreground text-xs truncate max-w-[180px]" title={f.path}>
                            {f.path}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromSpec(f.path);
                            }}
                            disabled={specFilesSaving}
                            title="Remove from project spec"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
                {isTauri() && project.repoPath?.trim() && specFiles.some((f) => f.content) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={downloadAllSpecFilesToCursor}
                    disabled={downloadAllToCursorLoading}
                    title="Write all exported spec files to the project's .cursor folder"
                  >
                    {downloadAllToCursorLoading ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Download all to .cursor
                  </Button>
                )}
              </div>
              {specPreview && (
                <div className="min-w-0 flex flex-col rounded-lg border bg-muted/30 border-primary/20">
                  <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
                    <span className="text-sm font-medium truncate" title={specPreview.path}>
                      {specPreview.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={closeSpecPreview}
                      title="Close preview"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 min-h-0 h-[240px] p-3">
                    {specPreviewLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading…
                      </div>
                    ) : specPreviewError ? (
                      <p className="text-sm text-destructive">{specPreviewError}</p>
                    ) : (
                      <div className="markdown-viewer text-sm space-y-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:border-collapse [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded text-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {specPreview.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
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

        <AccordionItem value="todos-features" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <Layers className="h-4 w-4" />
              Features ({project.features.length} linked) — Run / Queue
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {project.features.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features linked. Link features in the Setup tab.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
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
                          <Button variant="outline" size="sm" className="h-7" onClick={() => addFeatureToQueue({ id: f.id, title: f.title, prompt_ids: f.prompt_ids ?? [], project_paths: projectsForRun })} title="Add to run queue">
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
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/?tab=feature">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Feature tab
              </Link>
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="todos-tickets" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <TicketIcon className="h-4 w-4" />
              Tickets ({project.tickets.length} linked) — Run
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {project.tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets linked. Link tickets in the Setup tab.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <ul className="space-y-2 text-sm">
                  {project.tickets.map((t) => {
                    const promptIds = (t as { prompt_ids?: number[] }).prompt_ids ?? [];
                    const projectsForRun = project.repoPath ? [project.repoPath] : [];
                    return (
                      <li key={t.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 group">
                        <Badge variant="outline" className="text-xs shrink-0">{t.status}</Badge>
                        <span className="flex-1 min-w-0 truncate">{t.title}</span>
                        {categoryBadges(t)}
                        <Button variant="outline" size="sm" className="h-7 shrink-0" onClick={() => runWithParams({ promptIds, activeProjects: projectsForRun, runLabel: t.title })} disabled={!projectsForRun.length} title="Run with this project and ticket prompts">
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Run
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => openAnalysisDialog("tickets")}>
                <FileSearch className="h-3.5 w-3.5 mr-1" />
                Analysis
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/?tab=tickets">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Tickets tab
                </Link>
              </Button>
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

        <AccordionItem value="prompts" className="border rounded-lg px-4 mt-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 text-base font-medium">
              <MessageSquare className="h-4 w-4" />
              Prompts ({project.prompts.length} linked)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {project.prompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prompts linked. Edit project to add prompt IDs.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <ul className="space-y-2 text-sm">
                  {project.prompts.map((p) => (
                    <li
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "prompt", data: p })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "prompt", data: p })}
                    >
                      <span className="font-medium">{p.title || `#${p.id}`}</span>
                      {categoryBadges(p)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/prompts">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Prompts page
              </Link>
            </Button>
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

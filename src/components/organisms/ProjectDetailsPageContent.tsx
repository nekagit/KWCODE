"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  FolderGit2,
  ListTodo,
  Trash2,
  FolderOpen,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Hash,
  Monitor,
  Server,
  Flag,
  TestTube2,
  FileText,
  ClipboardList,
  Sparkles,
  ScanSearch,
  Pencil,
  Lightbulb,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/types/project";
import { invoke, isTauri } from "@/lib/tauri";
import { getProjectResolved, deleteProject, listProjects, updateProject } from "@/lib/api-projects";
import { ProjectTicketsTab } from "@/components/molecules/TabAndContentSections/ProjectTicketsTab";
import { ProjectGitTab } from "@/components/molecules/TabAndContentSections/ProjectGitTab";
import { ProjectMilestonesTab } from "@/components/molecules/TabAndContentSections/ProjectMilestonesTab";
import { ProjectFrontendTab } from "@/components/molecules/TabAndContentSections/ProjectFrontendTab";
import { ProjectBackendTab } from "@/components/molecules/TabAndContentSections/ProjectBackendTab";
import { ProjectProjectTab } from "@/components/molecules/TabAndContentSections/ProjectProjectTab";
import { ProjectTestingTab } from "@/components/molecules/TabAndContentSections/ProjectTestingTab";
import { ProjectSetupDocTab } from "@/components/molecules/TabAndContentSections/ProjectSetupDocTab";
import { ProjectControlTab } from "@/components/molecules/TabAndContentSections/ProjectControlTab";
import { ProjectIdeasDocTab } from "@/components/molecules/TabAndContentSections/ProjectIdeasDocTab";
import { ProjectRunTab } from "@/components/molecules/TabAndContentSections/ProjectRunTab";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";
import { SectionCard, MetadataBadge, CountBadge } from "@/components/shared/DisplayPrimitives";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { Input } from "@/components/ui/input";
import {
  initializeProjectRepo,
  writeAnalyzeQueue,
  readAnalyzeQueue,
  runAnalyzeQueueProcessing,
  writeProjectFile,
  ANALYZE_QUEUE_PATH,
} from "@/lib/api-projects";
import { ANALYZE_JOB_IDS, getPromptPath, getOutputPath } from "@/lib/cursor-paths";
import { recordProjectVisit } from "@/lib/recent-projects";
import {
  getProjectDetailTabPreference,
  setProjectDetailTabPreference,
} from "@/lib/project-detail-tab-preference";
import { useSetPageTitle } from "@/context/page-title-context";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

/**
 * Each tab’s dedicated .md in .cursor, updated by agent -p using current project data.
 * Entity folders: 0. ideas, 1. project (includes former setup docs).
 * "Analyze" (per tab or all) runs agent with: project name + repo layout + tech stack + package.json + current doc content + prompt instructions → writes output path.
 */
const ANALYZE_ALL_CONFIG: { promptPath: string; outputPath: string }[] = ANALYZE_JOB_IDS.map((id) => ({
  promptPath: getPromptPath(id),
  outputPath: getOutputPath(id),
}));

const TAB_ROW_1 = [
  { value: "project", label: "Project", icon: FolderOpen, color: "text-sky-400", activeGlow: "shadow-sky-500/10" },
  { value: "frontend", label: "Frontend", icon: Monitor, color: "text-cyan-400", activeGlow: "shadow-cyan-500/10" },
  { value: "backend", label: "Backend", icon: Server, color: "text-orange-400", activeGlow: "shadow-orange-500/10" },
  { value: "testing", label: "Testing", icon: TestTube2, color: "text-emerald-400", activeGlow: "shadow-emerald-500/10" },
  { value: "documentation", label: "Documentation", icon: FileText, color: "text-teal-400", activeGlow: "shadow-teal-500/10" },
] as const;

const TAB_ROW_2 = [
  { value: "ideas", label: "Ideas", icon: Lightbulb, color: "text-amber-500", activeGlow: "shadow-amber-500/10" },
  { value: "milestones", label: "Milestones", icon: Flag, color: "text-fuchsia-400", activeGlow: "shadow-fuchsia-500/10" },
  { value: "todo", label: "Planner", icon: ListTodo, color: "text-blue-400", activeGlow: "shadow-blue-500/10" },
  { value: "worker", label: "Worker", icon: Activity, color: "text-emerald-500", activeGlow: "shadow-emerald-500/10" },
  { value: "control", label: "Control", icon: ClipboardList, color: "text-slate-400", activeGlow: "shadow-slate-500/10" },
  { value: "git", label: "Versioning", icon: FolderGit2, color: "text-amber-400", activeGlow: "shadow-amber-500/10" },
] as const;

/** Valid tab values for URL ?tab= (deep link). */
const VALID_PROJECT_TABS = new Set([
  ...TAB_ROW_1.map((t) => t.value),
  ...TAB_ROW_2.map((t) => t.value),
]);

export type ProjectDetailsPageContentProps = {
  /** When set (e.g. from /projects?open=id), use this id instead of route params. Used by Tauri to avoid navigating to /projects/[id]. */
  overrideProjectId?: string;
  /** When set, "Back to list" calls this instead of linking to /projects. */
  onBack?: () => void;
};

export function ProjectDetailsPageContent(props: ProjectDetailsPageContentProps = {}) {
  const { overrideProjectId, onBack } = props;
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = overrideProjectId ?? (params?.id as string) ?? "";
  const tabFromUrl = searchParams?.get("tab") ?? null;
  // #region agent log
  React.useEffect(() => {
    if (isTauri) {
      invoke("frontend_debug_log", {
        location: "ProjectDetailsPageContent.tsx:mount",
        message: "project details page mounted",
        data: { projectId, hasId: !!projectId },
      }).catch(() => {});
    }
    fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "ProjectDetailsPageContent.tsx:mount",
        message: "project details page mounted",
        data: { projectId, hasId: !!projectId },
        timestamp: Date.now(),
        hypothesisId: "H3",
      }),
    }).catch(() => {});
  }, [projectId]);
  // Record project visit for command palette "recent" ordering
  useEffect(() => {
    if (projectId) recordProjectVisit(projectId);
  }, [projectId]);
  // #endregion
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("worker");
  // Sync active tab from URL ?tab= when valid (deep link; one-way: URL → tab).
  useEffect(() => {
    if (tabFromUrl && (VALID_PROJECT_TABS as Set<string>).has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [projectId, tabFromUrl]);
  // Restore last tab from localStorage when no ?tab= in URL (persist preference).
  useEffect(() => {
    if (!projectId || (tabFromUrl != null && tabFromUrl !== "")) return;
    const saved = getProjectDetailTabPreference(projectId);
    setActiveTab(saved);
  }, [projectId, tabFromUrl]);
  const [initializing, setInitializing] = useState(false);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [viewRunningOpen, setViewRunningOpen] = useState(false);
  const [portEdit, setPortEdit] = useState(false);
  const [portInput, setPortInput] = useState("");
  const [savingPort, setSavingPort] = useState(false);
  const [plannerRefreshKey, setPlannerRefreshKey] = useState(0);
  const [docsRefreshKey, setDocsRefreshKey] = useState(0);
  const [controlTabRefreshKey, setControlTabRefreshKey] = useState(0);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const mountedRef = useRef(true);
  const setPageTitle = useSetPageTitle();
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Dynamic document title for project detail (accessibility and tab/bookmark clarity).
  useEffect(() => {
    const title = project?.name ?? "Project";
    setPageTitle(title);
    return () => setPageTitle(null);
  }, [project?.name, setPageTitle]);

  // When Analyze runs via Worker (analyze-doc), refresh doc tabs when the run completes.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { onComplete?: string };
      if (detail?.onComplete === "analyze-doc") {
        setDocsRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener("run-complete", handler);
    return () => window.removeEventListener("run-complete", handler);
  }, []);

  // When a ticket Implement All run completes, switch to Control tab and refresh it.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { projectId?: string };
      if (detail?.projectId === projectId) {
        setActiveTab("control");
        setControlTabRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener("ticket-implementation-done", handler);
    return () => window.removeEventListener("ticket-implementation-done", handler);
  }, [projectId]);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isTauri) {
        invoke("frontend_debug_log", { location: "ProjectDetailsPageContent.tsx:fetchProject", message: "ProjectDetails: about to call get_project_resolved", data: { projectId } }).catch(() => {});
      }
      const data = await getProjectResolved(projectId);
      if (mountedRef.current) setProject(data);
      // #region agent log
      fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "ProjectDetailsPageContent.tsx:fetchProject:ok",
          message: "getProjectResolved succeeded",
          data: { projectId, hasProject: !!data },
          timestamp: Date.now(),
          hypothesisId: "H4",
        }),
      }).catch(() => {});
      // #endregion
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (mountedRef.current) setError(errMsg);
      // #region agent log
      if (isTauri) {
        invoke("frontend_debug_log", { location: "ProjectDetailsPageContent.tsx:fetchProject:catch", message: "ProjectDetails: get_project_resolved failed", data: { projectId, error: errMsg } }).catch(() => {});
      }
      fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "ProjectDetailsPageContent.tsx:fetchProject:err",
          message: "getProjectResolved failed",
          data: { projectId, error: errMsg },
          timestamp: Date.now(),
          hypothesisId: "H4",
        }),
      }).catch(() => {});
      // #endregion
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Load project IDs for prev/next navigation
  useEffect(() => {
    let cancelled = false;
    listProjects()
      .then((projects) => {
        if (!cancelled) setProjectIds(projects.map((p) => p.id));
      })
      .catch(() => {
        if (!cancelled) setProjectIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Loader2 className="relative size-10 animate-spin text-primary" />
          </div>
          <p className="text-xs text-muted-foreground animate-pulse tracking-wider">
            Loading project…
          </p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-8 max-w-md w-full text-center space-y-4">
          <div className="mx-auto size-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-sm text-destructive/90 normal-case">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              fetchProject();
            }}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Not Found ─── */
  if (!project) {
    // #region agent log
    fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "ProjectDetailsPageContent.tsx:notFound",
        message: "rendering project not found",
        data: { projectId },
        timestamp: Date.now(),
        hypothesisId: "H4",
      }),
    }).catch(() => {});
    // #endregion
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const currentIndex = projectIds.indexOf(projectId);
  const prevId = currentIndex > 0 ? projectIds[currentIndex - 1] : undefined;
  const nextId = currentIndex >= 0 && currentIndex < projectIds.length - 1 ? projectIds[currentIndex + 1] : undefined;

  const ticketCount = project.ticketIds?.length ?? 0;

  const designCount = project.designIds?.length ?? 0;
  const ideaCount = project.ideaIds?.length ?? 0;
  const architectureCount = project.architectureIds?.length ?? 0;

  return (
    <ErrorBoundary fallbackTitle="Project detail error">
      <div
        className="flex flex-col gap-0 w-full"
        data-testid="project-detail-page"
      >
        {/* ═══════════════ HERO HEADER ═══════════════ */}
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/[0.04] p-6 md:p-8 mb-8">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-36 rounded-full bg-info/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 size-24 rounded-full bg-violet-500/[0.04] blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5">
            <Breadcrumb
              items={[
                { label: "Projects", href: "/projects" },
                { label: project.name ?? "Project" },
              ]}
              className="mb-0.5"
            />
            {/* Top bar: back + delete */}
            <div className="flex items-center justify-between">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span className="tracking-wide">All projects</span>
                </button>
              ) : (
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span className="tracking-wide">All projects</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 gap-1.5"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="size-3.5" />
                <span className="text-xs">Delete</span>
              </Button>
            </div>

            {/* Delete project confirmation (same pattern as ProjectHeader, ADR 0130 / 0189) */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete project?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  This project will be removed from the app. This cannot be undone.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await deleteProject(projectId);
                      setDeleteConfirmOpen(false);
                      toast.success("Project deleted");
                      if (onBack) onBack();
                      else router.replace("/projects");
                    }}
                  >
                    Delete project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Project Title & Description */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                {prevId ? (
                  <Link
                    href={`/projects/${prevId}`}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Previous project"
                  >
                    <ArrowLeft className="size-5" />
                  </Link>
                ) : (
                  <span className="shrink-0 rounded-lg p-2 text-muted-foreground/40 cursor-not-allowed" aria-hidden>
                    <ArrowLeft className="size-5" />
                  </span>
                )}
                <h1 className="flex-1 min-w-0 text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {project.name}
                </h1>
                {nextId ? (
                  <Link
                    href={`/projects/${nextId}`}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Next project"
                  >
                    <ArrowRight className="size-5" />
                  </Link>
                ) : (
                  <span className="shrink-0 rounded-lg p-2 text-muted-foreground/40 cursor-not-allowed" aria-hidden>
                    <ArrowRight className="size-5" />
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed normal-case">
                  {project.description}
                </p>
              )}
            </div>

            {/* Metadata badges + Initialize Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
              <div className="flex flex-wrap items-center gap-2">
                {project.repoPath && (
                  <MetadataBadge
                    icon={<FolderOpen className="size-3" />}
                    color="bg-primary/10 border-primary/20 text-primary"
                  >
                    <span className="truncate max-w-[220px] normal-case">
                      {project.repoPath}
                    </span>
                  </MetadataBadge>
                )}
                {/* Initialize Button */}
                {project.repoPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] font-semibold uppercase tracking-wider gap-1.5 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 shadow-sm"
                    onClick={async () => {
                      if (initializing) return;
                      setInitializing(true);
                      try {
                        await initializeProjectRepo(projectId, project.repoPath!);
                        toast.success("Project initialized with Next.js starter!");
                        fetchProject(); // Refresh to show new files
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to initialize");
                      } finally {
                        setInitializing(false);
                      }
                    }}
                    disabled={initializing}
                  >
                    {initializing ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Sparkles className="size-3 text-amber-400" />
                    )}
                    {initializing ? "Initializing..." : "Initialize"}
                  </Button>
                )}
                {/* Analyze all: enqueue 8 jobs into worker queue and process 3 at a time */}
                {project.repoPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] font-semibold uppercase tracking-wider gap-1.5 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 shadow-sm"
                    title={`Enqueue ${ANALYZE_ALL_CONFIG.length} analyze jobs and run 3 at a time`}
                    onClick={async () => {
                      if (analyzingAll) return;
                      setAnalyzingAll(true);
                      setAnalyzingStep(0);
                      const repoPath = project.repoPath ?? "";
                      const total = ANALYZE_ALL_CONFIG.length;
                      try {
                        await writeAnalyzeQueue(projectId, repoPath);
                        const { completed, failed } = await runAnalyzeQueueProcessing(projectId, repoPath, {
                          getQueue: () => readAnalyzeQueue(projectId, repoPath),
                          setQueue: (data) =>
                            writeProjectFile(projectId, ANALYZE_QUEUE_PATH, JSON.stringify(data, null, 2), repoPath),
                          onProgress: (done) => setAnalyzingStep(done),
                        });
                        setAnalyzingStep(0);
                        setDocsRefreshKey((k) => k + 1);
                        await fetchProject();
                        if (failed === 0) {
                          toast.success(`All ${total} docs updated.`);
                        } else {
                          toast.warning(`${completed} done, ${failed} failed.`, {
                            description: "Check queue or run output.",
                            duration: 8000,
                          });
                        }
                      } catch (err) {
                        setAnalyzingStep(0);
                        const msg = err instanceof Error ? err.message : "Analyze all failed";
                        const isPromptNotFound =
                          (err instanceof Error && (err as Error & { code?: string }).code === "PROMPT_NOT_FOUND") ||
                          String(msg).toLowerCase().includes("prompt not found");
                        if (isPromptNotFound) {
                          toast.error("Prompt file(s) missing", {
                            description: "Click Initialize (above) to unzip the Next.js starter into this project, then try again.",
                            duration: 10000,
                          });
                        } else {
                          toast.error(msg, { duration: 8000 });
                        }
                      } finally {
                        setAnalyzingAll(false);
                      }
                    }}
                    disabled={analyzingAll}
                  >
                    {analyzingAll ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <ScanSearch className="size-3 text-primary" />
                    )}
                    {analyzingAll
                      ? `Analyzing ${analyzingStep}/${ANALYZE_ALL_CONFIG.length}…`
                      : "Analyze all"}
                  </Button>
                )}
                {/* Run port: display or set localhost port for View Running Project (always show so port can be set even without repo path) */}
                <>
                  {project.runPort != null ? (
                      portEdit ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={1}
                            max={65535}
                            placeholder="Port"
                            value={portInput}
                            onChange={(e) => setPortInput(e.target.value)}
                            className="h-7 w-20 text-xs font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[10px]"
                            disabled={savingPort}
                            onClick={async () => {
                              const num = parseInt(portInput, 10);
                              if (Number.isNaN(num) || num < 1 || num > 65535) {
                                toast.error("Enter a port between 1 and 65535");
                                return;
                              }
                              setSavingPort(true);
                              try {
                                const updated = await updateProject(projectId, { runPort: num });
                                if (mountedRef.current && updated?.runPort != null) {
                                  setProject((p) => (p ? { ...p, runPort: updated.runPort } : p));
                                }
                                await fetchProject();
                                setPortEdit(false);
                                setPortInput("");
                                toast.success("Run port updated.");
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Failed to save port");
                              } finally {
                                setSavingPort(false);
                              }
                            }}
                          >
                            {savingPort ? <Loader2 className="size-3 animate-spin" /> : "Save"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-1.5"
                            onClick={() => {
                              setPortEdit(false);
                              setPortInput("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <MetadataBadge
                          icon={<Monitor className="size-3" />}
                          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        >
                          <span className="normal-case font-mono">
                            localhost:{project.runPort}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPortInput(String(project.runPort ?? ""));
                              setPortEdit(true);
                            }}
                            className="ml-1 rounded p-0.5 hover:bg-emerald-500/20"
                            aria-label="Change port"
                          >
                            <Pencil className="size-2.5" />
                          </button>
                        </MetadataBadge>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={1}
                          max={65535}
                          placeholder="Port"
                          value={portInput}
                          onChange={(e) => setPortInput(e.target.value)}
                          className="h-7 w-20 text-xs font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[10px] font-semibold uppercase tracking-wider gap-1"
                          disabled={savingPort}
                          onClick={async () => {
                            const num = parseInt(portInput, 10);
                            if (Number.isNaN(num) || num < 1 || num > 65535) {
                              toast.error("Enter a port between 1 and 65535");
                              return;
                            }
                            setSavingPort(true);
                            try {
                              const updated = await updateProject(projectId, { runPort: num });
                              if (mountedRef.current && updated?.runPort != null) {
                                setProject((p) => (p ? { ...p, runPort: updated.runPort } : p));
                              }
                              await fetchProject();
                              setPortInput("");
                              toast.success("Run port saved.");
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Failed to save port");
                            } finally {
                              setSavingPort(false);
                            }
                          }}
                        >
                          {savingPort ? <Loader2 className="size-3 animate-spin" /> : "Set port"}
                        </Button>
                      </div>
                    )}
                </>
                {/* View Running Project: opens modal with iframe (always visible; disabled until port is set) */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-[10px] font-semibold uppercase tracking-wider gap-1.5 border-emerald-500/30 hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all duration-300 shadow-sm"
                  title={project.runPort == null ? "Set run port above first" : "Open running app in modal"}
                  onClick={() => setViewRunningOpen(true)}
                  disabled={project.runPort == null}
                >
                  <Monitor className="size-3 text-emerald-500" />
                  View Running Project
                </Button>
                {project.created_at && (
                  <MetadataBadge
                    icon={<Calendar className="size-3" />}
                    color="bg-muted/50 border-border/50 text-muted-foreground"
                  >
                    <span className="normal-case">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </MetadataBadge>
                )}
                {ticketCount > 0 && (
                  <CountBadge
                    icon={<Hash className="size-2.5" />}
                    count={ticketCount}
                    label="tickets"
                    color="bg-blue-500/10 border-blue-500/20 text-blue-400"
                  />
                )}

                {designCount > 0 && (
                  <CountBadge
                    icon={<Hash className="size-2.5" />}
                    count={designCount}
                    label="designs"
                    color="bg-violet-500/10 border-violet-500/20 text-violet-400"
                  />
                )}
                {ideaCount > 0 && (
                  <CountBadge
                    icon={<Hash className="size-2.5" />}
                    count={ideaCount}
                    label="ideas"
                    color="bg-amber-500/10 border-amber-500/20 text-amber-400"
                  />
                )}
                {architectureCount > 0 && (
                  <CountBadge
                    icon={<Hash className="size-2.5" />}
                    count={architectureCount}
                    label="architectures"
                    color="bg-teal-500/10 border-teal-500/20 text-teal-400"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ TABS ═══════════════ */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            if (isTauri) {
              invoke("frontend_debug_log", { location: "ProjectDetailsPageContent.tsx:tabChange", message: "ProjectDetails: tab changed", data: { from: activeTab, to: v } }).catch(() => {});
            }
            setActiveTab(v);
            if (projectId) setProjectDetailTabPreference(projectId, v);
          }}
          className="w-full"
          data-testid="project-detail-tabs"
        >
          {/* Tab Navigation — two rows */}
          <div className="mb-6 flex flex-col gap-2">
            <TabsList
              className="inline-flex h-auto flex-col gap-1.5 rounded-xl bg-muted/20 border border-border/40 p-1.5 backdrop-blur-sm w-full sm:w-auto"
              aria-label="Project sections"
            >
              <div className="flex flex-wrap gap-1">
                {TAB_ROW_1.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    data-testid={`tab-${tab.value}`}
                    className={cn(
                      "relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-200",
                      "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/40",
                      "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50",
                      activeTab === tab.value && tab.activeGlow
                    )}
                  >
                    <tab.icon
                      className={cn(
                        "size-4 shrink-0 transition-colors duration-200",
                        activeTab === tab.value ? tab.color : ""
                      )}
                    />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {TAB_ROW_2.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    data-testid={`tab-${tab.value}`}
                    className={cn(
                      "relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-200",
                      "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/40",
                      "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50",
                      activeTab === tab.value && tab.activeGlow
                    )}
                  >
                    <tab.icon
                      className={cn(
                        "size-4 shrink-0 transition-colors duration-200",
                        activeTab === tab.value ? tab.color : ""
                      )}
                    />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
          </div>

          {/* ── Project Tab ── */}
          <TabsContent
            value="project"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <ProjectProjectTab project={project} projectId={projectId} docsRefreshKey={docsRefreshKey} onProjectUpdate={fetchProject} />
          </TabsContent>

          {/* ── Ideas Tab ── */}
          <TabsContent
            value="ideas"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 md:p-6">
              <ProjectIdeasDocTab project={project} projectId={projectId} docsRefreshKey={docsRefreshKey} />
            </div>
          </TabsContent>

          {/* ── Frontend Tab ── */}
          <TabsContent
            value="frontend"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <ProjectFrontendTab project={project} projectId={projectId} docsRefreshKey={docsRefreshKey} />
          </TabsContent>

          {/* ── Backend Tab ── */}
          <TabsContent
            value="backend"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <ProjectBackendTab project={project} projectId={projectId} docsRefreshKey={docsRefreshKey} />
          </TabsContent>

          {/* ── Testing Tab ── */}
          <TabsContent
            value="testing"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <ProjectTestingTab project={project} projectId={projectId} docsRefreshKey={docsRefreshKey} />
          </TabsContent>

          {/* ── Documentation Tab ── */}
          <TabsContent
            value="documentation"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 md:p-6">
              <ProjectSetupDocTab
                project={project}
                projectId={projectId}
                setupKey="documentation"
                docsRefreshKey={docsRefreshKey}
              />
            </div>
          </TabsContent>

          {/* ── Planner Tab ── */}
          <TabsContent
            value="todo"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div key={plannerRefreshKey} className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 md:p-6">
              <ProjectTicketsTab
                project={project}
                projectId={projectId}
                fetchProject={fetchProject}
              />
            </div>
          </TabsContent>

          {/* ── Milestones Tab ── */}
          <TabsContent
            value="milestones"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 md:p-6">
              <ProjectMilestonesTab
                project={project}
                projectId={projectId}
                onTicketAdded={() => setPlannerRefreshKey((k) => k + 1)}
              />
            </div>
          </TabsContent>

          {/* ── Control Tab (implementation log) ── */}
          <TabsContent
            value="control"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 md:p-6">
              <ProjectControlTab projectId={projectId} refreshKey={controlTabRefreshKey} />
            </div>
          </TabsContent>

          {/* ── Worker Tab ── */}
          <TabsContent
            value="worker"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {project && (
              <ProjectRunTab project={project} projectId={projectId} />
            )}
          </TabsContent>

          {/* ── Versioning Tab ── */}
          <TabsContent
            value="git"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <ProjectGitTab project={project} projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* View Running Project modal: iframe + open in new tab */}
      <Dialog open={viewRunningOpen} onOpenChange={setViewRunningOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col gap-3 p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-0 shrink-0">
            <DialogTitle className="text-sm font-medium">Running project</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col gap-2 px-4 pb-4 overflow-hidden">
            {project?.runPort != null && (
              <>
                <a
                  href={`http://localhost:${project.runPort}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
                >
                  <ExternalLink className="size-3" />
                  Open in new tab
                </a>
                <p className="text-xs text-muted-foreground shrink-0">
                  If the app does not load below (e.g. when this page is on HTTPS), use &quot;Open in new tab&quot; above.
                </p>
                <div className="flex-1 min-h-0 rounded-md border border-border bg-muted/30 overflow-hidden">
                  <iframe
                    title="Running project"
                    src={`http://localhost:${project.runPort}`}
                    className="w-full h-full min-h-[400px] block rounded-md border-0"
                    style={{ height: "100%" }}
                  />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This project will be removed from the app. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await deleteProject(projectId);
                setDeleteConfirmOpen(false);
                toast.success("Project deleted");
                if (onBack) onBack();
                else router.replace("/projects");
              }}
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}

/* SectionCard, MetadataBadge, CountBadge are now imported from @/components/shared/DisplayPrimitives */

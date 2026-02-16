"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText, FolderOpen, RefreshCw, Play, Square } from "lucide-react";
import { AnalyzeButtonSplit } from "@/components/molecules/ControlsAndButtons/AnalyzeButtonSplit";
import { listProjectFiles, readProjectFileOrEmpty, readCursorDocFromServer, analyzeProjectDoc, type FileEntry } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
import type { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard, CountBadge, MetadataBadge } from "@/components/shared/DisplayPrimitives";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PROJECT_DIR, PROJECT_PROMPT_PATH, PROJECT_OUTPUT_PATH } from "@/lib/cursor-paths";
import { TerminalSlot } from "@/components/shared/TerminalSlot";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 last:[&_p]:mb-0 [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1";

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatUpdatedAt(updatedAt: string): string {
  try {
    const d = new Date(updatedAt);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { dateStyle: "short" });
  } catch {
    return "—";
  }
}

interface ProjectProjectTabProps {
  project: Project;
  projectId: string;
  docsRefreshKey?: number;
}

export function ProjectProjectTab({ project, projectId, docsRefreshKey }: ProjectProjectTabProps) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const runNpmScript = useRunStore((s) => s.runNpmScript);
  const stopRun = useRunStore((s) => s.stopRun);
  const runningRuns = useRunStore((s) => s.runningRuns);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scripts, setScripts] = useState<Record<string, string>>({});
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [lastRunId, setLastRunId] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!project.repoPath) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    setError(null);
    try {
      const list = await listProjectFiles(projectId, PROJECT_DIR, project.repoPath);
      const mdFiles = list.filter((e) => !e.isDirectory && e.name.toLowerCase().endsWith(".md"));
      setEntries(mdFiles);
      if (mdFiles.length > 0 && !selectedFile) {
        setSelectedFile(mdFiles[0].name);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEntries([]);
    } finally {
      setLoadingList(false);
    }
  }, [projectId, project.repoPath]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles, docsRefreshKey]);

  const loadContent = useCallback(
    async (filename: string) => {
      setLoadingContent(true);
      setError(null);
      try {
        const path = `${PROJECT_DIR}/${filename}`;
        let text = project.repoPath
          ? await readProjectFileOrEmpty(projectId, path, project.repoPath)
          : "";
        if (!text?.trim()) text = await readCursorDocFromServer(path);
        setContent(text && text.trim() ? text : null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setContent(null);
      } finally {
        setLoadingContent(false);
      }
    },
    [projectId, project.repoPath]
  );

  useEffect(() => {
    if (selectedFile) {
      loadContent(selectedFile);
    } else {
      setContent(null);
    }
  }, [selectedFile, loadContent, docsRefreshKey]);

  // Load package.json scripts for Run section
  useEffect(() => {
    if (!project.repoPath) {
      setScripts({});
      return;
    }
    let cancelled = false;
    setLoadingScripts(true);
    readProjectFileOrEmpty(projectId, "package.json", project.repoPath)
      .then((raw) => {
        if (cancelled) return;
        try {
          const pkg = raw?.trim() ? (JSON.parse(raw) as Record<string, unknown>) : {};
          const s = pkg.scripts as Record<string, string> | undefined;
          setScripts(s && typeof s === "object" ? s : {});
        } catch {
          setScripts({});
        }
      })
      .catch(() => {
        if (!cancelled) setScripts({});
      })
      .finally(() => {
        if (!cancelled) setLoadingScripts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, project.repoPath]);

  const latestUpdated = entries.length
    ? entries.reduce((latest, e) => {
        if (!e.updatedAt) return latest;
        const t = new Date(e.updatedAt).getTime();
        return t > latest ? t : latest;
      }, 0)
    : null;

  if (!project.repoPath) {
    return (
      <EmptyState
        icon={<FolderOpen className="size-6 text-muted-foreground" />}
        title="No repo path"
        description={`Set a repository path for this project to load project info from ${PROJECT_DIR}.`}
      />
    );
  }

  if (loadingList) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/40 bg-muted/10 py-24">
        <LoadingState />
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-6 pr-4">
          {/* Overview + file list */}
          <SectionCard accentColor="sky">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="h-4 w-4 text-sky-500" />
              <h3 className="text-sm font-semibold">Project info</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Documents in <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{PROJECT_DIR}</code> (e.g.
              PROJECT-INFO.md, TECH-STACK.md, ROADMAP.md).{" "}
              <span className="text-muted-foreground/80">
                Analyze regenerates project docs from the repo and prompt (repo layout, package.json, current doc).
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <CountBadge
                count={entries.length}
                label="documents"
                color="bg-sky-500/10 border-sky-500/20 text-sky-400"
              />
              <MetadataBadge
                icon={<FileText className="size-3" />}
                color="bg-muted/50 border-border/50 text-muted-foreground"
              >
                <span className="font-mono text-[10px]">{PROJECT_DIR}</span>
              </MetadataBadge>
              {latestUpdated !== null && (
                <MetadataBadge
                  icon={<span className="text-[10px]">Updated</span>}
                  color="bg-muted/50 border-border/50 text-muted-foreground"
                >
                  {formatUpdatedAt(new Date(latestUpdated).toISOString())}
                </MetadataBadge>
              )}
              <AnalyzeButtonSplit
                promptPath={PROJECT_PROMPT_PATH}
                projectId={projectId}
                repoPath={project.repoPath ?? undefined}
                onAnalyze={async () => {
                  setAnalyzing(true);
                  try {
                    const result = await analyzeProjectDoc(
                      projectId,
                      PROJECT_PROMPT_PATH,
                      PROJECT_OUTPUT_PATH,
                      project.repoPath ?? undefined,
                      { runTempTicket: isTauri ? runTempTicket : undefined }
                    );
                    if (result?.viaWorker) {
                      toast.success("Analyze started. See Worker tab.");
                      return;
                    }
                    await loadFiles();
                    setSelectedFile("PROJECT-INFO.md");
                    toast.success("Project info updated from prompt.");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Analyze failed");
                  } finally {
                    setAnalyzing(false);
                  }
                }}
                analyzing={analyzing}
                label="Analyze"
              />
              <Button variant="ghost" size="sm" onClick={loadFiles} disabled={loadingList} className="gap-1.5">
                {loadingList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Refresh
              </Button>
            </div>
            {entries.length === 0 ? (
              <div className="rounded-lg border border-border/40 bg-muted/10 p-6 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No files in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{PROJECT_DIR}</code>. Add
                  PROJECT-INFO.md, TECH-STACK.md, ROADMAP.md (e.g. via Initialize or scripts/initialize-project.sh).
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs w-20">Size</TableHead>
                    <TableHead className="text-xs w-24">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow
                      key={e.name}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedFile === e.name && "bg-sky-500/10"
                      )}
                      onClick={() => setSelectedFile(e.name)}
                    >
                      <TableCell className="font-mono text-xs">{e.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatSize(e.size)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatUpdatedAt(e.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>

          {/* Document preview */}
          {entries.length > 0 && (
            <SectionCard accentColor="sky">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-semibold">{selectedFile ?? "Select a document"}</h3>
              </div>
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : content ? (
                <ScrollArea className="h-[min(400px,50vh)] rounded-md border border-border/60 p-4">
                  <div className={cn("pr-4", markdownClasses)}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Select a document from the table above.</p>
              )}
            </SectionCard>
          )}

          {/* Run section: scripts from package.json + Play + terminal output */}
          <SectionCard accentColor="emerald">
            <div className="flex items-center gap-2 mb-3">
              <Play className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold">Run</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Run npm scripts from the project directory. Output appears below; if the process prints a localhost URL, an &quot;Open app&quot; link will appear.
            </p>
            {loadingScripts ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-xs">Loading package.json…</span>
              </div>
            ) : Object.keys(scripts).length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 rounded-lg border border-border/40 bg-muted/10 px-4">
                No package.json or no scripts found. Add a package.json with a <code className="rounded bg-muted px-1 font-mono">scripts</code> section to run commands from here.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(scripts).map(([name, cmd]) => {
                    const canRun = isTauri && project.repoPath;
                    return (
                      <TooltipProvider key={name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs"
                                disabled={!canRun}
                                onClick={async () => {
                                  if (!canRun || !project.repoPath) return;
                                  try {
                                    const runId = await runNpmScript(project.repoPath, name);
                                    if (runId) {
                                      setLastRunId(runId);
                                      toast.success("Running. Output below.");
                                    }
                                  } catch (e) {
                                    toast.error(e instanceof Error ? e.message : "Failed to start");
                                  }
                                }}
                              >
                                <Play className="size-3" />
                                {name}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canRun ? `npm run ${name}` : "Run scripts in Tauri app"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
                {!isTauri && Object.keys(scripts).length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Run scripts from the Tauri desktop app to see output here.
                  </p>
                )}
                {lastRunId && (() => {
                  const run = runningRuns.find((r) => r.runId === lastRunId);
                  if (!run) return null;
                  const isRunning = run.status === "running";
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">{run.label}</span>
                        {isRunning && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => stopRun(lastRunId)}
                          >
                            <Square className="size-3" />
                            Stop
                          </Button>
                        )}
                      </div>
                      <TerminalSlot
                        run={{
                          runId: run.runId,
                          label: run.label,
                          logLines: run.logLines,
                          status: run.status,
                          startedAt: run.startedAt,
                          doneAt: run.doneAt,
                          localUrl: run.localUrl,
                        }}
                        slotIndex={0}
                        heightClass="h-[240px]"
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </SectionCard>
        </div>
      </ScrollArea>
    </div>
  );
}

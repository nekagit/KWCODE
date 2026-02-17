"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, FileText, FolderOpen, RefreshCw, Play, Square, FolderGit2, Bot, Folder, Palette, Building2 } from "lucide-react";
import { listProjectFiles, readProjectFileOrEmpty, updateProject, type FileEntry } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
import type { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
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
import { PROJECT_DIR } from "@/lib/cursor-paths";
import { TerminalSlot } from "@/components/shared/TerminalSlot";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectFilesTab } from "@/components/molecules/TabAndContentSections/ProjectFilesTab";
import { SetupDocBlock } from "@/components/molecules/TabAndContentSections/SetupDocBlock";
import { ProjectDesignTab } from "@/components/molecules/TabAndContentSections/ProjectDesignTab";
import { ProjectArchitectureTab } from "@/components/molecules/TabAndContentSections/ProjectArchitectureTab";
import { ArchitectureVisualization, type ResolvedArchitecture } from "@/components/molecules/TabAndContentSections/ArchitectureVisualization";
import { ProjectAgentsSection } from "@/components/molecules/TabAndContentSections/ProjectAgentsSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

/** Extract port from a localhost URL (e.g. http://localhost:3000 -> 3000). */
function getPortFromLocalUrl(url: string): number | null {
  const m = url.match(/:(\d+)(?:\/|$)/);
  return m ? parseInt(m[1], 10) : null;
}

const ADR_DIR = ".cursor/adr";
const RULES_DIR = ".cursor/rules";

interface ProjectProjectTabProps {
  project: Project;
  projectId: string;
  docsRefreshKey?: number;
  /** Called after project is updated (e.g. run port saved) so parent can refetch. */
  onProjectUpdate?: () => void;
}

export function ProjectProjectTab({ project, projectId, docsRefreshKey, onProjectUpdate }: ProjectProjectTabProps) {
  const runNpmScript = useRunStore((s) => s.runNpmScript);
  const runNpmScriptInExternalTerminal = useRunStore((s) => s.runNpmScriptInExternalTerminal);
  const stopRun = useRunStore((s) => s.stopRun);
  const runningRuns = useRunStore((s) => s.runningRuns);
  const [adrEntries, setAdrEntries] = useState<FileEntry[]>([]);
  const [rulesEntries, setRulesEntries] = useState<FileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Record<string, string>>({});
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [savingPort, setSavingPort] = useState(false);
  const [folderRefreshKey, setFolderRefreshKey] = useState(0);
  const cancelledRef = useRef(false);

  const loadAdrAndRules = useCallback(async () => {
    if (!project.repoPath) return;
    cancelledRef.current = false;
    try {
      const [adrList, rulesList] = await Promise.all([
        listProjectFiles(projectId, ADR_DIR, project.repoPath),
        listProjectFiles(projectId, RULES_DIR, project.repoPath),
      ]);
      if (cancelledRef.current) return;
      setAdrEntries((adrList ?? []).filter((e) => !e.isDirectory));
      setRulesEntries((rulesList ?? []).filter((e) => !e.isDirectory));
    } catch {
      if (!cancelledRef.current) {
        setAdrEntries([]);
        setRulesEntries([]);
      }
    }
  }, [projectId, project.repoPath]);

  useEffect(() => {
    cancelledRef.current = false;
    loadAdrAndRules();
    return () => {
      cancelledRef.current = true;
    };
  }, [loadAdrAndRules, docsRefreshKey, folderRefreshKey]);

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

  if (!project.repoPath) {
    return (
      <EmptyState
        icon={<FolderOpen className="size-6 text-muted-foreground" />}
        title="No repo path"
        description={`Set a repository path for this project to load project info from ${PROJECT_DIR}.`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-2 pr-4">
          <Accordion type="single" collapsible defaultValue="run" className="w-full space-y-2">
            {/* Run section: scripts from package.json + Play + terminal output — only one expanded by default */}
            <AccordionItem value="run" className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden data-[state=open]:border-emerald-500/30">
              <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold">Run</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2">
            <p className="text-xs text-muted-foreground mb-4">
              Run npm scripts from the project directory. On macOS, each script opens in Terminal.app; on other platforms output appears below (localhost URL becomes &quot;Open app&quot;).
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
                                    const opened = await runNpmScriptInExternalTerminal(project.repoPath, name);
                                    if (opened) {
                                      toast.success("Opened in Terminal.");
                                      return;
                                    }
                                    const err = useRunStore.getState().error ?? "";
                                    if (err.includes("only supported on macOS")) {
                                      const runId = await runNpmScript(project.repoPath, name);
                                      if (runId) {
                                        setLastRunId(runId);
                                        toast.success("Running. Output below.");
                                      }
                                    } else {
                                      toast.error(err || "Failed to open terminal");
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
                            {canRun ? `npm run ${name} (opens Terminal on Mac)` : "Run scripts in Tauri app"}
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
                  const portFromUrl = run.localUrl ? getPortFromLocalUrl(run.localUrl) : null;
                  const canSavePort =
                    portFromUrl != null &&
                    (project.runPort == null || project.runPort !== portFromUrl);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">{run.label}</span>
                        <div className="flex items-center gap-2">
                          {canSavePort && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs"
                              disabled={savingPort}
                              onClick={async () => {
                                if (portFromUrl == null) return;
                                setSavingPort(true);
                                try {
                                  await updateProject(projectId, { runPort: portFromUrl });
                                  onProjectUpdate?.();
                                  toast.success("Run port saved. Use View Running Project in the top bar.");
                                } catch (e) {
                                  toast.error(e instanceof Error ? e.message : "Failed to save port");
                                } finally {
                                  setSavingPort(false);
                                }
                              }}
                            >
                              {savingPort ? <Loader2 className="size-3 animate-spin" /> : null}
                              Use as project URL
                            </Button>
                          )}
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
              </AccordionContent>
            </AccordionItem>

            {/* Project Files — .cursor directory browser */}
            <AccordionItem
              value="project-files" className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden data-[state=open]:border-rose-500/30">
              <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-semibold">Project Files</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={() => setFolderRefreshKey((k) => k + 1)} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
              <ProjectFilesTab project={project} projectId={projectId} />
            </div>
              </AccordionContent>
            </AccordionItem>

            {/* Design */}
            <AccordionItem value="design" className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden data-[state=open]:border-violet-500/30">
              <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-semibold">Design</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2">
            <SetupDocBlock project={project} projectId={projectId} setupKey="design" docsRefreshKey={docsRefreshKey} />
            <ProjectDesignTab project={project} projectId={projectId} showHeader={false} />
              </AccordionContent>
            </AccordionItem>

            {/* Architecture */}
            <AccordionItem value="architecture" className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden data-[state=open]:border-blue-500/30">
              <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold">Architecture</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2">
            <SetupDocBlock project={project} projectId={projectId} setupKey="architecture" docsRefreshKey={docsRefreshKey} />
            <ArchitectureVisualization
              architectures={
                Array.isArray((project as { architectures?: unknown[] }).architectures)
                  ? (project as unknown as { architectures: ResolvedArchitecture[] }).architectures
                  : []
              }
            />
            <ProjectArchitectureTab project={project} projectId={projectId} showHeader={false} />
              </AccordionContent>
            </AccordionItem>

            {/* ADR — Architecture decision records */}
            <AccordionItem value="adr" className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden data-[state=open]:border-violet-500/30">
              <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-semibold">ADR</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Architecture decision records in <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{ADR_DIR}</code>.
            </p>
            {adrEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">No files in this folder.</p>
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
                  {adrEntries.map((e) => (
                    <TableRow key={e.name}>
                      <TableCell className="font-mono text-xs">{e.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatSize(e.size)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatUpdatedAt(e.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
              </AccordionContent>
            </AccordionItem>

            {/* Agents */}
            <AccordionItem value="agents" className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden data-[state=open]:border-cyan-500/30">
              <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-cyan-500" />
                  <h3 className="text-sm font-semibold">Agents</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2">
            <ProjectAgentsSection project={project} projectId={projectId} />
              </AccordionContent>
            </AccordionItem>

            {/* Rules */}
            <AccordionItem value="rules" className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden data-[state=open]:border-teal-500/30">
              <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-teal-500" />
                  <h3 className="text-sm font-semibold">Rules</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Cursor rules and conventions in <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{RULES_DIR}</code>.
            </p>
            {rulesEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">No files in this folder.</p>
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
                  {rulesEntries.map((e) => (
                    <TableRow key={e.name}>
                      <TableCell className="font-mono text-xs">{e.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatSize(e.size)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatUpdatedAt(e.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

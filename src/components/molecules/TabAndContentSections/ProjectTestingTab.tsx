"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText, TestTube2, RefreshCw } from "lucide-react";
import { AnalyzeButtonSplit } from "@/components/molecules/ControlsAndButtons/AnalyzeButtonSplit";
import { listProjectFiles, readProjectFileOrEmpty, analyzeProjectDoc, type FileEntry } from "@/lib/api-projects";
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

const SETUP_TESTING_PATH = ".cursor/setup/testing.md";
const TESTING_PROMPT_PATH = ".cursor/prompts/testing.md";
const PROMPTS_TESTING_DIR = ".cursor/prompts/testing";

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

type TestingItem = { name: string; path: string; size: number; updatedAt: string };

interface ProjectTestingTabProps {
  project: Project;
  projectId: string;
  docsRefreshKey?: number;
}

export function ProjectTestingTab({ project, projectId, docsRefreshKey }: ProjectTestingTabProps) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const [items, setItems] = useState<TestingItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadList = useCallback(async () => {
    if (!project.repoPath) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    setError(null);
    const result: TestingItem[] = [];
    try {
      const setupList = await listProjectFiles(projectId, ".cursor/setup", project.repoPath);
      const testingMd = setupList.find((e) => !e.isDirectory && e.name === "testing.md");
      if (testingMd) {
        result.push({
          name: "testing.md",
          path: SETUP_TESTING_PATH,
          size: testingMd.size,
          updatedAt: testingMd.updatedAt,
        });
      } else {
        result.push({ name: "testing.md", path: SETUP_TESTING_PATH, size: 0, updatedAt: "" });
      }
      try {
        const promptList = await listProjectFiles(projectId, PROMPTS_TESTING_DIR, project.repoPath);
        const files = promptList.filter((e) => !e.isDirectory);
        for (const e of files) {
          result.push({
            name: e.name,
            path: `${PROMPTS_TESTING_DIR}/${e.name}`,
            size: e.size,
            updatedAt: e.updatedAt,
          });
        }
      } catch {
        // .cursor/prompts/testing may not exist
      }
      setItems(result);
      if (result.length > 0 && !selectedPath) {
        setSelectedPath(result[0].path);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }, [projectId, project.repoPath]);

  useEffect(() => {
    loadList();
  }, [loadList, docsRefreshKey]);

  const loadContent = useCallback(
    async (path: string) => {
      if (!project.repoPath) return;
      setLoadingContent(true);
      setError(null);
      try {
        const text = await readProjectFileOrEmpty(projectId, path, project.repoPath);
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
    if (selectedPath) {
      loadContent(selectedPath);
    } else {
      setContent(null);
    }
  }, [selectedPath, loadContent, docsRefreshKey]);

  const latestUpdated =
    items.length > 0
      ? items.reduce((latest, e) => {
          if (!e.updatedAt) return latest;
          const t = new Date(e.updatedAt).getTime();
          return t > latest ? t : latest;
        }, 0)
      : null;

  if (!project.repoPath) {
    return (
      <EmptyState
        icon={<TestTube2 className="size-6 text-muted-foreground" />}
        title="No repo path"
        description={`Set a repository path for this project to load testing docs from ${SETUP_TESTING_PATH} and ${PROMPTS_TESTING_DIR}.`}
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

  if (error && items.length === 0) {
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
          <SectionCard accentColor="emerald">
            <div className="flex items-center gap-2 mb-3">
              <TestTube2 className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold">Testing</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Main strategy: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{SETUP_TESTING_PATH}</code>.
              Prompt templates: <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{PROMPTS_TESTING_DIR}/</code>.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <CountBadge
                count={items.length}
                label="documents"
                color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              />
              <MetadataBadge
                icon={<FileText className="size-3" />}
                color="bg-muted/50 border-border/50 text-muted-foreground"
              >
                <span className="font-mono text-[10px]">{SETUP_TESTING_PATH}</span>
              </MetadataBadge>
              {latestUpdated !== null && latestUpdated > 0 && (
                <MetadataBadge
                  icon={<span className="text-[10px]">Updated</span>}
                  color="bg-muted/50 border-border/50 text-muted-foreground"
                >
                  {formatUpdatedAt(new Date(latestUpdated).toISOString())}
                </MetadataBadge>
              )}
              <AnalyzeButtonSplit
                promptPath={TESTING_PROMPT_PATH}
                projectId={projectId}
                repoPath={project.repoPath ?? undefined}
                onAnalyze={async () => {
                  setAnalyzing(true);
                  try {
                    const result = await analyzeProjectDoc(
                      projectId,
                      TESTING_PROMPT_PATH,
                      SETUP_TESTING_PATH,
                      project.repoPath ?? undefined,
                      { runTempTicket: isTauri ? runTempTicket : undefined }
                    );
                    if (result?.viaWorker) {
                      toast.success("Analyze started. See Worker tab.");
                      return;
                    }
                    await loadList();
                    setSelectedPath(SETUP_TESTING_PATH);
                    toast.success("Testing doc updated from prompt.");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Analyze failed");
                  } finally {
                    setAnalyzing(false);
                  }
                }}
                analyzing={analyzing}
                label="Analyze"
              />
              <Button variant="ghost" size="sm" onClick={loadList} disabled={loadingList} className="gap-1.5">
                {loadingList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Refresh
              </Button>
            </div>
            {items.length === 0 ? (
              <div className="rounded-lg border border-border/40 bg-muted/10 p-6 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No testing files found. Add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{SETUP_TESTING_PATH}</code> (e.g.
                  via Initialize), or add prompts under <code className="rounded bg-muted px-1 py-0.5 text-xs">{PROMPTS_TESTING_DIR}/</code>.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs w-24">Path</TableHead>
                    <TableHead className="text-xs w-20">Size</TableHead>
                    <TableHead className="text-xs w-24">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.path}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedPath === item.path && "bg-emerald-500/10"
                      )}
                      onClick={() => setSelectedPath(item.path)}
                    >
                      <TableCell className="font-mono text-xs">{item.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[140px]" title={item.path}>
                        {item.path}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.size ? formatSize(item.size) : "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.updatedAt ? formatUpdatedAt(item.updatedAt) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>

          {/* Document preview */}
          {items.length > 0 && (
            <SectionCard accentColor="emerald">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold truncate" title={selectedPath ?? ""}>
                  {selectedPath ?? "Select a document"}
                </h3>
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
        </div>
      </ScrollArea>
    </div>
  );
}

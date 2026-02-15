"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText, BookOpen, RefreshCw, ScanSearch } from "lucide-react";
import { listProjectFiles, readProjectFileOrEmpty, analyzeProjectDoc, type FileEntry } from "@/lib/api-projects";
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

const DOCS_DIR = ".cursor/documentation";
const FALLBACK_PATH = ".cursor/setup/documentation.md";
const DOCUMENTATION_PROMPT_PATH = ".cursor/prompts/documentation.md";

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

interface ProjectDocumentationHubTabProps {
  project: Project;
  projectId: string;
}

export function ProjectDocumentationHubTab({ project, projectId }: ProjectDocumentationHubTabProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const loadFiles = useCallback(async () => {
    if (!project.repoPath) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    setError(null);
    try {
      const list = await listProjectFiles(projectId, DOCS_DIR, project.repoPath);
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
  }, [loadFiles]);

  const loadContent = useCallback(
    async (filename: string) => {
      if (!project.repoPath) return;
      setLoadingContent(true);
      setError(null);
      try {
        const path = `${DOCS_DIR}/${filename}`;
        const text = await readProjectFileOrEmpty(projectId, path, project.repoPath);
        setContent(text && text.trim() ? text : null);
        setFallbackMode(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setContent(null);
      } finally {
        setLoadingContent(false);
      }
    },
    [projectId, project.repoPath]
  );

  const loadFallback = useCallback(async () => {
    if (!project.repoPath) return;
    setLoadingContent(true);
    setError(null);
    try {
      const text = await readProjectFileOrEmpty(projectId, FALLBACK_PATH, project.repoPath);
      setContent(text && text.trim() ? text : null);
      setFallbackMode(true);
    } catch {
      setContent(null);
      setFallbackMode(true);
    } finally {
      setLoadingContent(false);
    }
  }, [projectId, project.repoPath]);

  useEffect(() => {
    if (selectedFile) {
      loadContent(selectedFile);
    } else if (entries.length === 0 && !loadingList && project.repoPath) {
      loadFallback();
    } else {
      setContent(null);
    }
  }, [selectedFile, entries.length, loadingList, project.repoPath, loadContent, loadFallback]);

  const latestUpdated =
    entries.length > 0
      ? entries.reduce((latest, e) => {
          if (!e.updatedAt) return latest;
          const t = new Date(e.updatedAt).getTime();
          return t > latest ? t : latest;
        }, 0)
      : null;

  if (!project.repoPath) {
    return (
      <EmptyState
        icon={<BookOpen className="size-6 text-muted-foreground" />}
        title="No repo path"
        description={`Set a repository path for this project to load documentation from ${DOCS_DIR}.`}
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

  if (error && entries.length === 0 && !content) {
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
          <SectionCard accentColor="teal">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-semibold">Documentation hub</h3>
              {fallbackMode && (
                <span className="text-xs text-muted-foreground">(viewing {FALLBACK_PATH})</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Docs in <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{DOCS_DIR}</code> (e.g.
              setup-guide.md, development-guide.md). Fallback: <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{FALLBACK_PATH}</code>.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <CountBadge
                count={entries.length}
                label="documents"
                color="bg-teal-500/10 border-teal-500/20 text-teal-400"
              />
              <MetadataBadge
                icon={<FileText className="size-3" />}
                color="bg-muted/50 border-border/50 text-muted-foreground"
              >
                <span className="font-mono text-[10px]">{DOCS_DIR}</span>
              </MetadataBadge>
              {latestUpdated !== null && (
                <MetadataBadge
                  icon={<span className="text-[10px]">Updated</span>}
                  color="bg-muted/50 border-border/50 text-muted-foreground"
                >
                  {formatUpdatedAt(new Date(latestUpdated).toISOString())}
                </MetadataBadge>
              )}
              <Button variant="default" size="sm" onClick={async () => {
                setAnalyzing(true);
                try {
                  await analyzeProjectDoc(projectId, DOCUMENTATION_PROMPT_PATH, FALLBACK_PATH, project.repoPath ?? undefined);
                  await loadFiles();
                  if (fallbackMode) await loadFallback();
                  else if (selectedFile) await loadContent(selectedFile);
                  toast.success("Documentation updated from prompt.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Analyze failed");
                } finally {
                  setAnalyzing(false);
                }
              }} disabled={analyzing} className="gap-1.5">
                {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />}
                Analyze
              </Button>
              <Button variant="ghost" size="sm" onClick={loadFiles} disabled={loadingList} className="gap-1.5">
                {loadingList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Refresh
              </Button>
            </div>
            {entries.length === 0 ? (
              <div className="rounded-lg border border-border/40 bg-muted/10 p-6 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  No files in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{DOCS_DIR}</code>. Add
                  setup-guide.md, development-guide.md, or other docs.
                </p>
                <Button variant="outline" size="sm" onClick={loadFallback}>
                  Load {FALLBACK_PATH}
                </Button>
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
                        selectedFile === e.name && "bg-teal-500/10"
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
          {(entries.length > 0 || content) && (
            <SectionCard accentColor="teal">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-teal-500" />
                <h3 className="text-sm font-semibold">
                  {fallbackMode ? FALLBACK_PATH : selectedFile ?? "Select a document"}
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
              ) : entries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Click &quot;Load {FALLBACK_PATH}&quot; above to view the setup documentation.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Select a document from the table above.</p>
              )}
            </SectionCard>
          )}

          {/* Fallback CTA when folder has files but user might want setup doc too */}
          {entries.length > 0 && !fallbackMode && (
            <SectionCard accentColor="teal" className="border-dashed">
              <p className="text-xs text-muted-foreground mb-2">
                You can also open the setup documentation file:
              </p>
              <Button variant="outline" size="sm" onClick={loadFallback}>
                Open {FALLBACK_PATH}
              </Button>
            </SectionCard>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText, BookOpen } from "lucide-react";
import { listProjectFiles, readProjectFileOrEmpty } from "@/lib/api-projects";
import type { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DOCS_DIR = ".cursor/documentation";
const FALLBACK_PATH = ".cursor/setup/documentation.md";

const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 last:[&_p]:mb-0 [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1";

interface ProjectDocumentationHubTabProps {
  project: Project;
  projectId: string;
}

export function ProjectDocumentationHubTab({ project, projectId }: ProjectDocumentationHubTabProps) {
  const [files, setFiles] = useState<{ name: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  const loadFiles = useCallback(async () => {
    if (!project.repoPath) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    setError(null);
    try {
      const list = await listProjectFiles(projectId, DOCS_DIR, project.repoPath);
      const mdFiles = list
        .filter((e) => !e.isDirectory && e.name.toLowerCase().endsWith(".md"))
        .map((e) => ({ name: e.name }));
      setFiles(mdFiles);
      if (mdFiles.length > 0 && !selectedFile) {
        setSelectedFile(mdFiles[0].name);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setFiles([]);
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
    } else if (files.length === 0 && !loadingList && project.repoPath) {
      loadFallback();
    } else {
      setContent(null);
    }
  }, [selectedFile, files.length, loadingList, project.repoPath, loadContent, loadFallback]);

  if (!project.repoPath) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Set a repository path for this project to load documentation from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{DOCS_DIR}</code>.
        </p>
      </div>
    );
  }

  if (loadingList) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/40 bg-muted/10 py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading documentation list…</p>
        </div>
      </div>
    );
  }

  if (error && files.length === 0 && !content) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard accentColor="teal">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-teal-500" />
          <h3 className="text-sm font-semibold">Documentation hub</h3>
          {fallbackMode && (
            <span className="text-xs text-muted-foreground">(fallback: .cursor/setup/documentation.md)</span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          {files.length > 0 && (
            <div className="flex-shrink-0 space-y-1 min-w-[180px]">
              <p className="text-xs font-medium text-muted-foreground">.cursor/documentation/</p>
              <ScrollArea className="h-[200px] sm:h-[320px] rounded-md border border-border/60 p-2">
                {files.map((f) => (
                  <Button
                    key={f.name}
                    variant={selectedFile === f.name ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start font-mono text-xs"
                    onClick={() => setSelectedFile(f.name)}
                  >
                    {f.name}
                  </Button>
                ))}
              </ScrollArea>
            </div>
          )}
          <div className="flex-1 min-w-0">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : content ? (
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className={cn("p-2 pr-4", markdownClasses)}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : files.length === 0 && !content ? (
              <div className="rounded-lg border border-border/40 bg-muted/10 p-6 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No files in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{DOCS_DIR}</code>. Add
                  setup-guide.md, development-guide.md, or other docs.
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={loadFallback}>
                  Load .cursor/setup/documentation.md
                </Button>
              </div>
            ) : files.length === 0 && content ? (
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className={cn("p-2 pr-4", markdownClasses)}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">Select a document.</p>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

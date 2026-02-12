"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, FileText } from "lucide-react";
import { readProjectFile } from "@/lib/api-projects";
import type { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SETUP_DIR = ".cursor/setup";

export type SetupDocKey = "design" | "ideas" | "architecture" | "testing" | "documentation";

interface SetupDocBlockProps {
  project: Project;
  projectId: string;
  setupKey: SetupDocKey;
  className?: string;
  /** Max height of the doc preview area (default 160px) */
  maxHeight?: string;
}

export function SetupDocBlock({
  project,
  projectId,
  setupKey,
  className,
  maxHeight = "160px",
}: SetupDocBlockProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const path = `${SETUP_DIR}/${setupKey}.md`;

  const fetchDoc = useCallback(async () => {
    if (!project.repoPath) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await readProjectFile(projectId, path, project.repoPath);
      setContent(text);
    } catch (e) {
      if (!/not found|file not found/i.test(String(e))) {
        setError(e instanceof Error ? e.message : String(e));
      }
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, path, project.repoPath]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  if (!project.repoPath) return null;

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-border/40 bg-muted/10",
          className
        )}
        style={{ minHeight: maxHeight }}
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive",
          className
        )}
      >
        {error}
      </div>
    );
  }

  if (content == null || content.trim() === "") return null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        <span className="font-medium">{path}</span>
      </div>
      <ScrollArea
        className="rounded-lg border border-border/40 bg-muted/10 font-mono text-xs leading-relaxed"
        style={{ maxHeight }}
      >
        <pre className="whitespace-pre-wrap break-words p-3">{content}</pre>
      </ScrollArea>
    </div>
  );
}

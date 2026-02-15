"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText, TestTube2, Lightbulb } from "lucide-react";
import { readProjectFileOrEmpty } from "@/lib/api-projects";
import type { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import type { AccentColor } from "@/components/shared/DisplayPrimitives";
import { cn } from "@/lib/utils";

export type ProjectSetupDocKey = "testing" | "documentation" | "ideas";

const SETUP_DIR = ".cursor/setup";

const CONFIG: Record<
  ProjectSetupDocKey,
  { label: string; accentColor: AccentColor; iconColor: string }
> = {
  testing: { label: "Testing", accentColor: "emerald", iconColor: "text-emerald-500" },
  documentation: { label: "Documentation", accentColor: "teal", iconColor: "text-teal-500" },
  ideas: { label: "Ideas", accentColor: "amber", iconColor: "text-amber-500" },
};

const ICONS: Record<ProjectSetupDocKey, React.ComponentType<{ className?: string }>> = {
  testing: TestTube2,
  documentation: FileText,
  ideas: Lightbulb,
};

/** Minimal prose-style classes for markdown (aligned with SetupDocBlock). */
const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 last:[&_p]:mb-0 [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1";

interface ProjectSetupDocTabProps {
  project: Project;
  projectId: string;
  setupKey: ProjectSetupDocKey;
}

export function ProjectSetupDocTab({ project, projectId, setupKey }: ProjectSetupDocTabProps) {
  const path = `${SETUP_DIR}/${setupKey}.md`;
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoc = useCallback(async () => {
    if (!project.repoPath) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await readProjectFileOrEmpty(projectId, path, project.repoPath);
      setContent(text && text.trim() ? text : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, path, project.repoPath]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const config = CONFIG[setupKey];
  const Icon = ICONS[setupKey];

  if (!project.repoPath) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Set a repository path for this project to load {config.label.toLowerCase()} from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{path}</code>.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/40 bg-muted/10 py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading {config.label.toLowerCase()}…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/10 p-6 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{path}</code> to describe{" "}
          {config.label.toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <SectionCard accentColor={config.accentColor}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-4 w-4", config.iconColor)} />
        <h3 className="text-sm font-semibold">{config.label}</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className={cn("p-2 pr-4", markdownClasses)}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </ScrollArea>
    </SectionCard>
  );
}

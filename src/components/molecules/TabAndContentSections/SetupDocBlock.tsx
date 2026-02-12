"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText, BookOpen, Play } from "lucide-react";
import { readProjectFileOrEmpty } from "@/lib/api-projects";
import type { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { cn } from "@/lib/utils";
import { isTauri } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
import { toast } from "sonner";

const SETUP_DIR = ".cursor/setup";
const PROMPTS_DIR = ".cursor/prompts";

export type SetupDocKey = "design" | "ideas" | "architecture" | "testing" | "documentation";

const SETUP_LABELS: Record<SetupDocKey, string> = {
  design: "Design",
  ideas: "Ideas",
  architecture: "Architecture",
  testing: "Testing",
  documentation: "Documentation",
};

interface SetupDocBlockProps {
  project: Project;
  projectId: string;
  setupKey: SetupDocKey;
  className?: string;
  /** Max height of the doc preview area (default 160px) */
  maxHeight?: string;
}

/** Minimal prose-style classes for markdown rendered in section and dialogs (no @tailwindcss/typography). */
const markdownClasses = "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 last:[&_p]:mb-0";

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
  const [promptContent, setPromptContent] = useState<string | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);

  const setupPath = `${SETUP_DIR}/${setupKey}.md`;
  const promptPath = `${PROMPTS_DIR}/${setupKey}.md`;
  const label = SETUP_LABELS[setupKey];
  const [runPromptLoading, setRunPromptLoading] = useState(false);
  const runSetupPrompt = useRunStore((s) => s.runSetupPrompt);
  const floatingRunId = useRunStore((s) => s.floatingTerminalRunId);
  const runningRuns = useRunStore((s) => s.runningRuns);
  const floatingRun = floatingRunId
    ? runningRuns.find((r) => r.runId === floatingRunId)
    : null;
  const isFloatingRunning = floatingRun?.status === "running";

  const fetchDoc = useCallback(async () => {
    if (!project.repoPath) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await readProjectFileOrEmpty(projectId, setupPath, project.repoPath);
      setContent(text && text.trim() ? text : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, setupPath, project.repoPath]);

  const fetchPrompt = useCallback(async () => {
    if (!project.repoPath) return;
    setPromptLoading(true);
    try {
      const text = await readProjectFileOrEmpty(projectId, promptPath, project.repoPath);
      setPromptContent(text && text.trim() ? text : null);
    } finally {
      setPromptLoading(false);
    }
  }, [projectId, promptPath, project.repoPath]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const openSetupDialog = () => setShowSetupDialog(true);
  const openPromptDialog = async () => {
    if (promptContent === null && !promptLoading) await fetchPrompt();
    setShowPromptDialog(true);
  };

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

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openSetupDialog}
          className="gap-2"
        >
          <FileText className="h-3.5 w-3.5" />
          View {setupKey}.md
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openPromptDialog}
          disabled={promptLoading}
          className="gap-2"
        >
          {promptLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <BookOpen className="h-3.5 w-3.5" />
          )}
          View prompt
        </Button>
        {isTauri && (
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={runPromptLoading || isFloatingRunning}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm shadow-emerald-500/20"
            onClick={async () => {
              if (!project.repoPath) return;
              setRunPromptLoading(true);
              try {
                // Ensure prompt content is fetched
                let pc = promptContent;
                if (pc === null) {
                  const text = await readProjectFileOrEmpty(projectId, promptPath, project.repoPath);
                  pc = text && text.trim() ? text : null;
                  setPromptContent(pc);
                }
                if (!pc || !pc.trim()) {
                  toast.error(`No prompt found at ${promptPath}`);
                  return;
                }
                await runSetupPrompt(project.repoPath.trim(), pc, label);
                toast.success(`Running ${label} prompt. Check the floating terminal.`);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : String(e));
              } finally {
                setRunPromptLoading(false);
              }
            }}
          >
            {runPromptLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Run Prompt
          </Button>
        )}
      </div>

      {content != null && content.trim() !== "" ? (
        <ScrollArea
          className="rounded-lg border border-border/40 bg-muted/10 p-3"
          style={{ maxHeight }}
        >
          <div className={cn("markdown-body", markdownClasses)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </ScrollArea>
      ) : (
        <p className="text-xs text-muted-foreground">Setup file empty or missing.</p>
      )}

      <SharedDialog
        isOpen={showSetupDialog}
        title={setupPath}
        onClose={() => setShowSetupDialog(false)}
        panelClassName="max-h-[90vh] h-[90vh] w-full max-w-4xl flex flex-col"
        bodyClassName="flex-1 min-h-0 overflow-hidden mt-6 flex flex-col"
      >
        <ScrollArea className="flex-1 min-h-0 pr-4">
          {content != null && content.trim() !== "" ? (
            <div className={cn("markdown-body p-1", markdownClasses)}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No content.</p>
          )}
        </ScrollArea>
      </SharedDialog>

      <SharedDialog
        isOpen={showPromptDialog}
        title={promptPath}
        onClose={() => setShowPromptDialog(false)}
        panelClassName="max-h-[90vh] h-[90vh] w-full max-w-4xl flex flex-col"
        bodyClassName="flex-1 min-h-0 overflow-hidden mt-6 flex flex-col"
      >
        <ScrollArea className="flex-1 min-h-0 pr-4">
          {promptLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : promptContent != null && promptContent.trim() !== "" ? (
            <div className={cn("markdown-body p-1", markdownClasses)}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{promptContent}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No content.</p>
          )}
        </ScrollArea>
      </SharedDialog>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { EmptyState } from "@/components/shared/EmptyState";
import { Flag, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import {
  readProjectFileOrEmpty,
  listProjectFiles,
  analyzeProjectDoc,
} from "@/lib/api-projects";
import { AnalyzeButtonSplit } from "@/components/molecules/ControlsAndButtons/AnalyzeButtonSplit";
import { isTauri } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
import { cn } from "@/lib/utils";

const MILESTONES_DIR = ".cursor/milestones";
const MILESTONE_PROMPT_PATH = ".cursor/prompts/milestone.md";
const MILESTONE_OUTPUT_PATH = ".cursor/setup/milestone.md";

const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 last:[&_p]:mb-0 [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1";

interface ProjectMilestonesTabProps {
  project: Project;
  projectId: string;
  onTicketAdded?: () => void;
}

export function ProjectMilestonesTab({
  project,
  projectId,
}: ProjectMilestonesTabProps) {
  const [milestoneFiles, setMilestoneFiles] = useState<string[]>([]);
  const [selectedMilestoneFile, setSelectedMilestoneFile] = useState<string | null>(null);
  const [milestoneContent, setMilestoneContent] = useState<string | null>(null);
  const [loadingMilestoneList, setLoadingMilestoneList] = useState(true);
  const [loadingMilestoneContent, setLoadingMilestoneContent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!project.repoPath) {
      setLoadingMilestoneList(false);
      return;
    }
    let cancelled = false;
    setLoadingMilestoneList(true);
    listProjectFiles(projectId, MILESTONES_DIR, project.repoPath)
      .then((list) => {
        if (cancelled) return;
        const md = list
          .filter((e) => !e.isDirectory && (e.name.endsWith(".md") || e.name.endsWith(".milestone.md")))
          .map((e) => e.name)
          .sort();
        setMilestoneFiles(md);
      })
      .catch(() => {
        if (!cancelled) setMilestoneFiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMilestoneList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, project.repoPath]);

  useEffect(() => {
    if (!selectedMilestoneFile || !project.repoPath) {
      setMilestoneContent(null);
      return;
    }
    let cancelled = false;
    setLoadingMilestoneContent(true);
    readProjectFileOrEmpty(projectId, `${MILESTONES_DIR}/${selectedMilestoneFile}`, project.repoPath)
      .then((text) => {
        if (!cancelled) setMilestoneContent(text?.trim() || null);
      })
      .catch(() => {
        if (!cancelled) setMilestoneContent(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingMilestoneContent(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, project.repoPath, selectedMilestoneFile]);

  const runTempTicket = useRunStore((s) => s.runTempTicket);

  const handleAnalyze = useCallback(async () => {
    if (!project.repoPath?.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeProjectDoc(
        projectId,
        MILESTONE_PROMPT_PATH,
        MILESTONE_OUTPUT_PATH,
        project.repoPath,
        { runTempTicket: isTauri ? runTempTicket : undefined }
      );
      if (result?.viaWorker) {
        toast.success("Analyze started. See Worker tab.");
        return;
      }
      toast.success("Milestone analysis updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  }, [projectId, project.repoPath, isTauri, runTempTicket]);

  if (!project.repoPath?.trim()) {
    return (
      <EmptyState
        icon={<Flag className="size-6 text-muted-foreground" />}
        title="No repo path"
        description="Set a repo path for this project to use milestones and add tickets."
      />
    );
  }

  const hasNoMilestones =
    !loadingMilestoneList && milestoneFiles.length === 0;

  if (hasNoMilestones) {
    return (
      <EmptyState
        icon={<Flag className="size-6 text-muted-foreground" />}
        title="No milestones yet"
        description="Run Analyze to generate milestone content, or add .md files to .cursor/milestones/."
        action={
          <AnalyzeButtonSplit
            promptPath={MILESTONE_PROMPT_PATH}
            projectId={projectId}
            repoPath={project.repoPath ?? undefined}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            label="Analyze to generate"
          />
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <SectionCard accentColor="orange" className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">Milestone files</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Content from <code className="rounded bg-muted px-1 py-0.5">{MILESTONES_DIR}</code>. Click a file to view.
        </p>
        {loadingMilestoneList ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading…</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 flex-1 min-h-0">
            <div className="flex flex-wrap gap-1.5 min-w-0 sm:flex-col sm:flex-nowrap sm:max-w-[200px]">
              {milestoneFiles.map((name) => (
                <Button
                  key={name}
                  variant={selectedMilestoneFile === name ? "secondary" : "outline"}
                  size="sm"
                  className="font-mono text-xs justify-start"
                  onClick={() => setSelectedMilestoneFile(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
            <div className="flex-1 min-w-0 border border-border/60 rounded-md overflow-hidden flex flex-col">
              {loadingMilestoneContent ? (
                <div className="flex items-center justify-center flex-1 py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : milestoneContent ? (
                <ScrollArea className="flex-1 min-h-[300px]">
                  <div className={cn("p-4", markdownClasses)}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{milestoneContent}</ReactMarkdown>
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-6 text-sm text-muted-foreground text-center flex-1 flex items-center justify-center">
                  Select a file to view its content.
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

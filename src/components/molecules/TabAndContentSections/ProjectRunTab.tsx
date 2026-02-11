"use client";

import { useState, useCallback, useEffect } from "react";
import type { Project } from "@/types/project";
import { readProjectFile } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { buildKanbanFromMd, type TodosKanbanData } from "@/lib/todos-kanban";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { Terminal } from "lucide-react";
import {
  ImplementAllToolbar,
  ImplementAllTerminalsGrid,
} from "@/components/molecules/TabAndContentSections/ProjectTicketsTab";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { cn } from "@/lib/utils";

const classes = getClasses("TabAndContentSections/ProjectTicketsTab.tsx");

interface ProjectRunTabProps {
  project: Project;
  projectId: string;
}

export function ProjectRunTab({ project, projectId }: ProjectRunTabProps) {
  const [kanbanData, setKanbanData] = useState<TodosKanbanData | null>(null);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanError, setKanbanError] = useState<string | null>(null);

  const loadKanbanFromMd = useCallback(async () => {
    const repoPath = project.repoPath?.trim();
    if (!repoPath) {
      setKanbanData(null);
      setKanbanError(null);
      return;
    }
    setKanbanLoading(true);
    setKanbanError(null);
    try {
      const [ticketsMd, featuresMd] = await Promise.all([
        readProjectFile(projectId, ".cursor/tickets.md", repoPath),
        readProjectFile(projectId, ".cursor/features.md", repoPath),
      ]);
      const data = buildKanbanFromMd(ticketsMd, featuresMd);
      setKanbanData(data);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
    } finally {
      setKanbanLoading(false);
    }
  }, [project, projectId]);

  useEffect(() => {
    loadKanbanFromMd();
  }, [loadKanbanFromMd]);

  if (!project.repoPath?.trim()) {
    return (
      <div className="min-w-0 flex flex-col rounded-lg border border-border bg-card/50 p-4 shadow-sm">
        <EmptyState
          icon={<Terminal className="h-8 w-8 text-muted-foreground" />}
          title="No repo path"
          description="Set a repo path for this project in Setup to run and view terminals here."
        />
      </div>
    );
  }

  if (kanbanLoading) {
    return (
      <div className="min-w-0 flex flex-col rounded-lg border border-border bg-card/50 p-4 shadow-sm">
        <LoadingState />
      </div>
    );
  }

  if (kanbanError) {
    return (
      <div className="min-w-0 flex flex-col rounded-lg border border-border bg-card/50 p-4 shadow-sm">
        <ErrorDisplay message={kanbanError} />
      </div>
    );
  }

  if (!isTauri) {
    return (
      <div className="min-w-0 flex flex-col rounded-lg border border-border bg-card/50 p-4 shadow-sm">
        <EmptyState
          icon={<Terminal className="h-8 w-8 text-muted-foreground" />}
          title="Run in Tauri"
          description="Terminals and Implement All are available when running the app in Tauri (desktop)."
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 flex flex-col gap-4 rounded-lg border border-border bg-card/50 p-4 shadow-sm">
      <div className={cn(classes[9], "mb-2")}>
        <ImplementAllToolbar projectPath={project.repoPath.trim()} kanbanData={kanbanData} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-col rounded-lg border border-border bg-card m-4 p-6 shadow-sm overflow-hidden">
        <h3 className={cn(classes[33], "mb-3 mt-0")}>
          <Terminal className={classes[11]} />
          Terminals
        </h3>
        <ImplementAllTerminalsGrid />
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Ticket as TicketIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { updateProject } from "@/lib/api-projects";
import {
  parseTodosToKanban,
  markTicketsDone,
  validateFeaturesTicketsCorrelation,
  type TodosKanbanData,
  type ParsedTicket
} from "@/lib/todos-kanban";
import { buildKanbanContextBlock } from "@/lib/analysis-prompt";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { ProjectCategoryHeader } from "@/components/shared/ProjectCategoryHeader";
import { ProjectTicketsKanbanColumn } from "@/components/organisms/ProjectTicketsKanbanColumn";
import { GenerateKanbanPromptSection } from "@/components/atoms/forms/GenerateKanbanPromptSection";

interface ProjectTicketsTabProps {
  project: Project;
  projectId: string;
  exportLoading: boolean;
  generateExport: (category: string) => Promise<void>;
  fetchProject: () => Promise<void>;
}

export function ProjectTicketsTab({
  project,
  projectId,
  exportLoading,
  generateExport,
  fetchProject,
}: ProjectTicketsTabProps) {
  const [kanbanData, setKanbanData] = useState<TodosKanbanData | null>(null);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanError, setKanbanError] = useState<string | null>(null);
  const [kanbanPrompt, setKanbanPrompt] = useState("");
  const [kanbanPromptLoading, setKanbanPromptLoading] = useState(false);
  const [showFeatureTicketWarning, setShowFeatureTicketWarning] = useState(false);

  const generateKanban = useCallback(async () => {
    if (!project) return;
    setKanbanLoading(true);
    setKanbanError(null);
    try {
      const data = await parseTodosToKanban(project.ticketIds, project.featureIds);
      setKanbanData(data);
      const { hasInvalidFeatures } = validateFeaturesTicketsCorrelation(data);
      setShowFeatureTicketWarning(hasInvalidFeatures);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
    } finally {
      setKanbanLoading(false);
    }
  }, [project]);

  const generateKanbanPrompt = useCallback(async () => {
    if (!project || !kanbanData) return;
    setKanbanPromptLoading(true);
    setKanbanError(null);
    try {
      const block = buildKanbanContextBlock(kanbanData);
      setKanbanPrompt(block);
    } catch (e) {
      setKanbanError(e instanceof Error ? e.message : String(e));
    } finally {
      setKanbanPromptLoading(false);
    }
  }, [project, kanbanData]);

  const handleMarkDone = useCallback(async (ticketId: string) => {
    if (!project) return;
    try {
      const updatedTickets = markTicketsDone(kanbanData?.tickets || [], [ticketId]);
      await updateProject(projectId, { ticketIds: updatedTickets.map((t: ParsedTicket) => t.id) });
      await fetchProject();
      toast.success("Ticket marked as done.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }, [project, projectId, kanbanData, fetchProject]);

  useEffect(() => {
    if (project) {
      generateKanban();
    }
  }, [project, generateKanban]);

  return (
    <div className="mt-4 space-y-6">
      <ProjectCategoryHeader
        title="Tickets"
        icon={<TicketIcon className="h-6 w-6" />}
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={generateExport}
        category="tickets"
      />

      {showFeatureTicketWarning && (
        <ErrorDisplay
          title="Feature-Ticket Mismatch"
          message="Some features reference tickets that do not exist or are not linked to this project. Consider editing your features."
          icon={<AlertCircle className="h-4 w-4" />}
        />
      )}

      {kanbanLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : kanbanError ? (
        <ErrorDisplay message={kanbanError} />
      ) : !kanbanData || Object.keys(kanbanData.columns).every(key => kanbanData.columns[key].items.length === 0) ? (
        <EmptyState
          icon={<TicketIcon className="h-6 w-6" />}
          title="No tickets yet"
          description="Create new tickets to track tasks and bugs for your project."
          action={
            <Button asChild>
              <Link href={`/tickets?projectId=${projectId}`}>
                <Plus className="h-4 w-4 mr-2" />
                New ticket
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(kanbanData.columns).map(([columnId, column]) => (
            <ProjectTicketsKanbanColumn
              key={columnId}
              columnId={columnId}
              column={column}
              kanbanFeatures={kanbanData.features}
              projectId={projectId}
              handleMarkDone={handleMarkDone}
            />
          ))}
        </div>
      )}

      <GenerateKanbanPromptSection
        kanbanData={kanbanData}
        kanbanPrompt={kanbanPrompt}
        kanbanPromptLoading={kanbanPromptLoading}
        generateKanbanPrompt={generateKanbanPrompt}
      />
    </div>
  );
}

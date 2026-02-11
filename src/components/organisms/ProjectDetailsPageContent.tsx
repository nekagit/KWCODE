"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import type { Project, ProjectEntityCategories } from "@/types/project";
import { getProjectResolved, getProjectExport } from "@/lib/api-projects";
import { ProjectHeader } from "@/components/molecules/LayoutAndNavigation/ProjectHeader/ProjectHeader";
import { ProjectTabs } from "@/components/molecules/LayoutAndNavigation/ProjectTabs/ProjectTabs";
import { ProjectDesignTab } from "@/components/molecules/TabAndContentSections/ProjectDesignTab/ProjectDesignTab";
import { ProjectIdeasTab } from "@/components/molecules/TabAndContentSections/ProjectIdeasTab/ProjectIdeasTab";
import { ProjectFeaturesTab } from "@/components/molecules/TabAndContentSections/ProjectFeaturesTab/ProjectFeaturesTab";
import { ProjectTicketsTab } from "@/components/molecules/TabAndContentSections/ProjectTicketsTab/ProjectTicketsTab";
import { ProjectPromptsTab } from "@/components/molecules/TabAndContentSections/ProjectPromptsTab/ProjectPromptsTab";
import { ProjectArchitectureTab } from "@/components/molecules/TabAndContentSections/ProjectArchitectureTab/ProjectArchitectureTab";
import { ExportContentDialog } from "@/components/molecules/FormsAndDialogs/ExportContentDialog/ExportContentDialog";

export function ProjectDetailsPageContent() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectEntityCategories>("design");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportContent, setExportContent] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectResolved(projectId);
      setProject(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const generateExport = useCallback(async (category: ProjectEntityCategories) => {
    setExportLoading(true);
    setExportContent("");
    try {
      const content = await getProjectExport(projectId, category);
      setExportContent(content);
      setShowExportDialog(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExportLoading(false);
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => setError(null)}>Clear error</Button>
      </div>
    );
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} projectId={projectId} />

      <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} project={project} />

      {/* Design Tab */}
      <ProjectDesignTab
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={() => generateExport("design")}
      />

      {/* Ideas Tab */}
      <ProjectIdeasTab
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={() => generateExport("ideas")}
      />

      {/* Features Tab */}
      <ProjectFeaturesTab
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={() => generateExport("features")}
      />

      {/* Tickets Tab */}
      <ProjectTicketsTab
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={() => generateExport("tickets")}
        fetchProject={fetchProject}
      />

      {/* Prompts Tab */}
      <ProjectPromptsTab
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={() => generateExport("prompts")}
      />

      {/* Architecture Tab */}
      <ProjectArchitectureTab
        project={project}
        projectId={projectId}
        exportLoading={exportLoading}
        generateExport={() => generateExport("architectures")}
      />

      <ExportContentDialog
        showExportDialog={showExportDialog}
        setShowExportDialog={setShowExportDialog}
        exportContent={exportContent}
      />
    </div>
  );
}

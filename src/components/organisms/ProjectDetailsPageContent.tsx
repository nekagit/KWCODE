"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import type { Project, ProjectEntityCategories, ProjectTabCategory } from "@/types/project";
import { getProjectResolved, getProjectExport } from "@/lib/api-projects";
import { ProjectHeader } from "@/components/molecules/LayoutAndNavigation/ProjectHeader";
import { ProjectTabs } from "@/components/molecules/LayoutAndNavigation/ProjectTabs";
import { ProjectDesignTab } from "@/components/molecules/TabAndContentSections/ProjectDesignTab";
import { ProjectIdeasTab } from "@/components/molecules/TabAndContentSections/ProjectIdeasTab";
import { ProjectFeaturesTab } from "@/components/molecules/TabAndContentSections/ProjectFeaturesTab"; // Corrected syntax
import { ProjectTicketsTab } from "@/components/molecules/TabAndContentSections/ProjectTicketsTab";
import { ProjectPromptRecordsTab } from "@/components/molecules/TabAndContentSections/ProjectPromptsTab";
import { ProjectArchitectureTab } from "@/components/molecules/TabAndContentSections/ProjectArchitectureTab";
import { ExportContentDialog } from "@/components/molecules/FormsAndDialogs/ExportContentDialog";
import type { ResolvedProject } from "@/lib/api-projects";

export function ProjectDetailsPageContent() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectTabCategory>("design");

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

  const generateExport = useCallback(async (category: ProjectTabCategory) => {
    setExportLoading(true);
    setExportContent("");
    try {
      let exportCategory: keyof ResolvedProject;
      if (category === "design") {
        exportCategory = "designs";
      } else if (category === "architecture") {
        exportCategory = "architectures";
      } else {
        exportCategory = category as "ideas" | "features" | "tickets" | "prompts";
      }
      const content = await getProjectExport(projectId, exportCategory);
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

      {activeTab === "design" && (
        <ProjectDesignTab
          project={project}
          projectId={projectId}
          exportLoading={exportLoading}
          generateExport={() => generateExport("design")}
        />
      )}

      {activeTab === "ideas" && (
        <ProjectIdeasTab
          project={project}
          projectId={projectId}
          exportLoading={exportLoading}
          generateExport={() => generateExport("ideas")}
        />
      )}

      {activeTab === "features" && (
        <ProjectFeaturesTab
          project={project}
          projectId={projectId}
          exportLoading={exportLoading}
          generateExport={() => generateExport("features")}
        />
      )}

      {activeTab === "tickets" && (
        <ProjectTicketsTab
          project={project}
          projectId={projectId}
          exportLoading={exportLoading}
          generateExport={() => generateExport("tickets")}
          fetchProject={fetchProject}
        />
      )}

      {activeTab === "prompts" && (
        <ProjectPromptRecordsTab
          project={project}
          projectId={projectId}
          exportLoading={exportLoading}
          generateExport={() => generateExport("prompts")}
        />
      )}

      {activeTab === "architecture" && (
        <ProjectArchitectureTab
          project={project}
          projectId={projectId}
          exportLoading={exportLoading}
          generateExport={() => generateExport("architecture")}
        />
      )}

      <ExportContentDialog
        showExportDialog={showExportDialog}
        setShowExportDialog={setShowExportDialog}
        exportContent={exportContent}
      />
    </div>
  );
}

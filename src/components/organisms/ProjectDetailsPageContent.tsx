"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, FolderGit2, ListTodo, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types/project";
import { getProjectResolved } from "@/lib/api-projects";
import { ProjectHeader } from "@/components/molecules/LayoutAndNavigation/ProjectHeader";
import { ProjectGitTab } from "@/components/molecules/TabAndContentSections/ProjectGitTab";
import { ProjectDesignTab } from "@/components/molecules/TabAndContentSections/ProjectDesignTab";
import { ProjectIdeasTab } from "@/components/molecules/TabAndContentSections/ProjectIdeasTab";
import { ProjectFeaturesTab } from "@/components/molecules/TabAndContentSections/ProjectFeaturesTab";
import { ProjectTicketsTab } from "@/components/molecules/TabAndContentSections/ProjectTicketsTab";
import { ProjectPromptRecordsTab } from "@/components/molecules/TabAndContentSections/ProjectPromptsTab";
import { ProjectArchitectureTab } from "@/components/molecules/TabAndContentSections/ProjectArchitectureTab";

export function ProjectDetailsPageContent() {
  const params = useParams();
  const projectId = (params?.id as string) ?? "";
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectResolved(projectId);
      if (mountedRef.current) setProject(data);
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 text-destructive/90" />
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

      <Tabs defaultValue="todo" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="git" className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-success/90" />
            Git
          </TabsTrigger>
          <TabsTrigger value="todo" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-info/90" />
            Todo
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground/90" />
            Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="git" className="mt-4">
          <ProjectGitTab project={project} projectId={projectId} />
        </TabsContent>

        <TabsContent value="todo" className="mt-4 space-y-6">
          <ProjectTicketsTab
            project={project}
            projectId={projectId}
            fetchProject={fetchProject}
          />
          <ProjectFeaturesTab project={project} projectId={projectId} />
          <ProjectPromptRecordsTab project={project} projectId={projectId} />
        </TabsContent>

        <TabsContent value="setup" className="mt-4 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <ProjectDesignTab project={project} projectId={projectId} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ProjectIdeasTab project={project} projectId={projectId} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ProjectArchitectureTab project={project} projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

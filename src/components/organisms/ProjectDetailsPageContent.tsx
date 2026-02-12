"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, FolderGit2, ListTodo, Settings, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types/project";
import { getProjectResolved } from "@/lib/api-projects";
import { ProjectHeader } from "@/components/molecules/LayoutAndNavigation/ProjectHeader";
import { ProjectGitTab } from "@/components/molecules/TabAndContentSections/ProjectGitTab";
import { ProjectDesignTab } from "@/components/molecules/TabAndContentSections/ProjectDesignTab";
import { ProjectIdeasTab } from "@/components/molecules/TabAndContentSections/ProjectIdeasTab";
import { ProjectTicketsTab } from "@/components/molecules/TabAndContentSections/ProjectTicketsTab";
import { ProjectRunTab } from "@/components/molecules/TabAndContentSections/ProjectRunTab";
import { ProjectArchitectureTab } from "@/components/molecules/TabAndContentSections/ProjectArchitectureTab";
import { ProjectTestingTab } from "@/components/molecules/TabAndContentSections/ProjectTestingTab";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getOrganismClasses } from "./organism-classes";
import { cn } from "@/lib/utils";

const c = getOrganismClasses("ProjectDetailsPageContent.tsx");

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
      <div className={c["0"]}>
        <Loader2 className={c["1"]} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={c["2"]}>
        <Alert variant="destructive">
          <AlertCircle className={c["3"]} />
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
    <ErrorBoundary fallbackTitle="Project detail error">
      <div className={c["4"]} data-testid="project-detail-page">
        <ProjectHeader project={project} projectId={projectId} />

        <Tabs defaultValue="setup" className={c["5"]} data-testid="project-detail-tabs">
          <TabsList className={c["6"]} aria-label="Project sections">
            <TabsTrigger value="setup" className={c["7"]} data-testid="tab-setup">
              <Settings className={c["8"]} />
              Stakeholder
            </TabsTrigger>
            <TabsTrigger value="todo" className={c["9"]} data-testid="tab-todo">
              <ListTodo className={c["10"]} />
              Planner
            </TabsTrigger>
            <TabsTrigger value="run" className={c["11"]} data-testid="tab-run">
              <Play className={c["12"]} />
              Worker
            </TabsTrigger>
            <TabsTrigger value="git" className={c["11"]} data-testid="tab-git">
              <FolderGit2 className={c["12"]} />
              Versioning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className={cn(c["15"], "mt-4")}>
            <Card>
              <CardContent className={c["16"]}>
                <ProjectDesignTab project={project} projectId={projectId} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className={c["17"]}>
                <ProjectIdeasTab project={project} projectId={projectId} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className={c["18"]}>
                <ProjectArchitectureTab project={project} projectId={projectId} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className={c["19"]}>
                <ProjectTestingTab project={project} projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todo" className={cn(c["14"], "mt-4")}>
            <div className="min-w-0 flex flex-col rounded-lg border border-border bg-card/50 p-4 shadow-sm">
              <ProjectTicketsTab
                project={project}
                projectId={projectId}
                fetchProject={fetchProject}
              />
            </div>
          </TabsContent>

          <TabsContent value="run" className={c["14"]}>
            <ProjectRunTab project={project} projectId={projectId} />
          </TabsContent>

          <TabsContent value="git" className={cn(c["13"], "mt-4")}>
            <ProjectGitTab project={project} projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}

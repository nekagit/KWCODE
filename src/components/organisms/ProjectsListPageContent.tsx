"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import { listProjects, deleteProject } from "@/lib/api-projects";
import { ProjectsHeader } from "@/components/molecules/ProjectsHeader/ProjectsHeader";
import { ErrorDisplay } from "@/components/molecules/ErrorDisplay/ErrorDisplay";
import { TemplateIdeaAccordion } from "@/components/molecules/TemplateIdeaAccordion/TemplateIdeaAccordion";
import { LocalProjectsCard } from "@/components/molecules/LocalProjectsCard/LocalProjectsCard";
import { NoProjectsFoundCard } from "@/components/molecules/NoProjectsFoundCard/NoProjectsFoundCard";
import { ProjectListContainer } from "@/components/molecules/ProjectListContainer";
import { ProjectLoadingState } from "@/components/molecules/ProjectLoadingState";
import { ProjectCard } from "@/components/molecules/ProjectCard";

export function ProjectsListPageContent() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [showLocalProjects, setShowLocalProjects] = useState(false);

  const refetch = useCallback(() => {
    listProjects()
      .then((data: Project[]) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await deleteProject(projectId);
      refetch();
    } catch (e: any) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const seedTemplateProject = async () => {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/data/seed-template", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      refetch();
    } catch (e: any) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listProjects()
      .then((data: Project[]) => {
        if (!cancelled) setProjects(Array.isArray(data) ? data : []);
      })
      .catch((e: any) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refetch]);

  return (
    <div className="space-y-6">
      <ProjectsHeader
        showLocalProjects={showLocalProjects}
        setShowLocalProjects={setShowLocalProjects}
        seeding={seeding}
        seedTemplateProject={seedTemplateProject}
      />

      <ErrorDisplay
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          refetch();
        }}
      />

      <TemplateIdeaAccordion setError={setError} />

      {showLocalProjects && <LocalProjectsCard />}

      {loading ? (
        <ProjectLoadingState />
      ) : projects.length === 0 ? (
        <NoProjectsFoundCard seeding={seeding} seedTemplateProject={seedTemplateProject} />
      ) : (
        <ProjectListContainer>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </ProjectListContainer>
      )}
    </div>
  );
}

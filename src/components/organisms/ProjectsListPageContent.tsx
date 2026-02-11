"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Project } from "@/types/project";
import { listProjects, deleteProject } from "@/lib/api-projects";
import { ProjectsHeader } from "@/components/molecules/LayoutAndNavigation/ProjectsHeader";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { NoProjectsFoundCard } from "@/components/molecules/CardsAndDisplay/NoProjectsFoundCard";
import { ProjectLoadingState } from "@/components/molecules/UtilitiesAndHelpers/ProjectLoadingState";
import { LocalReposSection } from "@/components/molecules/ListsAndTables/LocalReposSection";
import { ProjectListContainer } from "@/components/molecules/ListsAndTables/ProjectListContainer";

export function ProjectsListPageContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

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
        seeding={seeding}
        seedTemplateProject={seedTemplateProject}
      />

      {error && (
        <ErrorDisplay
          message={error || "An unknown error occurred."}
          onRetry={() => {
            setError(null);
            setLoading(true);
            refetch();
          }}
        />
      )}

      {/* Local repos: configured projects directory — create a project from one without typing the path */}
      <LocalReposSection />

      {/* Existing projects: simple list to open them */}
      {loading ? (
        <ProjectLoadingState />
      ) : projects.length === 0 ? (
        <NoProjectsFoundCard seeding={seeding} seedTemplateProject={seedTemplateProject} />
      ) : (
        <section className="space-y-3" data-testid="projects-list">
          <h2 className="text-lg font-semibold">Your projects</h2>
          <ProjectListContainer>
            <ul className="space-y-1 rounded-md border bg-muted/30 p-2">
              {projects.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50 group">
                  <Link href={`/projects/${project.id}`} className="flex-1 min-w-0 truncate font-medium text-primary hover:underline">
                    {project.name}
                  </Link>
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent) => handleDelete(project.id, e)}
                    className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete project"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </ProjectListContainer>
        </section>
      )}
    </div>
  );
}

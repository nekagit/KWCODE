"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/types/project";
import { invoke, isTauri } from "@/lib/tauri";
import { listProjects, deleteProject } from "@/lib/api-projects";
import { ProjectsHeader } from "@/components/molecules/LayoutAndNavigation/ProjectsHeader";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { NoProjectsFoundCard } from "@/components/molecules/CardsAndDisplay/NoProjectsFoundCard";
import { ProjectLoadingState } from "@/components/molecules/UtilitiesAndHelpers/ProjectLoadingState";
import { ProjectListContainer } from "@/components/molecules/ListsAndTables/ProjectListContainer";
import { ProjectDetailsPageContent } from "@/components/organisms/ProjectDetailsPageContent";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("ProjectsListPageContent.tsx");

export function ProjectsListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openProjectId = searchParams?.get("open") ?? null;
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
  }, []);

  const goBackToList = useCallback(() => {
    router.replace("/projects");
  }, [router]);

  if (openProjectId) {
    return (
      <div className={c["0"]}>
        <ProjectDetailsPageContent
          overrideProjectId={openProjectId}
          onBack={goBackToList}
        />
      </div>
    );
  }

  return (
    <div className={c["0"]}>
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

      {/* Existing projects: simple list to open them */}
      {loading ? (
        <ProjectLoadingState />
      ) : projects.length === 0 ? (
        <NoProjectsFoundCard seeding={seeding} seedTemplateProject={seedTemplateProject} />
      ) : (
        <section className={c["1"]} data-testid="projects-list">
          <h2 className={c["2"]}>Your projects</h2>
          <ProjectListContainer>
            <ul className={c["3"]}>
              {projects.map((project) => (
                <li key={project.id} className={c["4"]}>
                  <div
                    role="link"
                    tabIndex={0}
                    className={c["5"]}
                    onClick={() => {
                      // #region agent log
                      const logClick = () => {
                        if (isTauri) {
                          invoke("frontend_debug_log", {
                            location: "ProjectsListPageContent.tsx:onClick",
                            message: "project link click",
                            data: { projectId: project.id, hasId: !!project.id },
                          }).catch(() => {});
                        }
                        fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            location: "ProjectsListPageContent.tsx:onClick",
                            message: "project link click",
                            data: { projectId: project.id, hasId: !!project.id },
                            timestamp: Date.now(),
                            hypothesisId: "H1",
                          }),
                        }).catch(() => {});
                      };
                      logClick();
                      // #endregion
                      if (isTauri) {
                        router.push(`/projects?open=${encodeURIComponent(project.id)}`);
                      } else {
                        router.push(`/projects/${project.id}`);
                      }
                      // #region agent log
                      if (isTauri) {
                        invoke("frontend_debug_log", {
                          location: "ProjectsListPageContent.tsx:afterNav",
                          message: "navigation triggered",
                          data: { projectId: project.id, openParam: true },
                        }).catch(() => {});
                      }
                      fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          location: "ProjectsListPageContent.tsx:afterPush",
                          message: "navigation triggered",
                          data: { projectId: project.id },
                          timestamp: Date.now(),
                          hypothesisId: "H2",
                        }),
                      }).catch(() => {});
                      // #endregion
                    }}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (isTauri) {
                          router.push(`/projects?open=${encodeURIComponent(project.id)}`);
                        } else {
                          router.push(`/projects/${project.id}`);
                        }
                      }
                    }}
                  >
                    {project.name}
                  </div>
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent) => handleDelete(project.id, e)}
                    className={c["6"]}
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

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/types/project";
import { invoke, isTauri } from "@/lib/tauri";
import { listProjects, deleteProject } from "@/lib/api-projects";
import {
  copyProjectsListAsJsonToClipboard,
  downloadProjectsListAsJson,
} from "@/lib/download-projects-list-json";
import {
  downloadProjectsListAsCsv,
  copyProjectsListAsCsvToClipboard,
} from "@/lib/download-projects-list-csv";
import { toast } from "sonner";
import { Copy, Download, FileJson, Search, X, RotateCcw } from "lucide-react";
import { getRecentProjectIds } from "@/lib/recent-projects";
import {
  getProjectsListViewPreference,
  setProjectsListViewPreference,
  type ProjectsListSortOrder,
} from "@/lib/projects-list-view-preference";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProjectsHeader } from "@/components/molecules/LayoutAndNavigation/ProjectsHeader";
import { DiscoverFoldersDialog } from "@/components/molecules/FormsAndDialogs/DiscoverFoldersDialog";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { NoProjectsFoundCard } from "@/components/molecules/CardsAndDisplay/NoProjectsFoundCard";
import { ProjectLoadingState } from "@/components/molecules/UtilitiesAndHelpers/ProjectLoadingState";
import { ProjectCard } from "@/components/molecules/CardsAndDisplay/ProjectCard";
import { ProjectDetailsPageContent } from "@/components/organisms/ProjectDetailsPageContent";
import { getOrganismClasses } from "./organism-classes";
import { useProjectsFocusFilterShortcut } from "@/lib/projects-focus-filter-shortcut";

const c = getOrganismClasses("ProjectsListPageContent.tsx");

export function ProjectsListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openProjectId = searchParams?.get("open") ?? null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return getProjectsListViewPreference().filterQuery;
  });
  const [sortOrder, setSortOrder] = useState<ProjectsListSortOrder>(() => {
    if (typeof window === "undefined") return "asc";
    return getProjectsListViewPreference().sortOrder;
  });
  const filterInputRef = useRef<HTMLInputElement>(null);
  useProjectsFocusFilterShortcut(filterInputRef);
  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Persist sort when user changes it
  useEffect(() => {
    setProjectsListViewPreference({ sortOrder });
  }, [sortOrder]);

  // Persist filter query with debounce when user types
  useEffect(() => {
    const t = setTimeout(
      () => setProjectsListViewPreference({ filterQuery: searchQuery }),
      300
    );
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Open Discover dialog when navigating from Dashboard empty state (?discover=1)
  useEffect(() => {
    if (searchParams?.get("discover") === "1") {
      setDiscoverOpen(true);
      router.replace("/projects", { scroll: false });
    }
  }, [searchParams, router]);

  const filteredProjects = useMemo(
    () =>
      !trimmedQuery
        ? projects
        : projects.filter((p) => p.name.toLowerCase().includes(trimmedQuery)),
    [projects, trimmedQuery]
  );
  const displayList = useMemo(() => {
    const list = [...filteredProjects];
    if (sortOrder === "recent") {
      const recentIds = getRecentProjectIds();
      list.sort((a, b) => {
        const ai = recentIds.indexOf(a.id);
        const bi = recentIds.indexOf(b.id);
        if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    } else {
      list.sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    }
    return list;
  }, [filteredProjects, sortOrder]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    listProjects()
      .then((data: Project[]) => setProjects(Array.isArray(data) ? data : []))
      .then(() => toast.success("Projects refreshed"))
      .catch(() => toast.error("Refresh failed"))
      .finally(() => setRefreshing(false));
  }, []);

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

  const handleOpenProject = useCallback(
    (project: Project) => {
      if (isTauri) {
        invoke("frontend_debug_log", {
          location: "ProjectsListPageContent.tsx:onClick",
          message: "project link click",
          data: { projectId: project.id, hasId: !!project.id },
        }).catch(() => {});
        router.push(`/projects?open=${encodeURIComponent(project.id)}`);
      } else {
        router.push(`/projects/${project.id}`);
      }
    },
    [router]
  );

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
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Projects" },
        ]}
        className="mb-3"
      />
      <ProjectsHeader
        seeding={seeding}
        seedTemplateProject={seedTemplateProject}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onDiscoverFolders={() => setDiscoverOpen(true)}
      />
      <DiscoverFoldersDialog
        isOpen={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        onAdded={refetch}
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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
                aria-hidden
              />
              <Input
                ref={filterInputRef}
                type="text"
                placeholder="Filter by name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
                aria-label="Filter projects by name"
              />
            </div>
            {trimmedQuery && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-8 gap-1.5"
                aria-label="Clear filter"
              >
                <X className="size-3.5" aria-hidden />
                Clear
              </Button>
            )}
            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as ProjectsListSortOrder)}
            >
              <SelectTrigger className="w-[10rem] h-8 text-xs" aria-label="Sort order">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc" className="text-xs">A–Z</SelectItem>
                <SelectItem value="desc" className="text-xs">Z–A</SelectItem>
                <SelectItem value="recent" className="text-xs">Recently opened</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Export:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadProjectsListAsJson(displayList)}
              className="h-8 gap-1.5 text-xs"
              aria-label="Download projects list as JSON"
              title="Download current list as JSON"
            >
              <FileJson className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">JSON</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyProjectsListAsJsonToClipboard(displayList)}
              className="h-8 gap-1.5 text-xs"
              aria-label="Copy projects list as JSON to clipboard"
              title="Copy current list as JSON (same data as Download JSON)"
            >
              <Copy className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Copy JSON</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadProjectsListAsCsv(displayList)}
              className="h-8 gap-1.5 text-xs"
              aria-label="Download projects list as CSV"
              title="Download current list as CSV"
            >
              <Download className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copyProjectsListAsCsvToClipboard(displayList)}
              className="h-8 gap-1.5 text-xs"
              aria-label="Copy projects list as CSV to clipboard"
              title="Copy current list as CSV (same data as Download CSV)"
            >
              <Copy className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Copy CSV</span>
            </Button>
            {(trimmedQuery || sortOrder !== "asc") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSortOrder("asc");
                }}
                className="h-8 gap-1.5 text-xs"
                aria-label="Reset filters"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reset filters
              </Button>
            )}
            {trimmedQuery && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
            )}
          </div>
          {displayList.length > 0 ? (
            <ul
              className={c["grid"]}
              role="list"
              aria-label="Project cards"
            >
              {displayList.map((project) => (
                <li key={project.id}>
                  <ProjectCard
                    project={project}
                    onOpen={() => handleOpenProject(project)}
                    onDelete={(e) => handleDelete(project.id, e)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              No projects match &quot;{searchQuery.trim()}&quot;.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

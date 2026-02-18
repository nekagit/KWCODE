"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { invoke, isTauri } from "@/lib/tauri";
import { listProjects } from "@/lib/api-projects";
import { getRecentProjectIds } from "@/lib/recent-projects";
import { useDashboardFocusFilterShortcut } from "@/lib/dashboard-focus-filter-shortcut";
import type { Project } from "@/types/project";
import type { DashboardMetrics } from "@/types/dashboard";
import {
  FolderOpen,
  FolderPlus,
  Ticket,
  MessageSquare,
  Palette,
  Lightbulb,
  Cpu,
  ArrowRight,
  LayoutGrid,
  Folders,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

async function fetchMetrics(): Promise<DashboardMetrics> {
  if (isTauri) return invoke<DashboardMetrics>("get_dashboard_metrics");
  const res = await fetch("/api/data/dashboard-metrics");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const entityLinks = [
  { href: "/projects", label: "Projects", icon: Folders, color: "text-blue-600 dark:text-blue-400" },
  { href: "/ideas", label: "Ideas", icon: Lightbulb, color: "text-amber-600 dark:text-amber-400" },
  { href: "/technologies", label: "Technologies", icon: Cpu, color: "text-emerald-600 dark:text-emerald-400" },
  { href: "/prompts", label: "Prompts", icon: MessageSquare, color: "text-violet-600 dark:text-violet-400" },
];

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const tickets = project.ticketIds?.length ?? 0;
  const prompts = project.promptIds?.length ?? 0;
  const ideas = (project.ideaIds?.length ?? 0) + (project.designIds?.length ?? 0);
  const total = tickets + prompts + ideas;
  const goToProject = () => {
    // #region agent log
    if (isTauri) {
      invoke("frontend_debug_log", {
        location: "DashboardOverview.tsx:ProjectCard:onClick",
        message: "dashboard project card click",
        data: { projectId: project.id, hasId: !!project.id },
      }).catch(() => {});
    }
    fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "DashboardOverview.tsx:ProjectCard:onClick",
        message: "dashboard project card click",
        data: { projectId: project.id, hasId: !!project.id },
        timestamp: Date.now(),
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion
    if (isTauri) {
      router.push(`/projects?open=${encodeURIComponent(project.id)}`);
    } else {
      router.push(`/projects/${project.id}`);
    }
    // #region agent log
    if (isTauri) {
      invoke("frontend_debug_log", {
        location: "DashboardOverview.tsx:afterNav",
        message: "navigation triggered",
        data: { projectId: project.id, openParam: true },
      }).catch(() => {});
    }
    fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "DashboardOverview.tsx:afterPush",
        message: "navigation triggered",
        data: { projectId: project.id },
        timestamp: Date.now(),
        hypothesisId: "H2",
      }),
    }).catch(() => {});
    // #endregion
  };
  return (
    <div
      role="link"
      tabIndex={0}
      className="block group cursor-pointer"
      onClick={goToProject}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToProject();
        }
      }}
    >
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:bg-muted/20">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate text-foreground group-hover:text-primary">
                {project.name}
              </p>
              {project.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {project.description}
                </p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {tickets > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Ticket className="h-3 w-3" /> {tickets}
              </span>
            )}
            {prompts > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                <MessageSquare className="h-3 w-3" /> {prompts}
              </span>
            )}
            {ideas > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Lightbulb className="h-3 w-3" /> {ideas}
              </span>
            )}
            {total === 0 && (
              <span className="text-xs text-muted-foreground">No entities yet</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export interface DashboardOverviewProps {
  /** When provided, "Select all" and "Deselect all" are shown in the Projects section (ADR 0189). */
  setActiveProjects?: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function DashboardOverview({ setActiveProjects }: DashboardOverviewProps = {}) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const filterInputRef = useRef<HTMLInputElement>(null);
  useDashboardFocusFilterShortcut(filterInputRef);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchMetrics(), listProjects()])
      .then(([m, p]) => {
        if (!cancelled) {
          setMetrics(m);
          setProjects(Array.isArray(p) ? p : []);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // All hooks must run unconditionally (before any early return) to satisfy Rules of Hooks.
  const projectsForDisplay = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    let list = projects;
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    const recentIds = getRecentProjectIds();
    list = [...list];
    list.sort((a, b) => {
      const ai = recentIds.indexOf(a.id);
      const bi = recentIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return list.slice(0, 6);
  }, [projects, filterQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-2xl bg-muted/50 animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4 text-sm text-destructive">
          Failed to load dashboard: {error}
        </CardContent>
      </Card>
    );
  }

  const m = metrics!;

  const statItems = [
    { value: m.all_projects_count, label: "Projects", icon: FolderOpen },
    { value: m.tickets_count, label: "Tickets", icon: Ticket },
    { value: m.prompts_count, label: "Prompts", icon: MessageSquare },
    { value: m.designs_count, label: "Designs", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/80",
          "bg-gradient-to-br from-primary/8 via-background to-violet-500/5",
          "dark:from-primary/15 dark:via-background dark:to-violet-500/10",
          "shadow-sm"
        )}
      >
        <div className="relative p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Overview
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Projects and entities at a glance
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              {statItems.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 border border-border/60 shadow-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Entity quick links */}
      <div className="flex flex-wrap gap-2">
        {entityLinks.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium",
              "transition-colors hover:bg-muted/50 hover:border-primary/20",
              color
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <Link
          href="/?tab=all"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:border-primary/20"
        >
          <LayoutGrid className="h-4 w-4" />
          Database
        </Link>
      </div>

      {/* Projects */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-foreground">Projects</h3>
          <div className="flex flex-wrap items-center gap-2">
            {projects.length > 0 && setActiveProjects && projectsForDisplay.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const paths = projectsForDisplay.map((p) => p.repoPath ?? p.id);
                    setActiveProjects(paths);
                    toast.success(
                      `${paths.length} project${paths.length === 1 ? "" : "s"} selected for run. Save on the Projects tab to persist.`
                    );
                  }}
                  aria-label="Select all displayed projects for run"
                >
                  <CheckSquare className="h-4 w-4 mr-1.5" aria-hidden />
                  Select all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveProjects([]);
                    toast.success("No projects selected for run.");
                  }}
                  aria-label="Deselect all projects for run"
                >
                  <Square className="h-4 w-4 mr-1.5" aria-hidden />
                  Deselect all
                </Button>
              </>
            )}
            {projects.length > 0 && (
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
                  aria-hidden
                />
                <Input
                  ref={filterInputRef}
                  type="text"
                  placeholder="Filter by name…"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 h-9"
                  aria-label="Filter projects by name"
                />
              </div>
            )}
            <Link
              href="/projects"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Folders className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No projects yet</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 hover:border-primary/20"
                >
                  <FolderOpen className="h-4 w-4" />
                  Create a project
                </Link>
                <Link
                  href="/projects?discover=1"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 hover:border-primary/50"
                >
                  <FolderPlus className="h-4 w-4" />
                  Discover folders
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : projectsForDisplay.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No projects match &quot;{filterQuery.trim()}&quot;
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projectsForDisplay.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isTauri } from "@/lib/tauri";
import { listProjects } from "@/lib/api-projects";
import { getDashboardMetrics } from "@/lib/api-dashboard-metrics";
import { getRecentProjectIds } from "@/lib/recent-projects";
import { useDashboardFocusFilterShortcut } from "@/lib/dashboard-focus-filter-shortcut";
import { useQuickActions } from "@/context/quick-actions-context";
import { useRunStore } from "@/store/run-store";
import type { Project } from "@/types/project";
import type { DashboardMetrics } from "@/types/dashboard";
import {
  FolderOpen,
  Ticket,
  MessageSquare,
  Palette,
  Lightbulb,
  Cpu,
  Terminal,
  ArrowRight,
  Folders,
  Search,
  CheckSquare,
  Square,
  BookOpen,
  Settings,
  Moon,
  TestTube2,
  ListTodo,
  Keyboard,
  Building2,
  FolderGit2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const quickActionLinks = [
  { href: "/projects", label: "Projects", icon: Folders, color: "text-blue-600 dark:text-blue-400" },
  { href: "/run", label: "Run", icon: Terminal, color: "text-orange-600 dark:text-orange-400" },
  { href: "/prompts", label: "Prompts", icon: MessageSquare, color: "text-violet-600 dark:text-violet-400" },
  { href: "/ideas", label: "Ideas", icon: Lightbulb, color: "text-amber-600 dark:text-amber-400" },
  { href: "/design", label: "Design", icon: Palette, color: "text-pink-600 dark:text-pink-400" },
  { href: "/architecture", label: "Architecture", icon: Building2, color: "text-teal-600 dark:text-teal-400" },
  { href: "/testing", label: "Testing", icon: TestTube2, color: "text-rose-600 dark:text-rose-400" },
  { href: "/planner", label: "Planner", icon: ListTodo, color: "text-blue-600 dark:text-blue-400" },
  { href: "/versioning", label: "Versioning", icon: FolderGit2, color: "text-amber-600 dark:text-amber-400" },
  { href: "/technologies", label: "Technologies", icon: Cpu, color: "text-emerald-600 dark:text-emerald-400" },
  { href: "/documentation", label: "Documentation", icon: BookOpen, color: "text-sky-600 dark:text-sky-400" },
  { href: "/configuration", label: "Configuration", icon: Settings, color: "text-green-600 dark:text-green-400" },
  { href: "/loading-screen", label: "Loading", icon: Moon, color: "text-indigo-600 dark:text-indigo-400" },
];

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const tickets = project.ticketIds?.length ?? 0;
  const prompts = project.promptIds?.length ?? 0;
  const ideas = (project.ideaIds?.length ?? 0) + (project.designIds?.length ?? 0);
  const total = tickets + prompts + ideas;

  const goToProject = () => {
    if (isTauri) {
      router.push(`/projects?open=${encodeURIComponent(project.id)}`);
    } else {
      router.push(`/projects/${project.id}`);
    }
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

export interface SimpleDashboardProps {
  setActiveProjects?: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function SimpleDashboard({ setActiveProjects }: SimpleDashboardProps = {}) {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const filterInputRef = useRef<HTMLInputElement>(null);
  const activeProjects = useRunStore((s) => s.activeProjects);
  const { openShortcutsModal } = useQuickActions();
  useDashboardFocusFilterShortcut(filterInputRef);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getDashboardMetrics(), listProjects()])
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
    return () => {
      cancelled = true;
    };
  }, []);

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
    return list.slice(0, 12);
  }, [projects, filterQuery]);

  const goToTesting = () => {
    const active = activeProjects ?? [];
    if (!active.length) {
      toast.info("Select a project first");
      router.push("/projects");
      return;
    }
    const proj = projects.find((p) => p.repoPath === active[0]);
    if (!proj) {
      toast.info("Open a project first");
      router.push("/projects");
      return;
    }
    router.push(`/projects/${proj.id}?tab=testing`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
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
  const kpiItems = [
    { value: m.all_projects_count, label: "Projects", icon: FolderOpen },
    { value: m.tickets_count, label: "Tickets", icon: Ticket },
    { value: m.prompts_count, label: "Prompts", icon: MessageSquare },
    { value: m.designs_count, label: "Designs", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <section>
        <h2 className="sr-only">Key metrics</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpiItems.map(({ value, label, icon: Icon }) => (
            <Card key={label} className="border-border/80 bg-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted border border-border/60">
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick actions</h3>
        <div className="flex flex-wrap gap-2">
          {quickActionLinks.map(({ href, label, icon: Icon, color }) => (
            <React.Fragment key={href}>
              <Link
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
              {href === "/run" && (
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium",
                    "transition-colors hover:bg-muted/50 hover:border-primary/20",
                    "text-rose-600 dark:text-rose-400"
                  )}
                  onClick={goToTesting}
                >
                  <TestTube2 className="h-4 w-4" />
                  Testing
                </Button>
              )}
              {href === "/run" && (
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium",
                    "transition-colors hover:bg-muted/50 hover:border-primary/20",
                    "text-slate-600 dark:text-slate-400"
                  )}
                  onClick={openShortcutsModal}
                  aria-label="Open keyboard shortcuts help"
                  title="Keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                  Shortcuts
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Project list */}
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
            <Link href="/projects" className="text-xs font-medium text-primary hover:underline">
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

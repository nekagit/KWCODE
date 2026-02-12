"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  FolderGit2,
  ListTodo,
  Settings,
  Play,
  Trash2,
  FolderOpen,
  Calendar,
  ArrowLeft,
  Hash,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/types/project";
import { getProjectResolved, deleteProject } from "@/lib/api-projects";
import { ProjectDesignTab } from "@/components/molecules/TabAndContentSections/ProjectDesignTab";
import { ProjectIdeasTab } from "@/components/molecules/TabAndContentSections/ProjectIdeasTab";
import { ProjectTicketsTab } from "@/components/molecules/TabAndContentSections/ProjectTicketsTab";
import { ProjectGitTab } from "@/components/molecules/TabAndContentSections/ProjectGitTab";
import { ProjectRunTab } from "@/components/molecules/TabAndContentSections/ProjectRunTab";
import { ProjectArchitectureTab } from "@/components/molecules/TabAndContentSections/ProjectArchitectureTab";
import { ProjectTestingTab } from "@/components/molecules/TabAndContentSections/ProjectTestingTab";
import { ProjectFilesTab } from "@/components/molecules/TabAndContentSections/ProjectFilesTab";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";
import { SectionCard, MetadataBadge, CountBadge } from "@/components/shared/DisplayPrimitives";

const TAB_CONFIG = [
  { value: "setup", label: "Stakeholder", icon: Settings, color: "text-violet-400", activeGlow: "shadow-violet-500/10" },
  { value: "todo", label: "Planner", icon: ListTodo, color: "text-blue-400", activeGlow: "shadow-blue-500/10" },
  { value: "run", label: "Worker", icon: Play, color: "text-emerald-400", activeGlow: "shadow-emerald-500/10" },
  { value: "git", label: "Versioning", icon: FolderGit2, color: "text-amber-400", activeGlow: "shadow-amber-500/10" },
] as const;

export function ProjectDetailsPageContent() {
  const params = useParams();
  const projectId = (params?.id as string) ?? "";
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("setup");

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
      if (mountedRef.current)
        setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Loader2 className="relative size-10 animate-spin text-primary" />
          </div>
          <p className="text-xs text-muted-foreground animate-pulse tracking-wider">
            Loading project…
          </p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-8 max-w-md w-full text-center space-y-4">
          <div className="mx-auto size-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-sm text-destructive/90 normal-case">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              fetchProject();
            }}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Not Found ─── */
  if (!project) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const ticketCount = project.ticketIds?.length ?? 0;
  const featureCount = project.featureIds?.length ?? 0;
  const designCount = project.designIds?.length ?? 0;
  const ideaCount = project.ideaIds?.length ?? 0;
  const architectureCount = project.architectureIds?.length ?? 0;

  return (
    <ErrorBoundary fallbackTitle="Project detail error">
      <div
        className="flex flex-col gap-0 w-full"
        data-testid="project-detail-page"
      >
        {/* ═══════════════ HERO HEADER ═══════════════ */}
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/[0.04] p-6 md:p-8 mb-8">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-36 rounded-full bg-info/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 size-24 rounded-full bg-violet-500/[0.04] blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5">
            {/* Top bar: back + delete */}
            <div className="flex items-center justify-between">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="tracking-wide">All projects</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 gap-1.5"
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to delete this project?"
                    )
                  ) {
                    await deleteProject(projectId);
                    window.location.href = "/projects";
                  }
                }}
              >
                <Trash2 className="size-3.5" />
                <span className="text-xs">Delete</span>
              </Button>
            </div>

            {/* Project Title & Description */}
            <div className="space-y-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed normal-case">
                  {project.description}
                </p>
              )}
            </div>

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {project.repoPath && (
                <MetadataBadge
                  icon={<FolderOpen className="size-3" />}
                  color="bg-primary/10 border-primary/20 text-primary"
                >
                  <span className="truncate max-w-[220px] normal-case">
                    {project.repoPath}
                  </span>
                </MetadataBadge>
              )}
              {project.created_at && (
                <MetadataBadge
                  icon={<Calendar className="size-3" />}
                  color="bg-muted/50 border-border/50 text-muted-foreground"
                >
                  <span className="normal-case">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </MetadataBadge>
              )}
              {ticketCount > 0 && (
                <CountBadge
                  icon={<Hash className="size-2.5" />}
                  count={ticketCount}
                  label="tickets"
                  color="bg-blue-500/10 border-blue-500/20 text-blue-400"
                />
              )}
              {featureCount > 0 && (
                <CountBadge
                  icon={<Hash className="size-2.5" />}
                  count={featureCount}
                  label="features"
                  color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                />
              )}
              {designCount > 0 && (
                <CountBadge
                  icon={<Hash className="size-2.5" />}
                  count={designCount}
                  label="designs"
                  color="bg-violet-500/10 border-violet-500/20 text-violet-400"
                />
              )}
              {ideaCount > 0 && (
                <CountBadge
                  icon={<Hash className="size-2.5" />}
                  count={ideaCount}
                  label="ideas"
                  color="bg-amber-500/10 border-amber-500/20 text-amber-400"
                />
              )}
              {architectureCount > 0 && (
                <CountBadge
                  icon={<Hash className="size-2.5" />}
                  count={architectureCount}
                  label="architectures"
                  color="bg-teal-500/10 border-teal-500/20 text-teal-400"
                />
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════ TABS ═══════════════ */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          data-testid="project-detail-tabs"
        >
          {/* Tab Navigation */}
          <div className="mb-6">
            <TabsList
              className="inline-flex h-auto gap-1 rounded-xl bg-muted/20 border border-border/40 p-1.5 backdrop-blur-sm"
              aria-label="Project sections"
            >
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  data-testid={`tab-${tab.value}`}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-200",
                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/40",
                    "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50",
                    activeTab === tab.value && tab.activeGlow
                  )}
                >
                  <tab.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors duration-200",
                      activeTab === tab.value ? tab.color : ""
                    )}
                  />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Stakeholder Tab ── */}
          <TabsContent
            value="setup"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard accentColor="violet">
                <ProjectDesignTab project={project} projectId={projectId} />
              </SectionCard>
              <SectionCard accentColor="amber">
                <ProjectIdeasTab project={project} projectId={projectId} />
              </SectionCard>
              <SectionCard accentColor="blue">
                <ProjectArchitectureTab
                  project={project}
                  projectId={projectId}
                />
              </SectionCard>
              <SectionCard accentColor="emerald">
                <ProjectTestingTab
                  project={project}
                  projectId={projectId}
                />
              </SectionCard>
              <SectionCard accentColor="rose" className="lg:col-span-2">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Project Files</h3>
                      <p className="text-xs text-muted-foreground">Files in .cursor directory</p>
                    </div>
                  </div>
                  <ProjectFilesTab project={project} projectId={projectId} />
                </div>
              </SectionCard>
            </div>

          </TabsContent>

          {/* ── Planner Tab ── */}
          <TabsContent
            value="todo"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 md:p-6">
              <ProjectTicketsTab
                project={project}
                projectId={projectId}
                fetchProject={fetchProject}
              />
            </div>
          </TabsContent>

          {/* ── Worker Tab ── */}
          <TabsContent
            value="run"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <ProjectRunTab project={project} projectId={projectId} />
          </TabsContent>

          {/* ── Versioning Tab ── */}
          <TabsContent
            value="git"
            className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <ProjectGitTab project={project} projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}

/* SectionCard, MetadataBadge, CountBadge are now imported from @/components/shared/DisplayPrimitives */

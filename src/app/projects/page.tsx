"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folders, Plus, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Loader2, ArrowRight, Sparkles, Wand2, Trash2, FolderOpen } from "lucide-react";
import type { Project } from "@/types/project";
import { TEMPLATE_IDEAS } from "@/data/template-ideas";
import { listProjects, deleteProject } from "@/lib/api-projects";
import { invoke, isTauri } from "@/lib/tauri";

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [localPaths, setLocalPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [generatingIdeaId, setGeneratingIdeaId] = useState<string | null>(null);
  const [showLocalProjects, setShowLocalProjects] = useState(false);

  const refetch = () => {
    listProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await deleteProject(projectId);
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listProjects()
      .then((data) => {
        if (!cancelled) setProjects(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const loadLocalPaths = () => {
      if (isTauri()) {
        invoke<string[]>("list_february_folders")
          .then((paths) => setLocalPaths(Array.isArray(paths) ? paths : []))
          .catch(() => setLocalPaths([]));
      } else {
        fetch("/api/data/february-folders")
          .then((r) => (r.ok ? r.json() : { folders: [] }))
          .then((data) => setLocalPaths(Array.isArray(data.folders) ? data.folders : []))
          .catch(() => setLocalPaths([]));
      }
    };
    loadLocalPaths();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Each project is a page that aggregates design, ideas, features, tickets, and prompts. Open a project to see all its data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowLocalProjects((v) => !v)}
            className={showLocalProjects ? "bg-accent" : ""}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Local projects
          </Button>
          <Button
            variant="outline"
            disabled={seeding}
            onClick={async () => {
              setSeeding(true);
              setError(null);
              try {
                const res = await fetch("/api/data/seed-template", { method: "POST" });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  throw new Error(err.error || res.statusText);
                }
                refetch();
              } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
              } finally {
                setSeeding(false);
              }
            }}
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Seed template project
          </Button>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New project
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-destructive flex-1 min-w-0">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              setLoading(true);
              listProjects()
                .then((data) => setProjects(Array.isArray(data) ? data : []))
                .catch((e) => setError(e instanceof Error ? e.message : String(e)))
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </Button>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="template-ideas">
          <AccordionTrigger className="text-base">
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Start from a template idea (AI generates full project)
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground text-sm mb-4">
              Pick one of 10 template ideas. AI will create a project with prompts, tickets, features, one design, and one architecture linked to it.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_IDEAS.map((template) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between gap-2">
                      <span className="truncate">{template.title}</span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {template.category}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full"
                      disabled={generatingIdeaId !== null}
                      onClick={async () => {
                        setGeneratingIdeaId(template.id);
                        setError(null);
                        try {
                          const res = await fetch("/api/generate-project-from-idea", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              idea: {
                                title: template.title,
                                description: template.description,
                                category: template.category,
                              },
                            }),
                          });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || err.detail || res.statusText);
                          }
                          const data = await res.json();
                          refetch();
                          if (data.project?.id) {
                            router.push(`/projects/${data.project.id}`);
                          }
                        } catch (e) {
                          setError(e instanceof Error ? e.message : String(e));
                        } finally {
                          setGeneratingIdeaId(null);
                        }
                      }}
                    >
                      {generatingIdeaId === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Generate with AI
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {showLocalProjects && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Local projects
          </CardTitle>
          <CardDescription>
            All folders in your <code className="text-xs bg-muted px-1 rounded">Documents/February</code> folder. Use a path to create a first-class project above or for runs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {localPaths.length === 0 ? (
            <Empty
              icon={<FolderOpen className="h-6 w-6" />}
              title="No February folders"
              description="No subfolders found in your Documents/February folder, or the app is not running from a project inside it."
            />
          ) : (
            <ScrollArea className="h-[240px] rounded-md border p-3">
              <ul className="space-y-2 text-sm">
                {localPaths.map((path, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-md py-1.5 px-2 hover:bg-muted/50 group"
                  >
                    <span className="flex-1 min-w-0 truncate font-mono text-muted-foreground" title={path}>
                      {path}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      asChild
                    >
                      <Link href={`/projects/new?repoPath=${encodeURIComponent(path)}`}>
                        <Plus className="h-3.5 w-3 mr-1" />
                        Create project
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <Empty
              icon={<Folders className="h-6 w-6" />}
              title="No projects yet"
              description="Create a project to group design, ideas, features, tickets, and prompts in one place."
            />
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                disabled={seeding}
                onClick={async () => {
                  setSeeding(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/data/seed-template", { method: "POST" });
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      throw new Error(err.error || res.statusText);
                    }
                    refetch();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : String(e));
                  } finally {
                    setSeeding(false);
                  }
                }}
              >
                {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Seed template project
              </Button>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New project
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="h-full transition-colors hover:bg-muted/50 relative group">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive z-10"
                title="Delete project"
                onClick={(e) => handleDelete(project.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Link href={`/projects/${project.id}`} className="block">
                <CardHeader className="pb-2 pr-10">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Folders className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <Badge variant="secondary" className="gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {project.promptIds.length}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <TicketIcon className="h-3 w-3" />
                      {project.ticketIds.length}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Layers className="h-3 w-3" />
                      {project.featureIds.length}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {project.ideaIds.length}
                    </Badge>
                  </div>
                  {project.repoPath && (
                    <p className="text-xs text-muted-foreground truncate font-mono" title={project.repoPath}>
                      {project.repoPath.split("/").pop() ?? project.repoPath}
                    </p>
                  )}
                  <span className="inline-flex items-center text-xs text-primary mt-2">
                    Open <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

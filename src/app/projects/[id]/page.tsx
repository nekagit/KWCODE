"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Ticket as TicketIcon,
  Layers,
  Lightbulb,
  Palette,
  Building2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Link2,
  Download,
  Tags,
} from "lucide-react";
import type { Project, EntityCategory, ProjectEntityCategories } from "@/types/project";
import { getProject, updateProject, getProjectExport } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";

type WithCategory<T> = T & EntityCategory;

type ResolvedProject = Project & {
  prompts: WithCategory<{ id: number; title: string; content?: string }>[];
  tickets: WithCategory<{ id: string; title: string; status: string; description?: string }>[];
  features: WithCategory<{ id: string; title: string; prompt_ids: number[]; project_paths: string[] }>[];
  ideas: WithCategory<{ id: number; title: string; description: string; category: string }>[];
  designs?: WithCategory<{ id: string; name: string }>[];
  architectures?: WithCategory<{ id: string; name: string }>[];
};

const CATEGORY_FIELDS = ["phase", "step", "organization", "categorizer", "other"] as const;
type GroupByOption = (typeof CATEGORY_FIELDS)[number] | "none";

type PromptItem = { id: number; title: string };
type TicketItem = { id: string; title: string };
type FeatureItem = { id: string; title: string };
type IdeaItem = { id: number; title: string };
type DesignItem = { id: string; name: string };
type ArchitectureItem = { id: string; name: string };

type DetailModalItem =
  | { kind: "prompt"; data: ResolvedProject["prompts"][number] }
  | { kind: "ticket"; data: ResolvedProject["tickets"][number] }
  | { kind: "feature"; data: ResolvedProject["features"][number] }
  | { kind: "idea"; data: ResolvedProject["ideas"][number] }
  | { kind: "design"; data: NonNullable<ResolvedProject["designs"]>[number] }
  | { kind: "architecture"; data: NonNullable<ResolvedProject["architectures"]>[number] };

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [promptIds, setPromptIds] = useState<number[]>([]);
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [ideaIds, setIdeaIds] = useState<number[]>([]);
  const [designIds, setDesignIds] = useState<string[]>([]);
  const [architectureIds, setArchitectureIds] = useState<string[]>([]);
  const [promptsList, setPromptsList] = useState<PromptItem[]>([]);
  const [ticketsList, setTicketsList] = useState<TicketItem[]>([]);
  const [featuresList, setFeaturesList] = useState<FeatureItem[]>([]);
  const [ideasList, setIdeasList] = useState<IdeaItem[]>([]);
  const [designsList, setDesignsList] = useState<DesignItem[]>([]);
  const [architecturesList, setArchitecturesList] = useState<ArchitectureItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksSaving, setLinksSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [entityCategories, setEntityCategories] = useState<ProjectEntityCategories>({});
  const [groupBy, setGroupBy] = useState<GroupByOption>("none");
  const [detailModalItem, setDetailModalItem] = useState<DetailModalItem | null>(null);

  const setProjectFromData = useCallback((data: Project | ResolvedProject) => {
    const r = data as ResolvedProject;
    setProject(r);
    setPromptIds(Array.isArray(r.promptIds) ? r.promptIds : []);
    setTicketIds(Array.isArray(r.ticketIds) ? r.ticketIds : []);
    setFeatureIds(Array.isArray(r.featureIds) ? r.featureIds : []);
    setIdeaIds(Array.isArray(r.ideaIds) ? r.ideaIds : []);
    setDesignIds(Array.isArray((r as ResolvedProject).designIds) ? ((r as ResolvedProject).designIds ?? []) : []);
    setArchitectureIds(Array.isArray((r as ResolvedProject).architectureIds) ? ((r as ResolvedProject).architectureIds ?? []) : []);
    setEntityCategories(r.entityCategories ?? {});
  }, []);

  const refetchProject = useCallback(() => {
    if (!id) return;
    if (isTauri()) {
      getProject(id)
        .then((raw) => {
          const resolved: ResolvedProject = {
            ...raw,
            prompts: [],
            tickets: [],
            features: [],
            ideas: [],
            designs: [],
            architectures: [],
          };
          setProjectFromData(resolved);
        })
        .catch(() => {});
      return;
    }
    fetch(`/api/data/projects/${id}`)
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || res.statusText)));
        return res.json();
      })
      .then((data: ResolvedProject) => setProjectFromData(data));
  }, [id, setProjectFromData]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (isTauri()) {
      getProject(id)
        .then((raw) => {
          const resolved: ResolvedProject = {
            ...raw,
            prompts: [],
            tickets: [],
            features: [],
            ideas: [],
            designs: [],
            architectures: [],
          };
          if (!cancelled) setProjectFromData(resolved);
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
    }
    fetch(`/api/data/projects/${id}`)
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || res.statusText)));
        return res.json();
      })
      .then((data: ResolvedProject) => {
        if (!cancelled) setProjectFromData(data);
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
  }, [id, setProjectFromData]);

  useEffect(() => {
    if (!id || !project) return;
    let cancelled = false;
    setLinksLoading(true);
    Promise.all([
      fetch("/api/data/prompts").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/data").then((r) => (r.ok ? r.json() : { tickets: [], features: [] })),
      fetch("/api/data/ideas").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/data/designs").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/data/architectures").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([pList, data, iList, dList, aList]) => {
        if (cancelled) return;
        setPromptsList(Array.isArray(pList) ? pList.map((x: { id: number; title: string }) => ({ id: Number(x.id), title: x.title ?? "" })) : []);
        setTicketsList(Array.isArray(data.tickets) ? data.tickets : []);
        setFeaturesList(Array.isArray(data.features) ? data.features : []);
        setIdeasList(Array.isArray(iList) ? iList : []);
        setDesignsList(Array.isArray(dList) ? dList.map((x: { id: string; name: string }) => ({ id: x.id, name: x.name ?? "" })) : []);
        setArchitecturesList(Array.isArray(aList) ? aList.map((x: { id: string; name: string }) => ({ id: x.id, name: x.name ?? "" })) : []);
      })
      .finally(() => {
        if (!cancelled) setLinksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, project]);

  const togglePrompt = useCallback((pid: number) => {
    setPromptIds((prev) => (prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]));
  }, []);
  const toggleTicket = useCallback((tid: string) => {
    setTicketIds((prev) => (prev.includes(tid) ? prev.filter((id) => id !== tid) : [...prev, tid]));
  }, []);
  const toggleFeature = useCallback((fid: string) => {
    setFeatureIds((prev) => (prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid]));
  }, []);
  const toggleIdea = useCallback((iid: number) => {
    setIdeaIds((prev) => (prev.includes(iid) ? prev.filter((id) => id !== iid) : [...prev, iid]));
  }, []);
  const toggleDesign = useCallback((did: string) => {
    setDesignIds((prev) => (prev.includes(did) ? prev.filter((id) => id !== did) : [...prev, did]));
  }, []);
  const toggleArchitecture = useCallback((aid: string) => {
    setArchitectureIds((prev) => (prev.includes(aid) ? prev.filter((id) => id !== aid) : [...prev, aid]));
  }, []);

  const getEntityCategory = useCallback(
    (kind: keyof ProjectEntityCategories, entityId: string | number): EntityCategory => {
      const map = entityCategories[kind];
      if (!map || typeof map !== "object") return {};
      const key = typeof entityId === "number" ? String(entityId) : entityId;
      return map[key] ?? {};
    },
    [entityCategories]
  );

  const setEntityCategoryField = useCallback(
    (kind: keyof ProjectEntityCategories, entityId: string | number, field: keyof EntityCategory, value: string) => {
      const key = typeof entityId === "number" ? String(entityId) : entityId;
      setEntityCategories((prev) => {
        const next = { ...prev };
        const map = { ...(next[kind] ?? {}), [key]: { ...(next[kind]?.[key] ?? {}), [field]: value.trim() || undefined } };
        next[kind] = map;
        return next;
      });
    },
    []
  );

  const openDetailModal = useCallback((item: DetailModalItem) => {
    setDetailModalItem(item);
  }, []);

  const categoryBadges = (e: EntityCategory) => (
    <span className="flex flex-wrap gap-1 mt-1">
      {CATEGORY_FIELDS.map(
        (f) =>
          e[f] && (
            <Badge key={f} variant="secondary" className="text-xs font-normal">
              {f}: {e[f]}
            </Badge>
          )
      )}
    </span>
  );

  const saveLinks = async () => {
    if (!id || !project) return;
    setLinksSaving(true);
    try {
      await updateProject(id, {
        name: project.name,
        description: project.description,
        repoPath: project.repoPath,
        promptIds,
        ticketIds,
        featureIds,
        ideaIds,
        designIds,
        architectureIds,
        entityCategories,
      });
      refetchProject();
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLinksSaving(false);
    }
  };

  const exportAsJson = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const data = await getProjectExport(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${project?.name ?? id}.json`.replace(/[^a-zA-Z0-9._-]/g, "_");
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } finally {
      setExporting(false);
    }
  };

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Missing project id.</p>
        <Button asChild variant="outline">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error || "Project not found."}</p>
        <Button asChild variant="outline">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const renderDetailModalContent = () => {
    if (!detailModalItem) return null;
    const { kind, data } = detailModalItem;
    const cat = "phase" in data ? categoryBadges(data as EntityCategory) : null;
    switch (kind) {
      case "prompt": {
        const p = data as ResolvedProject["prompts"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{p.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{p.title || `#${p.id}`}</p>
            </div>
            {p.content != null && p.content !== "" && (
              <div>
                <span className="text-muted-foreground">Content</span>
                <pre className="mt-1 rounded border bg-muted/30 p-3 text-xs whitespace-pre-wrap max-h-[200px] overflow-auto">
                  {p.content}
                </pre>
              </div>
            )}
            {cat}
          </div>
        );
      }
      case "ticket": {
        const t = data as ResolvedProject["tickets"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{t.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{t.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p><Badge variant="outline">{t.status}</Badge></p>
            </div>
            {t.description != null && t.description !== "" && (
              <div>
                <span className="text-muted-foreground">Description</span>
                <p className="mt-1 whitespace-pre-wrap">{t.description}</p>
              </div>
            )}
            {cat}
          </div>
        );
      }
      case "feature": {
        const f = data as ResolvedProject["features"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{f.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{f.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Prompts</span>
              <p className="font-mono text-xs">{(f.prompt_ids ?? []).join(", ") || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Project paths</span>
              <p className="text-xs">{(f.project_paths ?? []).join(", ") || "—"}</p>
            </div>
            {cat}
          </div>
        );
      }
      case "idea": {
        const i = data as ResolvedProject["ideas"][number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{i.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{i.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Category</span>
              <p><Badge variant="secondary">{i.category}</Badge></p>
            </div>
            {i.description != null && i.description !== "" && (
              <div>
                <span className="text-muted-foreground">Description</span>
                <p className="mt-1 whitespace-pre-wrap">{i.description}</p>
              </div>
            )}
            {cat}
          </div>
        );
      }
      case "design": {
        const d = data as NonNullable<ResolvedProject["designs"]>[number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{d.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium">{d.name}</p>
            </div>
            {cat}
          </div>
        );
      }
      case "architecture": {
        const a = data as NonNullable<ResolvedProject["architectures"]>[number];
        return (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-mono">{a.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium">{a.name}</p>
            </div>
            {cat}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const detailModalTitle = detailModalItem
    ? detailModalItem.kind.charAt(0).toUpperCase() + detailModalItem.kind.slice(1) + " details"
    : "";

  return (
    <div className="space-y-6">
      <Dialog open={!!detailModalItem} onOpenChange={(open) => !open && setDetailModalItem(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailModalTitle}</DialogTitle>
          </DialogHeader>
          {renderDetailModalContent()}
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight truncate">{project.name}</h1>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.id}/edit`}>Edit</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsJson}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="ml-1.5">Export as JSON</span>
            </Button>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-sm mt-0.5">{project.description}</p>
          )}
          {project.repoPath && (
            <p className="text-xs text-muted-foreground font-mono mt-1 truncate" title={project.repoPath}>
              {project.repoPath}
            </p>
          )}
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Link to this project
          </CardTitle>
          <CardDescription>
            Check items to link to this project. Changes apply when you click Save links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {linksLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading prompts, tickets, features, ideas, designs, architectures…
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Prompts ({promptIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {promptsList.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={promptIds.includes(p.id)} onCheckedChange={() => togglePrompt(p.id)} />
                      <span className="truncate">{p.title || `#${p.id}`}</span>
                    </label>
                  ))}
                  {promptsList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <TicketIcon className="h-3.5 w-3.5" />
                  Tickets ({ticketIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {ticketsList.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={ticketIds.includes(t.id)} onCheckedChange={() => toggleTicket(t.id)} />
                      <span className="truncate">{t.title}</span>
                    </label>
                  ))}
                  {ticketsList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Features ({featureIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {featuresList.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={featureIds.includes(f.id)} onCheckedChange={() => toggleFeature(f.id)} />
                      <span className="truncate">{f.title}</span>
                    </label>
                  ))}
                  {featuresList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Ideas ({ideaIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {ideasList.map((i) => (
                    <label key={i.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={ideaIds.includes(i.id)} onCheckedChange={() => toggleIdea(i.id)} />
                      <span className="truncate">{i.title}</span>
                    </label>
                  ))}
                  {ideasList.length === 0 && <p className="text-xs text-muted-foreground p-2">None</p>}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  Designs ({designIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {designsList.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={designIds.includes(d.id)} onCheckedChange={() => toggleDesign(d.id)} />
                      <span className="truncate">{d.name}</span>
                    </label>
                  ))}
                  {designsList.length === 0 && (
                    <p className="text-xs text-muted-foreground p-2">None. Save designs from the Design page.</p>
                  )}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Architecture ({architectureIds.length})
                </Label>
                <ScrollArea className="h-[160px] rounded border p-2 bg-background">
                  {architecturesList.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                      <Checkbox checked={architectureIds.includes(a.id)} onCheckedChange={() => toggleArchitecture(a.id)} />
                      <span className="truncate">{a.name}</span>
                    </label>
                  ))}
                  {architecturesList.length === 0 && (
                    <p className="text-xs text-muted-foreground p-2">None. Add definitions from the Architecture page.</p>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
          <Button onClick={saveLinks} disabled={linksSaving || linksLoading} size="sm">
            {linksSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save links"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Categorization
          </CardTitle>
          <CardDescription>
            Assign phase, step, organization, categorizer, or other to each entity. Use &quot;Group by&quot; below to view by category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["prompts", "tickets", "features", "ideas", "designs", "architectures"] as const).map((kind) => {
            const list =
              kind === "prompts"
                ? project.prompts
                : kind === "tickets"
                  ? project.tickets
                  : kind === "features"
                    ? project.features
                    : kind === "ideas"
                      ? project.ideas
                      : kind === "designs"
                        ? project.designs ?? []
                        : project.architectures ?? [];
            const title = (e: { id: number | string; title?: string; name?: string }) => "title" in e ? e.title : e.name;
            const eid = (e: { id: number | string }) => e.id;
            if (list.length === 0) return null;
            return (
              <div key={kind} className="space-y-2">
                <Label className="text-xs capitalize">{kind}</Label>
                <div className="rounded border divide-y text-sm">
                  {list.map((e) => (
                    <div key={String(eid(e))} className="p-2 grid grid-cols-[1fr_auto] gap-2 items-center">
                      <span className="truncate font-medium">{title(e) ?? String(eid(e))}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORY_FIELDS.map((f) => (
                          <Input
                            key={f}
                            placeholder={f}
                            className="h-7 w-24 text-xs"
                            value={getEntityCategory(kind, eid(e))[f] ?? ""}
                            onChange={(ev) => setEntityCategoryField(kind, eid(e), f, ev.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Label className="text-sm shrink-0">Group by</Label>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupByOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {CATEGORY_FIELDS.map((f) => (
              <SelectItem key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompts
            </CardTitle>
            <CardDescription>{project.prompts.length} linked</CardDescription>
          </CardHeader>
          <CardContent>
            {project.prompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prompts linked. Edit project to add prompt IDs.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <ul className="space-y-2 text-sm">
                  {(groupBy === "none"
                    ? project.prompts
                    : [...project.prompts].sort((a, b) => {
                        const va = (a[groupBy] ?? "") as string;
                        const vb = (b[groupBy] ?? "") as string;
                        return va.localeCompare(vb);
                      })
                  ).map((p) => (
                    <li
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "prompt", data: p })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "prompt", data: p })}
                    >
                      <span className="font-medium">{p.title || `#${p.id}`}</span>
                      {categoryBadges(p)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/prompts">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Prompts page
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Tickets
            </CardTitle>
            <CardDescription>{project.tickets.length} linked</CardDescription>
          </CardHeader>
          <CardContent>
            {project.tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets linked. Edit project to add ticket IDs.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <ul className="space-y-2 text-sm">
                  {(groupBy === "none"
                    ? project.tickets
                    : [...project.tickets].sort((a, b) => {
                        const va = (a[groupBy] ?? "") as string;
                        const vb = (b[groupBy] ?? "") as string;
                        return va.localeCompare(vb);
                      })
                  ).map((t) => (
                    <li
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "ticket", data: t })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "ticket", data: t })}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{t.status}</Badge>
                        <span className="truncate">{t.title}</span>
                      </div>
                      {categoryBadges(t)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/?tab=tickets">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Tickets tab
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Features
            </CardTitle>
            <CardDescription>{project.features.length} linked</CardDescription>
          </CardHeader>
          <CardContent>
            {project.features.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features linked. Edit project to add feature IDs.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <ul className="space-y-2 text-sm">
                  {(groupBy === "none"
                    ? project.features
                    : [...project.features].sort((a, b) => {
                        const va = (a[groupBy] ?? "") as string;
                        const vb = (b[groupBy] ?? "") as string;
                        return va.localeCompare(vb);
                      })
                  ).map((f) => (
                    <li
                      key={f.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "feature", data: f })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "feature", data: f })}
                    >
                      <span className="font-medium">{f.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {f.prompt_ids?.length ?? 0} prompts · {f.project_paths?.length ?? 0} projects
                      </span>
                      {categoryBadges(f)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/?tab=feature">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Feature tab
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Ideas
            </CardTitle>
            <CardDescription>{project.ideas.length} linked</CardDescription>
          </CardHeader>
          <CardContent>
            {project.ideas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ideas linked. Edit project to add idea IDs.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <ul className="space-y-2 text-sm">
                  {(groupBy === "none"
                    ? project.ideas
                    : [...project.ideas].sort((a, b) => {
                        const va = (a[groupBy] ?? "") as string;
                        const vb = (b[groupBy] ?? "") as string;
                        return va.localeCompare(vb);
                      })
                  ).map((i) => (
                    <li
                      key={i.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "idea", data: i })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "idea", data: i })}
                    >
                      <span className="font-medium">{i.title}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">{i.category}</Badge>
                      {i.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{i.description}</p>
                      )}
                      {categoryBadges(i)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/ideas">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Ideas page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Designs
            </CardTitle>
            <CardDescription>
              {(project.designs?.length ?? 0)} linked. Link designs in the section above; save new designs from the Design page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.designs && project.designs.length > 0 ? (
              <ScrollArea className="h-[120px] rounded border p-2 mb-2">
                <ul className="space-y-2 text-sm">
                  {(groupBy === "none"
                    ? project.designs
                    : [...project.designs].sort((a, b) => {
                        const va = (a[groupBy] ?? "") as string;
                        const vb = (b[groupBy] ?? "") as string;
                        return va.localeCompare(vb);
                      })
                  ).map((d) => (
                    <li
                      key={d.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "design", data: d })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "design", data: d })}
                    >
                      <span className="font-medium">{d.name}</span>
                      {categoryBadges(d)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">
                No designs linked. Use &quot;Link to this project&quot; above to link designs (save them from the Design page first).
              </p>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/design">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Open Design page
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Architecture
            </CardTitle>
            <CardDescription>
              {(project.architectures?.length ?? 0)} linked. Link architecture definitions in the section above; add definitions from the Architecture page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.architectures && project.architectures.length > 0 ? (
              <ScrollArea className="h-[120px] rounded border p-2 mb-2">
                <ul className="space-y-2 text-sm">
                  {(groupBy === "none"
                    ? project.architectures
                    : [...project.architectures].sort((a, b) => {
                        const va = (a[groupBy] ?? "") as string;
                        const vb = (b[groupBy] ?? "") as string;
                        return va.localeCompare(vb);
                      })
                  ).map((a) => (
                    <li
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      onClick={() => openDetailModal({ kind: "architecture", data: a })}
                      onKeyDown={(e) => e.key === "Enter" && openDetailModal({ kind: "architecture", data: a })}
                    >
                      <span className="font-medium">{a.name}</span>
                      {categoryBadges(a)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">
                No architectures linked. Use &quot;Link to this project&quot; above to link architecture definitions (add them from the Architecture page first).
              </p>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/architecture">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Open Architecture page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

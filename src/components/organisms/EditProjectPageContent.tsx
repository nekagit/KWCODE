"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Loader2, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Palette, Building2 } from "lucide-react";
import type { Project } from "@/types/project";
import { getProject, updateProject } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";

type PromptItem = { id: number; title: string };
type TicketItem = { id: string; title: string; status?: string };
type FeatureItem = { id: string; title: string };
type IdeaItem = { id: number; title: string; category?: string };

export function EditProjectPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [promptIds, setPromptIds] = useState<number[]>([]);
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [ideaIds, setIdeaIds] = useState<number[]>([]);
  const [designIds, setDesignIds] = useState<string[]>([]);
  const [architectureIds, setArchitectureIds] = useState<string[]>([]);

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [designs, setDesigns] = useState<{ id: string; name: string }[]>([]);
  const [architectures, setArchitectures] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePrompt = useCallback((pid: number) => {
    setPromptIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  }, []);
  const toggleTicket = useCallback((tid: string) => {
    setTicketIds((prev) =>
      prev.includes(tid) ? prev.filter((id) => id !== tid) : [...prev, tid]
    );
  }, []);
  const toggleFeature = useCallback((fid: string) => {
    setFeatureIds((prev) =>
      prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid]
    );
  }, []);
  const toggleIdea = useCallback((iid: number) => {
    setIdeaIds((prev) =>
      prev.includes(iid) ? prev.filter((id) => id !== iid) : [...prev, iid]
    );
  }, []);
  const toggleDesign = useCallback((did: string) => {
    setDesignIds((prev) =>
      prev.includes(did) ? prev.filter((id) => id !== did) : [...prev, did]
    );
  }, []);
  const toggleArchitecture = useCallback((aid: string) => {
    setArchitectureIds((prev) =>
      prev.includes(aid) ? prev.filter((id) => id !== aid) : [...prev, aid]
    );
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const projectPromise = isTauri()
      ? getProject(id)
      : fetch(`/api/data/projects/${id}`).then((res) => {
          if (!res.ok) throw new Error("Project not found");
          return res.json();
        });
    const restPromise = isTauri()
      ? Promise.resolve([[], { tickets: [] as TicketItem[], features: [] as FeatureItem[], prompts: [] }, [] as IdeaItem[], [] as { id: string; name: string }[], [] as { id: string; name: string }[]])
      : Promise.all([
          fetch("/api/data/prompts").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/data").then((r) => (r.ok ? r.json() : { tickets: [], features: [], prompts: [] })),
          fetch("/api/data/ideas").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/data/designs").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/data/architectures").then((r) => (r.ok ? r.json() : [])),
        ]);
    Promise.all([projectPromise, restPromise])
      .then(([proj, rest]) => {
        if (cancelled) return;
        const p = proj as Project & { designIds?: string[]; architectureIds?: string[] };
        setProject(p);
        setName(p.name);
        setDescription(p.description ?? "");
        setRepoPath(p.repoPath ?? "");
        setPromptIds(Array.isArray(p.promptIds) ? p.promptIds : []);
        setTicketIds(Array.isArray(p.ticketIds) ? p.ticketIds : []);
        setFeatureIds(Array.isArray(p.featureIds) ? p.featureIds : []);
        setIdeaIds(Array.isArray(p.ideaIds) ? p.ideaIds : []);
        setDesignIds(Array.isArray(p.designIds) ? p.designIds : []);
        setArchitectureIds(Array.isArray(p.architectureIds) ? p.architectureIds : []);

        if (isTauri()) {
          const [promptsList, data, ideasList, designsList, architecturesList] = rest as [unknown[], { tickets: TicketItem[]; features: FeatureItem[] }, IdeaItem[], { id: string; name: string }[], { id: string; name: string }[]];
          setPrompts(Array.isArray(promptsList) ? (promptsList as { id: number; title: string }[]).map((x) => ({ id: Number(x.id), title: x.title ?? "" })) : []);
          setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
          setFeatures(Array.isArray(data?.features) ? data.features : []);
          setIdeas(Array.isArray(ideasList) ? ideasList : []);
          setDesigns(Array.isArray(designsList) ? designsList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
          setArchitectures(Array.isArray(architecturesList) ? architecturesList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
        } else {
          const [promptsList, data, ideasList, designsList, architecturesList] = rest as [unknown[], { tickets: TicketItem[]; features: FeatureItem[] }, IdeaItem[], { id: string; name: string }[], { id: string; name: string }[]];
          setPrompts(Array.isArray(promptsList) ? (promptsList as { id: number; title: string }[]).map((x) => ({ id: Number(x.id), title: x.title ?? "" })) : []);
          setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
          setFeatures(Array.isArray(data?.features) ? data.features : []);
          setIdeas(Array.isArray(ideasList) ? ideasList : []);
          setDesigns(Array.isArray(designsList) ? designsList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
          setArchitectures(Array.isArray(architecturesList) ? architecturesList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
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
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await updateProject(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        repoPath: repoPath.trim() || undefined,
        promptIds,
        ticketIds,
        featureIds,
        ideaIds,
        designIds,
        architectureIds,
      });
      router.push(`/projects/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
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

  if (!project) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error || "Project not found."}</p>
        <Button asChild variant="outline">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Edit project</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project</CardTitle>
          <CardDescription>Name, description, repo path, and links to prompts, tickets, features, and ideas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My SaaS app"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repoPath">Repo path (optional)</Label>
              <Input
                id="repoPath"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="/path/to/repo"
                className="font-mono text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Prompts ({promptIds.length} linked)
                </Label>
                <ScrollArea className="h-[180px] rounded border p-2">
                  <div className="space-y-2">
                    {prompts.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                        <Checkbox
                          checked={promptIds.includes(p.id)}
                          onCheckedChange={() => togglePrompt(p.id)}
                        />
                        <span className="truncate">{p.title || `#${p.id}`}</span>
                      </label>
                    ))}
                    {prompts.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No prompts. Add some on the Prompts page.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TicketIcon className="h-4 w-4" />
                  Tickets ({ticketIds.length} linked)
                </Label>
                <ScrollArea className="h-[180px] rounded border p-2">
                  <div className="space-y-2">
                    {tickets.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                        <Checkbox
                          checked={ticketIds.includes(t.id)}
                          onCheckedChange={() => toggleTicket(t.id)}
                        />
                        <span className="truncate">{t.title}</span>
                      </label>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No tickets. Add some on the Dashboard Tickets tab.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Features ({featureIds.length} linked)
                </Label>
                <ScrollArea className="h-[180px] rounded border p-2">
                  <div className="space-y-2">
                    {features.map((f) => (
                      <label key={f.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                        <Checkbox
                          checked={featureIds.includes(f.id)}
                          onCheckedChange={() => toggleFeature(f.id)}
                        />
                        <span className="truncate">{f.title}</span>
                      </label>
                    ))}
                    {features.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No features. Add some on the Feature tab.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Ideas ({ideaIds.length} linked)
                </Label>
                <ScrollArea className="h-[180px] rounded border p-2">
                  <div className="space-y-2">
                    {ideas.map((i) => (
                      <label key={i.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                        <Checkbox
                          checked={ideaIds.includes(i.id)}
                          onCheckedChange={() => toggleIdea(i.id)}
                        />
                        <span className="truncate">{i.title}</span>
                      </label>
                    ))}
                    {ideas.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No ideas. Add some on the Ideas page.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Designs ({designIds.length} linked)
                </Label>
                <ScrollArea className="h-[180px] rounded border p-2">
                  <div className="space-y-2">
                    {designs.map((d) => (
                      <label key={d.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                        <Checkbox
                          checked={designIds.includes(d.id)}
                          onCheckedChange={() => toggleDesign(d.id)}
                        />
                        <span className="truncate">{d.name}</span>
                      </label>
                    ))}
                    {designs.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No designs. Save from Design page first.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Architecture ({architectureIds.length} linked)
                </Label>
                <ScrollArea className="h-[180px] rounded border p-2">
                  <div className="space-y-2">
                    {architectures.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
                        <Checkbox
                          checked={architectureIds.includes(a.id)}
                          onCheckedChange={() => toggleArchitecture(a.id)}
                        />
                        <span className="truncate">{a.name}</span>
                      </label>
                    ))}
                    {architectures.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No architectures. Add from Architecture page first.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/projects/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Palette, Building2 } from "lucide-react";
import type { Project } from "@/types/project";
import { updateProject } from "@/lib/api-projects";
import { useRouter } from "next/navigation";

type PromptItem = { id: number; title: string };
type TicketItem = { id: string; title: string; status?: string };
type FeatureItem = { id: string; title: string };
type IdeaItem = { id: number; title: string; category?: string };

interface ProjectFormProps {
  project: Project;
  prompts: PromptItem[];
  tickets: TicketItem[];
  features: FeatureItem[];
  ideas: IdeaItem[];
  designs: { id: string; name: string }[];
  architectures: { id: string; name: string }[];
}

export function ProjectForm({
  project,
  prompts,
  tickets,
  features,
  ideas,
  designs,
  architectures,
}: ProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [repoPath, setRepoPath] = useState(project.repoPath ?? "");
  const [promptIds, setPromptIds] = useState<number[]>(project.promptIds ?? []);
  const [ticketIds, setTicketIds] = useState<string[]>(project.ticketIds ?? []);
  const [featureIds, setFeatureIds] = useState<string[]>(project.featureIds ?? []);
  const [ideaIds, setIdeaIds] = useState<number[]>(project.ideaIds ?? []);
  const [designIds, setDesignIds] = useState<string[]>(project.designIds ?? []);
  const [architectureIds, setArchitectureIds] = useState<string[]>(project.architectureIds ?? []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.id || !name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await updateProject(project.id, {
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
      router.push(`/projects/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
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
              <Link href={`/projects/${project.id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

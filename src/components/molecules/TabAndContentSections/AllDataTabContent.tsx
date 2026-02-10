"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Badge } from "@/components/shadcn/badge";
import { Empty } from "@/components/shadcn/empty";
import { Skeleton } from "@/components/shadcn/skeleton";
import { Folders, MessageSquare, Ticket as TicketIcon, Layers, Lightbulb, Palette } from "lucide-react";
import type { Project } from "@/types/project";

interface AllDataTabContentProps {
  allProjects: string[];
  activeProjects: string[];
  toggleProject: (path: string) => void;
  saveActiveProjects: () => Promise<void>;
  prompts: { id: number; title: string; description?: string }[];
  selectedPromptIds: number[];
  setSelectedPromptIds: (ids: number[]) => void;
  tickets: { id: string; title: string; status: string; description?: string }[];
  features: { id: string; title: string; prompt_ids: number[]; project_paths: string[] }[];
  ideas: { id: number; title: string; description: string; category: string }[];
  ideasLoading: boolean;
}

export function AllDataTabContent({
  allProjects,
  activeProjects,
  toggleProject,
  saveActiveProjects,
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
  tickets,
  features,
  ideas,
  ideasLoading,
}: AllDataTabContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Database</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Combined view: projects, prompts, tickets, features, ideas, and design. Use this as the big project page.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Folders className="h-5 w-5" />
              Projects
            </CardTitle>
            <CardDescription className="text-base">All ({allProjects.length}) · Active ({activeProjects.length})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ScrollArea className="h-[200px] rounded border p-2">
              <div className="space-y-1">
                {allProjects.map((path) => {
                  const name = path.split("/").pop() ?? path;
                  const active = activeProjects.includes(path);
                  return (
                    <div key={path} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={active} onCheckedChange={() => toggleProject(path)} />
                      <span className="truncate font-mono" title={path}>{name}</span>
                      {active && <Badge variant="secondary" className="text-xs">active</Badge>}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Button size="sm" onClick={saveActiveProjects}>Save active</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Prompts
            </CardTitle>
            <CardDescription className="text-base">{prompts.length} prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded border p-2">
              <div className="space-y-1 text-sm">
                {prompts.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedPromptIds.includes(p.id)}
                      onCheckedChange={(c) =>
                        setSelectedPromptIds((prev) =>
                          prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                        )}
                    />
                    <span className="truncate">{p.title || `#${p.id}`}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">Select prompts for Run. Edit on Prompts page.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Tickets
            </CardTitle>
            <CardDescription className="text-base">{tickets.length} tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px] rounded border p-2">
              <div className="space-y-2 text-sm">
                {tickets.slice(0, 30).map((t) => (
                  <div key={t.id} className="flex items-start gap-2 rounded border p-2 bg-muted/20">
                    <Badge variant="outline" className="shrink-0 text-xs">{t.status}</Badge>
                    <span className="truncate font-medium">{t.title}</span>
                  </div>
                ))}
                {tickets.length > 30 && (
                  <p className="text-xs text-muted-foreground">+{tickets.length - 30} more</p>
                )}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">Full list on Tickets tab.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription className="text-base">{features.length} features (prompts + projects)</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px] rounded border p-2">
              <div className="space-y-2 text-sm">
                {features.map((f) => (
                  <div key={f.id} className="rounded border p-2 bg-muted/20">
                    <p className="font-medium truncate">{f.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.prompt_ids.length} prompts · {f.project_paths.length} projects
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">Configure on Feature tab.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Ideas
            </CardTitle>
            <CardDescription className="text-base">
              {ideasLoading ? "Loading…" : `${ideas.length} ideas`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ideasLoading ? (
              <Skeleton className="h-[200px] w-full rounded" />
            ) : (
              <ScrollArea className="h-[200px] rounded border p-2">
                <div className="space-y-2 text-sm">
                  {ideas.map((i) => (
                    <div key={i.id} className="rounded border p-2 bg-muted/20">
                      <p className="font-medium truncate">{i.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{i.description}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{i.category}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              <Link href="/ideas" className="text-primary hover:underline">Ideas page</Link> to create and edit.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Design
            </CardTitle>
            <CardDescription className="text-base">Design config and markdown spec</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Configure page layout, colors, typography, and sections. Generate markdown for implementation.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/design">Open Design page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

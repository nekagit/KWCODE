"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shadcn/accordion";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { Checkbox } from "@/components/shadcn/checkbox";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { Button } from "@/components/shadcn/button";
import { Tabs, TabsContent } from "@/components/shadcn/tabs";
import { Badge } from "@/components/shadcn/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip";
import { Empty } from "@/components/shadcn/empty";
import { Layers, ListOrdered, Minus, Play, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { Feature, Ticket } from "@/components/organisms/HomePageContent"; // Assuming these types are available or re-defined

interface FeatureManagementCardProps {
  features: Feature[];
  tickets: Ticket[];
  prompts: { id: number; title: string }[];
  allProjects: string[];
  activeProjects: string[];
  runningRuns: any[]; // Define a proper type for runningRuns if possible
  featureQueue: any[]; // Define a proper type for featureQueue if possible
  setError: (error: string | null) => void;
  addFeatureToQueue: (feature: any) => void;
  removeFeatureFromQueue: (id: string) => void;
  clearFeatureQueue: () => void;
  runFeatureQueue: (projects: string[]) => void;
  runForFeature: (feature: Feature) => Promise<void>;
  saveFeatures: (features: Feature[]) => Promise<void>;
}

export function FeatureManagementCard({
  features,
  tickets,
  prompts,
  allProjects,
  activeProjects,
  runningRuns,
  featureQueue,
  setError,
  addFeatureToQueue,
  removeFeatureFromQueue,
  clearFeatureQueue,
  runFeatureQueue,
  runForFeature,
  saveFeatures,
}: FeatureManagementCardProps) {
  const [featureForm, setFeatureForm] = useState<{
    title: string;
    ticket_ids: string[];
    prompt_ids: number[];
    project_paths: string[];
  }>({
    title: "",
    ticket_ids: [],
    prompt_ids: [],
    project_paths: [],
  });
  const [featureProjectFilter, setFeatureProjectFilter] = useState<string>("");

  const projectsList = allProjects.map(path => ({ id: path, name: path.split('/').pop() || path }));

  const filteredFeatures = useMemo(() => {
    if (!featureProjectFilter) return features;
    const project = projectsList.find((p) => p.id === featureProjectFilter);
    const ids = project?.featureIds ?? []; // Assuming Project type has featureIds
    return features.filter((f) => ids.includes(f.id));
  }, [features, featureProjectFilter, projectsList]);

  const running = runningRuns.some((r) => r.status === "running");

  const addFeature = async () => {
    if (!featureForm.title.trim()) {
      setError("Feature title is required");
      return;
    }
    if (featureForm.ticket_ids.length === 0) {
      setError("A feature is a milestone and must have at least one ticket");
      return;
    }
    if (featureForm.prompt_ids.length === 0) {
      setError("Select at least one prompt for the feature");
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const newFeature: Feature = {
      id: crypto.randomUUID(),
      title: featureForm.title.trim(),
      ticket_ids: [...featureForm.ticket_ids],
      prompt_ids: [...featureForm.prompt_ids],
      project_paths: [...featureForm.project_paths],
      created_at: now,
      updated_at: now,
    };
    await saveFeatures([...features, newFeature]);
    setFeatureForm({ title: "", ticket_ids: [], prompt_ids: [], project_paths: [] });
  };

  const deleteAllFeatures = async () => {
    if (features.length === 0) return;
    await saveFeatures([]);
    clearFeatureQueue();
    toast.success("All features deleted");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Feature {features.length > 0 && (featureProjectFilter ? `(${filteredFeatures.length} of ${features.length})` : `(${features.length})`)}
        </CardTitle>
        <CardDescription className="text-base">
          Combine tickets with prompts and projects; run automation or use in run. Filter by project below. Scroll to see all.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full rounded-lg border bg-muted/30 glasgmorphism">
          <AccordionItem value="add-feature" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b">
              <span className="text-sm font-medium">Add feature</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-1 grid gap-2">
                <Label>Title</Label>
                <Input
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Calendar event adding"
                />
                <Label>Tickets (required, at least one)</Label>
                <div className="flex flex-wrap gap-2">
                  {tickets.map((t) => (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-sm hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={featureForm.ticket_ids.includes(t.id)}
                        onCheckedChange={(c) =>
                          setFeatureForm((f) => ({
                            ...f,
                            ticket_ids: c
                              ? [...f.ticket_ids, t.id]
                              : f.ticket_ids.filter((id) => id !== t.id),
                          }))
                        }
                      />
                      {t.title}
                    </label>
                  ))}
                </div>
                <Label>Prompts (required)</Label>
                <div className="flex flex-wrap gap-2">
                  {prompts.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-sm hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={featureForm.prompt_ids.includes(p.id)}
                        onCheckedChange={(c) =>
                          setFeatureForm((f) => ({
                            ...f,
                            prompt_ids: c
                              ? [...f.prompt_ids, p.id]
                              : f.prompt_ids.filter((id) => id !== p.id),
                          }))
                        }
                      />
                      {p.id}: {p.title}
                    </label>
                  ))}
                </div>
                <Label>Projects (optional — leave empty to use active list)</Label>
                <ScrollArea className="h-[100px] rounded border p-2">
                  <div className="space-y-1">
                    {allProjects.map((path) => {
                      const name = path.split("/").pop() ?? path;
                      return (
                        <label
                          key={path}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={featureForm.project_paths.includes(path)}
                            onCheckedChange={(c) =>
                              setFeatureForm((f) => ({
                                ...f,
                                project_paths: c
                                  ? [...f.project_paths, path]
                                  : f.project_paths.filter((p) => p !== path),
                              }))
                            }
                          />
                          {name}
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
                <Button onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add feature
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-sm text-muted-foreground shrink-0">Filter by project</Label>
          <Select value={featureProjectFilter || "all"} onValueChange={(v) => setFeatureProjectFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projectsList.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {features.length > 0 && (
            <Button type="button" variant="destructive" size="sm" onClick={deleteAllFeatures}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete all
            </Button>
          )}
          {featureQueue.length > 0 && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <ListOrdered className="h-4 w-4" />
                Queue ({featureQueue.length})
              </span>
              <Button
                size="sm"
                onClick={() => runFeatureQueue(activeProjects)}
                disabled={runningRuns.some((r) => r.status === "running")}
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                Run queue
              </Button>
              <Button size="sm" variant="outline" onClick={() => clearFeatureQueue()}>
                Clear queue
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="min-h-[280px] h-[60vh] rounded-md border p-3">
          <div className="space-y-2">
            {filteredFeatures.length === 0 ? (
              <Empty
                title={featureProjectFilter ? "No features in this project" : "No features yet"}
                description={featureProjectFilter ? "Select another project or add features to this project from its edit page." : "Add a feature above (tickets + prompts + projects)."}
                icon={<Layers className="h-6 w-6" />}
              />
            ) : (
              filteredFeatures.map((f) => {
                const inQueue = featureQueue.some((q) => q.id === f.id);
                return (
                  <div
                    key={f.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{f.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Prompts: {f.prompt_ids.join(", ")}
                        {f.ticket_ids.length > 0 &&
                          ` · Tickets: ${f.ticket_ids.map((id) => tickets.find((t) => t.id === id)?.title ?? id).join(", ")}`}
                        {f.project_paths.length > 0 && ` · ${f.project_paths.length} project(s)`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {inQueue ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => removeFeatureFromQueue(f.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove from queue</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                addFeatureToQueue({
                                  id: f.id,
                                  title: f.title,
                                  prompt_ids: f.prompt_ids,
                                  project_paths: f.project_paths,
                                })
                              }
                              disabled={f.prompt_ids.length === 0}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add to run queue</TooltipContent>
                        </Tooltip>
                      )}
                      <Button
                        size="sm"
                        onClick={() => runForFeature(f)}
                        disabled={f.prompt_ids.length === 0}
                      >
                        {runningRuns.some((r) => r.label === f.title && r.status === "running") ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // setSelectedPromptIds(f.prompt_ids); // This would need to be passed as a prop
                          // if (f.project_paths.length > 0) setActiveProjects(f.project_paths); // This would need to be passed as a prop
                        }}
                      >
                        Use in run
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteFeature(f.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

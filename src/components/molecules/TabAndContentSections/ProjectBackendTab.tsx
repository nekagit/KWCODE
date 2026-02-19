"use client";

/** Project Backend Tab component. */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  BarChart3,
  Layers,
  Server,
  FileText,
  Network,
} from "lucide-react";
import { AnalyzeButtonSplit } from "@/components/molecules/ControlsAndButtons/AnalyzeButtonSplit";
import { readProjectFileOrEmpty, readCursorDocFromServer, writeProjectFile, analyzeProjectDoc } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { useRunStore } from "@/store/run-store";
import type { Project } from "@/types/project";
import type { BackendSetupJson } from "@/types/setup-json";
import {
  parseBackendSetupJson,
  getDefaultBackendSetup,
  generateId,
} from "@/types/setup-json";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

import {
  SETUP_BACKEND_JSON_PATH,
  SETUP_BACKEND_PROMPT_PATH,
  SETUP_BACKEND_ANALYSIS_PATH,
} from "@/lib/cursor-paths";
const SETUP_PATH = SETUP_BACKEND_JSON_PATH;
const BACKEND_PROMPT_PATH = SETUP_BACKEND_PROMPT_PATH;
const BACKEND_ANALYSIS_OUTPUT_PATH = SETUP_BACKEND_ANALYSIS_PATH;

interface ProjectBackendTabProps {
  project: Project;
  projectId: string;
  docsRefreshKey?: number;
}

export function ProjectBackendTab({ project, projectId, docsRefreshKey }: ProjectBackendTabProps) {
  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const [data, setData] = useState<BackendSetupJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const cancelledRef = useRef(false);

  const fetchData = useCallback(async (getIsCancelled?: () => boolean) => {
    if (!getIsCancelled?.()) setLoading(true);
    if (!getIsCancelled?.()) setError(null);
    try {
      let raw = project.repoPath
        ? await readProjectFileOrEmpty(projectId, SETUP_PATH, project.repoPath)
        : "";
      if (!raw?.trim()) raw = await readCursorDocFromServer(SETUP_PATH);
      if (getIsCancelled?.()) return;
      setData(parseBackendSetupJson(raw));
    } catch (e) {
      if (!getIsCancelled?.()) {
        setError(e instanceof Error ? e.message : String(e));
        setData(getDefaultBackendSetup());
      }
    } finally {
      if (!getIsCancelled?.()) setLoading(false);
    }
  }, [projectId, project.repoPath]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchData(() => cancelledRef.current);
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchData, docsRefreshKey]);

  const save = useCallback(async () => {
    if (!data || !project.repoPath) return;
    setSaving(true);
    try {
      await writeProjectFile(
        projectId,
        SETUP_PATH,
        JSON.stringify(data, null, 2),
        project.repoPath
      );
      toast.success("Backend setup saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [projectId, project.repoPath, data]);

  const updateData = useCallback((updater: (prev: BackendSetupJson) => BackendSetupJson) => {
    setData((prev) => (prev ? updater(prev) : prev));
  }, []);

  if (!project.repoPath) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Set a repository path for this project to load and save backend setup from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{SETUP_PATH}</code>.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/40 bg-muted/10 py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading backend setup…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Backend tech stack, entities, endpoints</h2>
        <div className="flex items-center gap-2">
          <AnalyzeButtonSplit
            promptPath={BACKEND_PROMPT_PATH}
            projectId={projectId}
            repoPath={project.repoPath ?? undefined}
            onAnalyze={async () => {
              setAnalyzing(true);
              try {
                const result = await analyzeProjectDoc(
                  projectId,
                  BACKEND_PROMPT_PATH,
                  BACKEND_ANALYSIS_OUTPUT_PATH,
                  project.repoPath ?? undefined,
                  { runTempTicket: isTauri ? runTempTicket : undefined }
                );
                if (result?.viaWorker) {
                  toast.success("Analysis started.");
                  return;
                }
                await fetchData();
                toast.success("Backend analysis updated.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Analyze failed");
              } finally {
                setAnalyzing(false);
              }
            }}
            analyzing={analyzing}
            label="Analyze"
          />
          <Button
            size="sm"
            onClick={save}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-6 pr-4">
          {/* KPIs */}
          <SectionCard accentColor="orange">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-semibold">KPIs</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex flex-col rounded-lg border border-border/60 bg-card/80 p-3"
                >
                  <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {kpi.value}
                    {kpi.unit ? ` ${kpi.unit}` : ""}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  updateData((prev) => ({
                    ...prev,
                    kpis: [
                      ...prev.kpis,
                      { id: generateId(), label: "New metric", value: "0", unit: "" },
                    ],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add KPI
              </Button>
              {data.kpis.map((kpi) => (
                <div key={kpi.id} className="flex items-center gap-1 rounded border border-border/60 bg-muted/30 px-2 py-1">
                  <Input
                    className="h-7 w-24 text-xs"
                    value={kpi.label}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        kpis: prev.kpis.map((x) =>
                          x.id === kpi.id ? { ...x, label: e.target.value } : x
                        ),
                      }))
                    }
                    placeholder="Label"
                  />
                  <Input
                    className="h-7 w-16 text-xs tabular-nums"
                    value={kpi.value}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        kpis: prev.kpis.map((x) =>
                          x.id === kpi.id ? { ...x, value: e.target.value } : x
                        ),
                      }))
                    }
                    placeholder="Value"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() =>
                      updateData((prev) => ({
                        ...prev,
                        kpis: prev.kpis.filter((x) => x.id !== kpi.id),
                      }))
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Overview */}
          <SectionCard accentColor="violet">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-violet-500" />
              <h3 className="text-sm font-semibold">Overview</h3>
            </div>
            <Textarea
              className="min-h-[80px] text-sm"
              value={data.overview}
              onChange={(e) => updateData((prev) => ({ ...prev, overview: e.target.value }))}
              placeholder="Short overview of your backend..."
            />
          </SectionCard>

          {/* Tech stack */}
          <SectionCard accentColor="blue">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold">Tech stack</h3>
            </div>
            <div className="space-y-2">
              {data.techStack.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-2 rounded border border-border/60 bg-muted/20 p-2">
                  <Input
                    className="h-8 w-28 text-sm"
                    value={item.category}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        techStack: prev.techStack.map((x) =>
                          x.id === item.id ? { ...x, category: e.target.value } : x
                        ),
                      }))
                    }
                    placeholder="Category"
                  />
                  <Input
                    className="h-8 flex-1 min-w-[120px] text-sm"
                    value={item.name}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        techStack: prev.techStack.map((x) =>
                          x.id === item.id ? { ...x, name: e.target.value } : x
                        ),
                      }))
                    }
                    placeholder="Name"
                  />
                  <Input
                    className="h-8 w-24 text-sm"
                    value={item.version}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        techStack: prev.techStack.map((x) =>
                          x.id === item.id ? { ...x, version: e.target.value } : x
                        ),
                      }))
                    }
                    placeholder="Version"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      updateData((prev) => ({
                        ...prev,
                        techStack: prev.techStack.filter((x) => x.id !== item.id),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-1"
              onClick={() =>
                updateData((prev) => ({
                  ...prev,
                  techStack: [
                    ...prev.techStack,
                    { id: generateId(), category: "", name: "", version: "" },
                  ],
                }))
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add tech stack item
            </Button>
          </SectionCard>

          {/* Entities */}
          <SectionCard accentColor="emerald">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold">Entities</h3>
            </div>
            <div className="overflow-x-auto rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[220px]">Key fields</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.entities.map((ent) => (
                    <TableRow key={ent.id}>
                      <TableCell>
                        <Input
                          className="h-8 text-sm"
                          value={ent.name}
                          onChange={(e) =>
                            updateData((prev) => ({
                              ...prev,
                              entities: prev.entities.map((x) =>
                                x.id === ent.id ? { ...x, name: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Entity name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 text-sm"
                          value={ent.description}
                          onChange={(e) =>
                            updateData((prev) => ({
                              ...prev,
                              entities: prev.entities.map((x) =>
                                x.id === ent.id ? { ...x, description: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 font-mono text-xs"
                          value={ent.keyFields}
                          onChange={(e) =>
                            updateData((prev) => ({
                              ...prev,
                              entities: prev.entities.map((x) =>
                                x.id === ent.id ? { ...x, keyFields: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="id, name, ..."
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            updateData((prev) => ({
                              ...prev,
                              entities: prev.entities.filter((x) => x.id !== ent.id),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-1"
              onClick={() =>
                updateData((prev) => ({
                  ...prev,
                  entities: [
                    ...prev.entities,
                    { id: generateId(), name: "", description: "", keyFields: "" },
                  ],
                }))
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add entity
            </Button>
          </SectionCard>

          {/* Endpoints */}
          <SectionCard accentColor="teal">
            <div className="flex items-center gap-2 mb-3">
              <Network className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-semibold">Endpoints</h3>
            </div>
            <div className="overflow-x-auto rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Method</TableHead>
                    <TableHead className="w-[200px]">Path</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.endpoints.map((ep) => (
                    <TableRow key={ep.id}>
                      <TableCell>
                        <Input
                          className="h-8 text-sm font-mono"
                          value={ep.method}
                          onChange={(e) =>
                            updateData((prev) => ({
                              ...prev,
                              endpoints: prev.endpoints.map((x) =>
                                x.id === ep.id ? { ...x, method: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="GET"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 font-mono text-xs"
                          value={ep.path}
                          onChange={(e) =>
                            updateData((prev) => ({
                              ...prev,
                              endpoints: prev.endpoints.map((x) =>
                                x.id === ep.id ? { ...x, path: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="/api/..."
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 text-sm"
                          value={ep.description}
                          onChange={(e) =>
                            updateData((prev) => ({
                              ...prev,
                              endpoints: prev.endpoints.map((x) =>
                                x.id === ep.id ? { ...x, description: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Brief description"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            updateData((prev) => ({
                              ...prev,
                              endpoints: prev.endpoints.filter((x) => x.id !== ep.id),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-1"
              onClick={() =>
                updateData((prev) => ({
                  ...prev,
                  endpoints: [
                    ...prev.endpoints,
                    { id: generateId(), method: "", path: "", description: "" },
                  ],
                }))
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add endpoint
            </Button>
          </SectionCard>
        </div>
      </ScrollArea>
    </div>
  );
}

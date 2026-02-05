"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { invoke, isTauri } from "@/lib/tauri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Loader2, Ticket as TicketIcon, Plus, Trash2, Layers, Folders, MessageSquare, ScrollText, Sparkles, Upload, FileText, LayoutDashboard, Zap, Database, FileCode, Braces } from "lucide-react";
import { useRunState } from "@/context/run-state";

export type TicketStatus = "backlog" | "in_progress" | "done" | "blocked";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: number;
  created_at: string;
  updated_at: string;
  /** Legacy: present when loading old tickets.json; stripped when saving */
  prompt_ids?: number[];
  project_paths?: string[];
}

export interface Feature {
  id: string;
  title: string;
  ticket_ids: string[];
  prompt_ids: number[];
  project_paths: string[];
  created_at: string;
  updated_at: string;
}

const VALID_TABS = ["dashboard", "projects", "tickets", "feature", "ai-generate", "data", "log"] as const;
type TabValue = (typeof VALID_TABS)[number];

function tabFromParams(searchParams: ReturnType<typeof useSearchParams>): TabValue {
  const t = searchParams.get("tab");
  return (VALID_TABS.includes(t as TabValue) ? t : "dashboard") as TabValue;
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = tabFromParams(searchParams);
  const navigateToTab = (t: TabValue) => router.push("/?tab=" + t);
  const {
    error,
    setError,
    allProjects,
    activeProjects,
    setActiveProjects,
    toggleProject,
    saveActiveProjects,
    prompts,
    selectedPromptIds,
    setSelectedPromptIds,
    getTimingForRun,
    runningRuns,
    selectedRunId,
    setSelectedRunId,
    runWithParams,
    isTauriEnv,
  } = useRunState();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const displayLogLines =
    selectedRunId != null
      ? runningRuns.find((r) => r.runId === selectedRunId)?.logLines ?? []
      : runningRuns[runningRuns.length - 1]?.logLines ?? [];

  const [ticketForm, setTicketForm] = useState<{
    title: string;
    description: string;
    status: TicketStatus;
    priority: number;
  }>({
    title: "",
    description: "",
    status: "backlog",
    priority: 0,
  });
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
  const [aiDescription, setAiDescription] = useState("");
  const [aiOptions, setAiOptions] = useState({
    granularity: "medium" as "epic" | "medium" | "small",
    defaultPriority: "medium" as "low" | "medium" | "high",
    includeAcceptanceCriteria: true,
    includeTechnicalNotes: false,
    splitByComponent: false,
  });
  const AI_FILE_LABELS = ["Design (PDF)", "Infrastructure", "Tech stack", "Project structure"];
  const [aiFileSlots, setAiFileSlots] = useState<
    { label: string; name: string; contentBase64: string; mimeType: string }[]
  >(AI_FILE_LABELS.map((label) => ({ label, name: "", contentBase64: "", mimeType: "" })));
  const [aiPastedTexts, setAiPastedTexts] = useState<string[]>(Array(AI_FILE_LABELS.length).fill(""));
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedTickets, setAiGeneratedTickets] = useState<{ title: string; description: string }[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dataScripts, setDataScripts] = useState<{ name: string; path: string }[]>([]);
  const [dataJsonFiles, setDataJsonFiles] = useState<{ name: string; path: string }[]>([]);
  const [dataFileContent, setDataFileContent] = useState<string | null>(null);
  const [dataSelectedPath, setDataSelectedPath] = useState<string | null>(null);
  const [dataKvEntries, setDataKvEntries] = useState<{ key: string; value: string }[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const running = runningRuns.some((r) => r.status === "running");

  const loadTicketsAndFeatures = useCallback(async () => {
    if (!isTauri()) return;
    setError(null);
    try {
      const [ticketList, featureList] = await Promise.all([
        invoke<Ticket[]>("get_tickets").catch(() => []),
        invoke<Feature[]>("get_features").catch(() => []),
      ]);
      setTickets(ticketList);
      setFeatures(featureList);
      const hasLegacy = ticketList.some((t) => t.prompt_ids?.length);
      if (hasLegacy && featureList.length === 0) {
        const now = new Date().toISOString();
        const newFeatures: Feature[] = ticketList
          .filter((t) => t.prompt_ids?.length)
          .map((t) => ({
            id: crypto.randomUUID(),
            title: t.title,
            ticket_ids: [t.id],
            prompt_ids: t.prompt_ids ?? [],
            project_paths: t.project_paths ?? [],
            created_at: now,
            updated_at: now,
          }));
        const cleanTickets: Ticket[] = ticketList.map(({ prompt_ids, project_paths, ...t }) => t);
        await invoke("save_features", { features: newFeatures });
        await invoke("save_tickets", { tickets: cleanTickets });
        setFeatures(newFeatures);
        setTickets(cleanTickets);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTicketsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isTauri()) loadTicketsAndFeatures();
  }, [loadTicketsAndFeatures]);

  // Data tab: Tauri — load scripts, JSON files, KV from backend
  useEffect(() => {
    if (isTauriEnv !== true || tab !== "data") return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    Promise.all([
      invoke<{ name: string; path: string }[]>("list_scripts").catch(() => []),
      invoke<{ name: string; path: string }[]>("list_data_files").catch(() => []),
      invoke<{ key: string; value: string }[]>("get_kv_store_entries").catch(() => []),
    ])
      .then(([scripts, jsonFiles, kvEntries]) => {
        if (!cancelled) {
          setDataScripts(scripts);
          setDataJsonFiles(jsonFiles);
          setDataKvEntries(kvEntries);
        }
      })
      .catch((e) => {
        if (!cancelled) setDataError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isTauriEnv, tab]);

  // Data tab: browser — load scripts and JSON file list from API (kvEntries set from loadData)
  useEffect(() => {
    if (isTauriEnv !== false || tab !== "data") return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    fetch("/api/data/files")
      .then((res) => (res.ok ? res.json() : res.text().then((t) => Promise.reject(new Error(t)))))
      .then((data: { scripts?: { name: string; path: string }[]; jsonFiles?: { name: string; path: string }[] }) => {
        if (!cancelled) {
          setDataScripts(data.scripts ?? []);
          setDataJsonFiles(data.jsonFiles ?? []);
        }
      })
      .catch((e) => {
        if (!cancelled) setDataError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayLogLines.length]);

  const saveTickets = async (next: Ticket[]) => {
    try {
      const clean = next.map(({ prompt_ids, project_paths, ...t }) => t);
      await invoke("save_tickets", { tickets: clean });
      setTickets(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const addTicket = async () => {
    if (!ticketForm.title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      status: ticketForm.status,
      priority: ticketForm.priority,
      created_at: now,
      updated_at: now,
    };
    const next = [...tickets, newTicket];
    await saveTickets(next);
    setTicketForm({ title: "", description: "", status: "backlog", priority: 0 });
  };

  const saveFeatures = async (next: Feature[]) => {
    try {
      await invoke("save_features", { features: next });
      setFeatures(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const addFeature = async () => {
    if (!featureForm.title.trim()) {
      setError("Feature title is required");
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

  const updateFeature = async (id: string, updates: Partial<Feature>) => {
    const next = features.map((f) =>
      f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
    );
    await saveFeatures(next);
  };

  const deleteFeature = async (id: string) => {
    await saveFeatures(features.filter((f) => f.id !== id));
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    const next = tickets.map((t) =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    );
    await saveTickets(next);
  };

  const deleteTicket = async (id: string) => {
    await saveTickets(tickets.filter((t) => t.id !== id));
  };

  const pickAiFile = async (slotIndex: number) => {
    if (!isTauri()) return;
    setAiError(null);
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        title: `Select file for ${AI_FILE_LABELS[slotIndex]}`,
        filters: slotIndex === 0 ? [{ name: "PDF", extensions: ["pdf"] }] : undefined,
      });
      if (selected === null || (Array.isArray(selected) && selected.length === 0)) return;
      const path = typeof selected === "string" ? selected : selected[0];
      const contentBase64 = await invoke<string>("read_file_as_base64", { path });
      const name = path.split("/").pop() ?? path;
      const mimeType = name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "text/plain";
      setAiFileSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, name, contentBase64, mimeType } : s
        )
      );
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    }
  };

  const clearAiFileSlot = (slotIndex: number) => {
    setAiFileSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex ? { ...s, name: "", contentBase64: "", mimeType: "" } : s
      )
    );
    setAiPastedTexts((prev) => prev.map((t, i) => (i === slotIndex ? "" : t)));
  };

  const generateAiTickets = async () => {
    setAiError(null);
    setAiGenerating(true);
    try {
      const files: { name: string; label: string; contentBase64: string; mimeType: string }[] = [];
      for (let i = 0; i < aiFileSlots.length; i++) {
        const slot = aiFileSlots[i];
        const pasted = aiPastedTexts[i]?.trim();
        if (slot.contentBase64) {
          files.push({
            name: slot.name || slot.label,
            label: slot.label,
            contentBase64: slot.contentBase64,
            mimeType: slot.mimeType || "text/plain",
          });
        } else if (pasted) {
          const base64 = typeof btoa !== "undefined"
            ? btoa(unescape(encodeURIComponent(pasted)))
            : Buffer.from(pasted, "utf-8").toString("base64");
          files.push({
            name: `${slot.label}.txt`,
            label: slot.label,
            contentBase64: base64,
            mimeType: "text/plain",
          });
        }
      }
      const res = await fetch("/api/generate-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: aiDescription,
          options: aiOptions,
          files,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Generate failed");
      setAiGeneratedTickets(data.tickets ?? []);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
      setAiGeneratedTickets([]);
    } finally {
      setAiGenerating(false);
    }
  };

  const addGeneratedTicketsToBacklog = async () => {
    const now = new Date().toISOString();
    const newTickets: Ticket[] = aiGeneratedTickets.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      status: "backlog",
      priority: aiOptions.defaultPriority === "high" ? 2 : aiOptions.defaultPriority === "low" ? 0 : 1,
      created_at: now,
      updated_at: now,
    }));
    await saveTickets([...tickets, ...newTickets]);
    setAiGeneratedTickets([]);
    setError(null);
  };

  const addSingleGeneratedTicket = async (t: { title: string; description: string }) => {
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      status: "backlog",
      priority: aiOptions.defaultPriority === "high" ? 2 : aiOptions.defaultPriority === "low" ? 0 : 1,
      created_at: now,
      updated_at: now,
    };
    await saveTickets([...tickets, newTicket]);
    setAiGeneratedTickets((prev) => prev.filter((x) => x !== t));
  };

  const runForFeature = async (feature: Feature) => {
    if (feature.prompt_ids.length === 0) {
      setError("Feature has no prompts");
      return;
    }
    const projectsToUse =
      feature.project_paths.length > 0 ? feature.project_paths : activeProjects;
    if (projectsToUse.length === 0) {
      setError("Select at least one project (in Projects tab or on the feature)");
      return;
    }
    await runWithParams({
      promptIds: feature.prompt_ids,
      activeProjects: projectsToUse,
      runLabel: feature.title,
    });
    navigateToTab("log");
  };

  return (
    <Tabs value={tab} onValueChange={(v) => navigateToTab(v as TabValue)} className="flex flex-1 flex-col">
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div className="mb-4 flex items-center justify-between gap-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

        <TabsContent value="dashboard" className="mt-0 space-y-6">
          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick actions
              </CardTitle>
              <CardDescription>Shortcuts to common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  onClick={() => navigateToTab("tickets")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add ticket
                </Button>
                {features.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => runForFeature(features[0])}
                    disabled={features[0].prompt_ids.length === 0 || runningRuns.some((r) => r.status === "running")}
                  >
                    {runningRuns.some((r) => r.label === features[0].title && r.status === "running") ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run &quot;{features[0].title.length > 20 ? features[0].title.slice(0, 20) + "…" : features[0].title}&quot;
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.push("/prompts")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Prompts
                </Button>
                <Button variant="outline" onClick={() => navigateToTab("feature")}>
                  <Layers className="h-4 w-4 mr-2" />
                  Features
                </Button>
                <Button variant="outline" onClick={() => navigateToTab("ai-generate")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate tickets
                </Button>
                <Button variant="outline" onClick={() => { setSelectedRunId(runningRuns[runningRuns.length - 1]?.runId ?? null); navigateToTab("log"); }}>
                  <ScrollText className="h-4 w-4 mr-2" />
                  View log
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ticket kanban */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                Ticket board
              </CardTitle>
              <CardDescription>Drag cards between columns to change status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(["backlog", "in_progress", "done", "blocked"] as const).map((status) => (
                  <div
                    key={status}
                    className="rounded-lg border bg-muted/20 min-h-[320px] flex flex-col"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-primary/30"); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-primary/30"); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("ring-2", "ring-primary/30");
                      const id = e.dataTransfer.getData("application/x-ticket-id");
                      if (id) updateTicket(id, { status });
                    }}
                  >
                    <div className="px-3 py-2 border-b bg-muted/40 rounded-t-lg">
                      <span className="text-sm font-medium capitalize">
                        {status === "in_progress" ? "In progress" : status}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({tickets.filter((t) => t.status === status).length})
                      </span>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                      <div className="space-y-2">
                        {tickets
                          .filter((t) => t.status === status)
                          .map((t) => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("application/x-ticket-id", t.id);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              className="rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                            >
                              <p className="font-medium text-sm truncate">{t.title}</p>
                              {t.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">P{t.priority}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={(ev) => { ev.stopPropagation(); deleteTicket(t.id); }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prompts &amp; timing</CardTitle>
              <CardDescription>
                Select which prompt IDs to run. Timing (delays, etc.) is configured on the Configuration page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {prompts.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedPromptIds.includes(p.id)}
                      onCheckedChange={(checked) => {
                        setSelectedPromptIds((prev) =>
                          checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                        );
                      }}
                    />
                    <span className="text-sm">
                      {p.id}: {p.title}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                Tickets
              </CardTitle>
              <CardDescription>
                Define work items: title, description, status. Combine them with prompts and projects in the Feature tab.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium">Add ticket</p>
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Add user dashboard"
                  />
                  <Label>Description (optional)</Label>
                  <textarea
                    className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What should be built..."
                  />
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={ticketForm.status}
                        onValueChange={(v) => setTicketForm((f) => ({ ...f, status: v as TicketStatus }))}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm((f) => ({ ...f, priority: Number(e.target.value) || 0 }))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <Button onClick={addTicket}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add ticket
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[280px] rounded-md border p-3">
                <div className="space-y-2">
                  {tickets.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tickets yet. Add one above.</p>
                  )}
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border p-3 bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{t.title}</p>
                        {t.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                        )}
                      </div>
                      <Select
                        value={t.status}
                        onValueChange={(value) => updateTicket(t.id, { status: value as TicketStatus })}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => deleteTicket(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feature" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Feature
              </CardTitle>
              <CardDescription>
                Combine tickets with prompts and projects; run automation or use in run.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium">Add feature</p>
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={featureForm.title}
                    onChange={(e) => setFeatureForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Calendar event adding"
                  />
                  <Label>Tickets (optional)</Label>
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
              </div>
              <ScrollArea className="h-[280px] rounded-md border p-3">
                <div className="space-y-2">
                  {features.length === 0 && (
                    <p className="text-sm text-muted-foreground">No features yet. Add one above.</p>
                  )}
                  {features.map((f) => (
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
                            setSelectedPromptIds(f.prompt_ids);
                            if (f.project_paths.length > 0) setActiveProjects(f.project_paths);
                          }}
                        >
                          Use in run
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteFeature(f.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active projects (for this run)</CardTitle>
              <CardDescription>
                Check projects to include. Order is preserved. Save writes cursor_projects.json.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[280px] rounded-md border p-3">
                <div className="space-y-2">
                  {allProjects.map((path) => {
                    const name = path.split("/").pop() ?? path;
                    return (
                      <label
                        key={path}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={activeProjects.includes(path)}
                          onCheckedChange={() => toggleProject(path)}
                        />
                        <span className="truncate text-sm font-mono" title={path}>
                          {name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </ScrollArea>
              <Button onClick={saveActiveProjects}>Save active to cursor_projects.json</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-generate" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Ticket Generator
              </CardTitle>
              <CardDescription>
                Upload design PDFs, infrastructure, tech stack, project structure and more. Set options and generate tickets with OpenAI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Project / feature description</Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Describe the project, feature, or scope for which you want tickets..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ticket granularity</Label>
                  <Select
                    value={aiOptions.granularity}
                    onValueChange={(v) => setAiOptions((o) => ({ ...o, granularity: v as "epic" | "medium" | "small" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="epic">Epic / high-level</SelectItem>
                      <SelectItem value="medium">Medium tasks</SelectItem>
                      <SelectItem value="small">Small subtasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default priority</Label>
                  <Select
                    value={aiOptions.defaultPriority}
                    onValueChange={(v) => setAiOptions((o) => ({ ...o, defaultPriority: v as "low" | "medium" | "high" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={aiOptions.includeAcceptanceCriteria}
                    onCheckedChange={(c) => setAiOptions((o) => ({ ...o, includeAcceptanceCriteria: !!c }))}
                  />
                  <span className="text-sm">Include acceptance criteria</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={aiOptions.includeTechnicalNotes}
                    onCheckedChange={(c) => setAiOptions((o) => ({ ...o, includeTechnicalNotes: !!c }))}
                  />
                  <span className="text-sm">Include technical notes</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={aiOptions.splitByComponent}
                    onCheckedChange={(c) => setAiOptions((o) => ({ ...o, splitByComponent: !!c }))}
                  />
                  <span className="text-sm">Split by component</span>
                </label>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload files or paste text
                </Label>
                <p className="text-xs text-muted-foreground">
                  Design PDF, infrastructure, tech stack, project structure. Pick a file or paste content below.
                </p>
                <div className="space-y-4">
                  {AI_FILE_LABELS.map((label, i) => (
                    <div key={label} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{label}</span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => pickAiFile(i)}
                            disabled={!isTauriEnv}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Pick file
                          </Button>
                          {aiFileSlots[i].name && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => clearAiFileSlot(i)}>
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                      {aiFileSlots[i].name && (
                        <p className="text-xs text-muted-foreground truncate" title={aiFileSlots[i].name}>
                          File: {aiFileSlots[i].name}
                        </p>
                      )}
                      <textarea
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={aiPastedTexts[i]}
                        onChange={(e) => setAiPastedTexts((prev) => prev.map((t, j) => (j === i ? e.target.value : t)))}
                        placeholder={`Or paste ${label.toLowerCase()} content here...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {aiError && (
                <p className="text-sm text-destructive" role="alert">
                  {aiError}
                </p>
              )}

              <Button
                onClick={generateAiTickets}
                disabled={aiGenerating || (!aiDescription.trim() && aiFileSlots.every((s) => !s.contentBase64) && aiPastedTexts.every((t) => !t.trim()))}
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate tickets
                  </>
                )}
              </Button>

              {aiGeneratedTickets.length > 0 && (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Generated tickets ({aiGeneratedTickets.length})</p>
                    <Button size="sm" onClick={addGeneratedTicketsToBacklog}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add all to backlog
                    </Button>
                  </div>
                  <ScrollArea className="h-[280px] rounded-md border p-3">
                    <div className="space-y-2">
                      {aiGeneratedTickets.map((t, idx) => (
                        <div key={idx} className="flex flex-wrap items-start gap-2 rounded-lg border p-3 bg-card">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{t.title}</p>
                            {t.description && (
                              <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{t.description}</p>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => addSingleGeneratedTicket(t)}>
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data
              </CardTitle>
              <CardDescription className="space-y-1">
                <span className="block">Scripts in script/, JSON files in data/, and database (kv_store, tickets, features).</span>
                {isTauriEnv ? (
                  <span className="block text-muted-foreground text-xs mt-1">
                    SQLite: data/app.db (created on first run; migrated from data/*.json). All app data is read/written via the DB.
                  </span>
                ) : (
                  <span className="block text-muted-foreground text-xs mt-1">
                    Browser: data is read from data/*.json via API. Scripts and JSON list from project root. Saves require the Tauri app.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {dataError && (
                <p className="text-sm text-destructive" role="alert">{dataError}</p>
              )}
              {dataLoading && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </p>
              )}

              <Accordion type="multiple" className="w-full" defaultValue={["scripts", "json", "db"]}>
                <AccordionItem value="scripts">
                  <AccordionTrigger className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Scripts ({dataScripts.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">script/</p>
                        <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
                          {dataScripts.length === 0 && !dataLoading && (
                            <p className="text-muted-foreground text-sm">No scripts found.</p>
                          )}
                          {dataScripts.map((f) => (
                            <button
                              key={f.path}
                              type="button"
                              className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted truncate"
                              onClick={async () => {
                                setDataError(null);
                                try {
                                  const content = isTauriEnv
                                    ? await invoke<string>("read_file_text", { path: f.path })
                                    : (await (await fetch(`/api/data/file?path=${encodeURIComponent(f.path)}`)).text());
                                  setDataFileContent(content);
                                  setDataSelectedPath(f.path);
                                } catch (e) {
                                  setDataError(e instanceof Error ? e.message : String(e));
                                }
                              }}
                            >
                              {f.name}
                            </button>
                          ))}
                        </ScrollArea>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Content</p>
                        <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                          {dataSelectedPath && dataFileContent != null ? (
                            dataFileContent
                          ) : (
                            <span className="text-muted-foreground">Click a script to view content.</span>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="json">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Braces className="h-4 w-4" />
                    JSON files ({dataJsonFiles.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">data/*.json</p>
                        <ScrollArea className="h-32 rounded border bg-muted/30 p-2">
                          {dataJsonFiles.length === 0 && !dataLoading && (
                            <p className="text-muted-foreground text-sm">No JSON files.</p>
                          )}
                          {dataJsonFiles.map((f) => (
                            <button
                              key={f.path}
                              type="button"
                              className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted truncate"
                              onClick={async () => {
                                setDataError(null);
                                try {
                                  const content = isTauriEnv
                                    ? await invoke<string>("read_file_text", { path: f.path })
                                    : (await (await fetch(`/api/data/file?path=${encodeURIComponent(f.path)}`)).text());
                                  setDataFileContent(content);
                                  setDataSelectedPath(f.path);
                                } catch (e) {
                                  setDataError(e instanceof Error ? e.message : String(e));
                                }
                              }}
                            >
                              {f.name}
                            </button>
                          ))}
                        </ScrollArea>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Content</p>
                        <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                          {dataSelectedPath && dataFileContent != null ? (
                            dataFileContent
                          ) : (
                            <span className="text-muted-foreground">Click a JSON file to view content.</span>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="db">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database (kv_store, tickets, features)
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">kv_store</p>
                      <ScrollArea className="h-40 rounded border bg-muted/30 p-3 font-mono text-xs">
                        {dataKvEntries.length === 0 && !dataLoading && (
                          <p className="text-muted-foreground">No kv entries.</p>
                        )}
                        {dataKvEntries.map((e) => (
                          <div key={e.key} className="mb-3">
                            <span className="font-semibold text-foreground">{e.key}</span>
                            <pre className="mt-1 whitespace-pre-wrap break-all text-muted-foreground">{e.value}</pre>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">tickets ({tickets.length})</p>
                      <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
                        <pre>{JSON.stringify(tickets, null, 2)}</pre>
                      </ScrollArea>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">features ({features.length})</p>
                      <ScrollArea className="h-48 rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
                        <pre>{JSON.stringify(features, null, 2)}</pre>
                      </ScrollArea>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">all_projects ({allProjects.length})</p>
                      <ScrollArea className="h-24 rounded border bg-muted/30 p-3 font-mono text-xs">
                        <pre>{JSON.stringify(allProjects, null, 2)}</pre>
                      </ScrollArea>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">cursor_projects / active ({activeProjects.length})</p>
                      <ScrollArea className="h-24 rounded border bg-muted/30 p-3 font-mono text-xs">
                        <pre>{JSON.stringify(activeProjects, null, 2)}</pre>
                      </ScrollArea>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Script output</CardTitle>
              <CardDescription>
                {selectedRunId != null
                  ? `Live output: ${runningRuns.find((r) => r.runId === selectedRunId)?.label ?? "Run"}`
                  : "Select a run from the top-right to view its output, or start a run from Feature or Prompts."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded border bg-muted/30 p-3 font-mono text-sm">
                {displayLogLines.length === 0 && !running && (
                  <p className="text-muted-foreground">
                    No output yet. Run a feature or start from the Prompts page, then open running terminals (top-right) to view.
                  </p>
                )}
                {displayLogLines.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap break-all">
                    {line}
                  </div>
                ))}
                <div ref={logEndRef} />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}

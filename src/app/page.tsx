"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketsDataTable, type TicketRow } from "@/components/tickets-data-table";
import { Play, Loader2, Ticket as TicketIcon, Plus, Trash2, Layers, Folders, MessageSquare, ScrollText, Sparkles, Upload, FileText, LayoutDashboard, Zap, Database, FileCode, Braces, Lightbulb, Palette, ListOrdered, Minus } from "lucide-react";
import Link from "next/link";
import { useRunState } from "@/context/run-state";
import { toast } from "sonner";
import { FEBRUARY_REPOS_OVERVIEW, FEBRUARY_REPOS_SUMMARY } from "@/data/february-repos-overview";
import { listProjects } from "@/lib/api-projects";
import type { Project } from "@/types/project";

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

/** Minimal type for ideas from /api/data/ideas (All data tab). */
interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  source?: string;
}

const VALID_TABS = ["dashboard", "projects", "tickets", "feature", "all", "data", "log"] as const;
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
    featureQueue,
    addFeatureToQueue,
    removeFeatureFromQueue,
    clearFeatureQueue,
    runFeatureQueue,
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
  const [ticketPageAiProjectPath, setTicketPageAiProjectPath] = useState<string>("");
  const [dataScripts, setDataScripts] = useState<{ name: string; path: string }[]>([]);
  const [dataJsonFiles, setDataJsonFiles] = useState<{ name: string; path: string }[]>([]);
  const [dataFileContent, setDataFileContent] = useState<string | null>(null);
  const [dataSelectedPath, setDataSelectedPath] = useState<string | null>(null);
  const [dataKvEntries, setDataKvEntries] = useState<{ key: string; value: string }[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [featureProjectFilter, setFeatureProjectFilter] = useState<string>("");
  const running = runningRuns.some((r) => r.status === "running");

  const filteredFeatures = useMemo(() => {
    if (!featureProjectFilter) return features;
    const project = projectsList.find((p) => p.id === featureProjectFilter);
    const ids = project?.featureIds ?? [];
    return features.filter((f) => ids.includes(f.id));
  }, [features, featureProjectFilter, projectsList]);

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

  // Load projects list for Feature tab filter
  useEffect(() => {
    if (tab !== "feature") return;
    let cancelled = false;
    listProjects()
      .then((list) => {
        if (!cancelled) setProjectsList(list);
      })
      .catch(() => {
        if (!cancelled) setProjectsList([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  // Browser: load tickets, features, and kv entries from /api/data (reads data/*.json)
  useEffect(() => {
    if (isTauri() || isTauriEnv !== false || ticketsLoaded) return;
    let cancelled = false;
    fetch("/api/data")
      .then((res) => (res.ok ? res.json() : res.text().then((t) => Promise.reject(new Error(t)))))
      .then((data: { tickets?: Ticket[]; features?: Feature[]; kvEntries?: { key: string; value: string }[] }) => {
        if (cancelled) return;
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
        setFeatures(Array.isArray(data.features) ? data.features : []);
        if (Array.isArray(data.kvEntries)) setDataKvEntries(data.kvEntries);
        setTicketsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setTicketsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isTauriEnv, ticketsLoaded]);

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

  // All data tab: fetch ideas from API
  useEffect(() => {
    if (tab !== "all") return;
    let cancelled = false;
    setIdeasLoading(true);
    fetch("/api/data/ideas")
      .then((res) => (res.ok ? res.json() : res.text().then((t) => Promise.reject(new Error(t)))))
      .then((data: IdeaRecord[]) => {
        if (!cancelled) setIdeas(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setIdeas([]);
      })
      .finally(() => {
        if (!cancelled) setIdeasLoading(false);
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
      toast.success("Tickets saved");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error("Failed to save tickets", { description: msg });
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
      toast.success("Features saved");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error("Failed to save features", { description: msg });
    }
  };

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

  const updateFeature = async (id: string, updates: Partial<Feature>) => {
    if (updates.ticket_ids !== undefined && updates.ticket_ids.length === 0) {
      setError("A feature must have at least one ticket");
      return;
    }
    const next = features.map((f) =>
      f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
    );
    await saveFeatures(next);
  };

  const deleteFeature = async (id: string) => {
    await saveFeatures(features.filter((f) => f.id !== id));
  };

  const deleteAllFeatures = async () => {
    if (features.length === 0) return;
    await saveFeatures([]);
    clearFeatureQueue();
    toast.success("All features deleted");
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

  const generateAiTicketsFromProject = async () => {
    const path = ticketPageAiProjectPath?.trim();
    if (!path) {
      setAiError("Select a project first.");
      return;
    }
    setAiError(null);
    setAiGenerating(true);
    try {
      const projectName = path.split("/").pop() ?? path;
      let project_analysis: {
        name: string;
        path: string;
        package_json?: string;
        readme_snippet?: string;
        top_level_dirs: string[];
        top_level_files: string[];
        config_snippet?: string;
      } | undefined;
      if (isTauri()) {
        try {
          const analysis = await invoke<{
            name: string;
            path: string;
            package_json?: string;
            readme_snippet?: string;
            top_level_dirs: string[];
            top_level_files: string[];
            config_snippet?: string;
          }>("analyze_project_for_tickets", { projectPath: path });
          project_analysis = {
            name: analysis.name,
            path: analysis.path,
            package_json: analysis.package_json ?? undefined,
            readme_snippet: analysis.readme_snippet ?? undefined,
            top_level_dirs: analysis.top_level_dirs ?? [],
            top_level_files: analysis.top_level_files ?? [],
            config_snippet: analysis.config_snippet ?? undefined,
          };
        } catch {
          // Fall back to description-only if analysis fails (e.g. path not accessible)
        }
      }
      const description = project_analysis
        ? `Generate development tickets for project "${project_analysis.name}". Use the attached project analysis to infer tech stack, existing structure, and produce a prioritized feature/todo list (no generic tickets like "create documentation" or "install X" unless clearly missing).`
        : `Generate development tickets for the following project.

Project path: ${path}
Project name: ${projectName}

Suggest actionable work items: setup, dependencies, features, tests, and documentation. Base suggestions on typical project structure and best practices.`;
      const res = await fetch("/api/generate-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          options: aiOptions,
          files: [],
          ...(project_analysis && { project_analysis }),
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
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
                <Button variant="outline" onClick={() => navigateToTab("projects")}>
                  <Folders className="h-4 w-4 mr-2" />
                  Active repos
                </Button>
                <Button variant="outline" onClick={() => navigateToTab("feature")}>
                  <Layers className="h-4 w-4 mr-2" />
                  Features
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
                    <div className="px-3 py-2 border-b bg-muted/40 rounded-t-lg flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="capitalize font-medium">
                        {status === "in_progress" ? "In progress" : status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tickets.filter((t) => t.status === status).length}
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
                                <Badge variant="outline" className="text-xs">P{t.priority}</Badge>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={(ev) => { ev.stopPropagation(); deleteTicket(t.id); }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete ticket</TooltipContent>
                                </Tooltip>
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
                {tickets.length > 0 && (
                  <span className="block mt-1 font-medium text-foreground">
                    {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full rounded-lg border bg-muted/30">
                <AccordionItem value="add-ticket" className="border-none">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b">
                    Add ticket
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2">
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Add user dashboard"
                      />
                      <Label>Description (optional)</Label>
                      <Textarea
                        className="min-h-[60px]"
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI generate from project
                </p>
                <p className="text-xs text-muted-foreground">
                  Select a project and generate tickets based on it. Uses the same options as the AI Generate tab.
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-2 min-w-[200px] flex-1">
                    <Label>Project</Label>
                    <Select
                      value={ticketPageAiProjectPath || "__none__"}
                      onValueChange={(v) => setTicketPageAiProjectPath(v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Select a project</SelectItem>
                        {allProjects.map((projectPath) => {
                          const name = projectPath.split("/").pop() ?? projectPath;
                          return (
                            <SelectItem key={projectPath} value={projectPath}>
                              {name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={generateAiTicketsFromProject}
                    disabled={aiGenerating || !ticketPageAiProjectPath.trim()}
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Generate tickets
                      </>
                    )}
                  </Button>
                </div>
                {aiError && (
                  <Alert variant="destructive">
                    <AlertDescription>{aiError}</AlertDescription>
                  </Alert>
                )}
                {aiGeneratedTickets.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Generated tickets ({aiGeneratedTickets.length})</p>
                      <Button size="sm" onClick={addGeneratedTicketsToBacklog}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add all to backlog
                      </Button>
                    </div>
                    <ScrollArea className="h-[200px] rounded-md border p-3">
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
              </div>

              <TicketsDataTable
                tickets={tickets as TicketRow[]}
                onUpdateStatus={(id, status) => updateTicket(id, { status })}
                onDelete={deleteTicket}
                emptyTitle="No tickets yet"
                emptyDescription="Add a ticket using the form above."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feature" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Feature {features.length > 0 && (featureProjectFilter ? `(${filteredFeatures.length} of ${features.length})` : `(${features.length})`)}
              </CardTitle>
              <CardDescription>
                Combine tickets with prompts and projects; run automation or use in run. Filter by project below. Scroll to see all.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full rounded-lg border bg-muted/30">
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
                      {runningRuns.some((r) => r.status === "running") ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
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
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active repos (for this run)</CardTitle>
              <CardDescription>
                Check repo paths to include when running prompts. Order is preserved. Save writes cursor_projects.json. For project pages (design, ideas, features, tickets, prompts), use <strong>Projects</strong> in the sidebar.
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

        <TabsContent value="all" className="mt-0 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Database</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Combined view: projects, prompts, tickets, features, ideas, and design. Use this as the big project page.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Folders className="h-4 w-4" />
                  Projects
                </CardTitle>
                <CardDescription>All ({allProjects.length}) · Active ({activeProjects.length})</CardDescription>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Prompts
                </CardTitle>
                <CardDescription>{prompts.length} prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] rounded border p-2">
                  <div className="space-y-1 text-sm">
                    {prompts.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPromptIds.includes(p.id)}
                          onCheckedChange={() =>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <TicketIcon className="h-4 w-4" />
                  Tickets
                </CardTitle>
                <CardDescription>{tickets.length} tickets</CardDescription>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Features
                </CardTitle>
                <CardDescription>{features.length} features (prompts + projects)</CardDescription>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Ideas
                </CardTitle>
                <CardDescription>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Design
                </CardTitle>
                <CardDescription>Design config and markdown spec</CardDescription>
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
        </TabsContent>

        <TabsContent value="data" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                DB Data
              </CardTitle>
              <CardDescription className="space-y-1">
                <span className="block">Scripts in script/, JSON files in data/, and DB data (kv_store, tickets, features).</span>
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
                <Alert variant="destructive">
                  <AlertDescription>{dataError}</AlertDescription>
                </Alert>
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
                    DB Data (kv_store, tickets, features)
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

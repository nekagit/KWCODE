"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { invoke, isTauri } from "@/lib/tauri";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRunState } from "@/context/run-state";
import { listProjects } from "@/lib/api-projects";
import type { Project } from "@/types/project";
import { ProjectsTabContent } from "@/components/molecules/TabAndContentSections/ProjectsTabContent";
import { AllDataTabContent } from "@/components/molecules/TabAndContentSections/AllDataTabContent";
import { DatabaseDataTabContent } from "@/components/molecules/TabAndContentSections/DatabaseDataTabContent";
import { DashboardTabContent } from "@/components/molecules/TabAndContentSections/DashboardTabContent";
import { PromptsTabContent } from "@/components/molecules/TabAndContentSections/PromptsTabContent";
import { getOrganismClasses } from "./organism-classes";
import { toast } from "sonner";
import { DASHBOARD_TAB_TITLES } from "@/context/page-title-context";

import type { Ticket, TicketRow, TicketStatus } from "@/types/ticket";

const c = getOrganismClasses("HomePageContent.tsx");

/** Ticket shape from Tauri get_tickets (may include legacy prompt_ids/project_paths). */
type TicketFromApi = TicketRow & { prompt_ids?: number[]; project_paths?: string[] };
/** Minimal type for ideas from /api/data/ideas (All data tab). */
interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  source?: string;
}

const DASHBOARD_TAB_VALUES = ["dashboard", "projects", "prompts", "all", "data"] as const;
const DASHBOARD_TAB_STORAGE_KEY = "kwcode-dashboard-tab";

function tabFromParams(searchParams: ReturnType<typeof useSearchParams> | null): string {
  const t = searchParams?.get("tab") ?? null;
  return (t && DASHBOARD_TAB_VALUES.includes(t as (typeof DASHBOARD_TAB_VALUES)[number]) ? t : "dashboard") as string;
}

export function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = tabFromParams(searchParams);
  const navigateToTab = (t: string) => router.push("/?tab=" + t);

  const {
    allProjects,
    activeProjects,
    setActiveProjects,
    toggleProject,
    saveActiveProjects,
    prompts,
    selectedPromptRecordIds,
    setSelectedPromptRecordIds,
    runningRuns,
    runWithParams,
    isTauriEnv,
    refreshData,
  } = useRunState();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);

  const [dataKvEntries, setDataKvEntries] = useState<{ key: string; value: string }[]>([]);
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    if (!isTauri) return;
    try {
      const ticketList = await invoke<TicketFromApi[]>("get_tickets");
      const cleanTickets: Ticket[] = ticketList.map(({ prompt_ids, project_paths, ...t }) => t as Ticket);
      setTickets(cleanTickets);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isTauri) loadTickets();
  }, [loadTickets, isTauri]);

  // Restore last dashboard tab from localStorage when URL has no ?tab= (persist preference)
  useEffect(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl != null && fromUrl !== "") return;
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(DASHBOARD_TAB_STORAGE_KEY) : null;
      if (saved && saved !== "dashboard" && DASHBOARD_TAB_VALUES.includes(saved as (typeof DASHBOARD_TAB_VALUES)[number])) {
        router.replace("/?tab=" + saved);
      }
    } catch {
      // ignore
    }
  }, [router, searchParams]);

  // Browser: load tickets and kv entries from /api/data (reads data/*.json)
  useEffect(() => {
    if (isTauri || isTauriEnv !== false || ticketsLoaded) return;
    let cancelled = false;
    fetch("/api/data")
      .then((res) => (res.ok ? res.json() : res.text().then((t) => Promise.reject(new Error(t)))))
      .then((data: { tickets?: Ticket[]; kvEntries?: { key: string; value: string }[] }) => {
        if (cancelled) return;
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
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

  const saveTickets = async (next: Ticket[]) => {
    try {
      await invoke("save_tickets", { tickets: next });
      setTickets(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(msg);
    }
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

  const handleTabChange = useCallback(
    (v: string) => {
      try {
        if (typeof window !== "undefined") localStorage.setItem(DASHBOARD_TAB_STORAGE_KEY, v);
      } catch (_) {}
      navigateToTab(v);
    },
    [navigateToTab]
  );

  const tabTriggers = (["dashboard", "projects", "prompts", "all", "data"] as const).map((t) => ({
    value: t,
    label: DASHBOARD_TAB_TITLES[t] ?? t,
  }));

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className={c["0"]} data-testid="home-page-tabs">
      <div className={c["1"]}>
        <TabsList className="mb-4 flex w-full flex-wrap gap-1 rounded-xl border border-border/40 bg-muted/20 p-1.5" aria-label="Dashboard sections">
          {tabTriggers.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} data-testid={`tab-${value}`}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="dashboard" className={c["4"]}>
          <DashboardTabContent />
        </TabsContent>

        <TabsContent value="prompts" className={c["5"]}>
          <PromptsTabContent
            prompts={prompts}
            selectedPromptRecordIds={selectedPromptRecordIds}
            setSelectedPromptRecordIds={setSelectedPromptRecordIds}
          />
        </TabsContent>

        <TabsContent value="projects" className={c["8"]}>
          <ProjectsTabContent
            allProjects={allProjects}
            activeProjects={activeProjects}
            toggleProject={toggleProject}
            saveActiveProjects={saveActiveProjects}
            onSelectAll={() => setActiveProjects([...allProjects])}
            onDeselectAll={() => setActiveProjects([])}
          />
        </TabsContent>

        <TabsContent value="all" className={c["9"]}>
          <AllDataTabContent
            allProjects={allProjects}
            activeProjects={activeProjects}
            toggleProject={toggleProject}
            saveActiveProjects={saveActiveProjects}
            onSelectAll={() => setActiveProjects([...allProjects])}
            onDeselectAll={() => setActiveProjects([])}
            prompts={prompts}
            selectedPromptRecordIds={selectedPromptRecordIds}
            setSelectedPromptRecordIds={setSelectedPromptRecordIds}
            tickets={tickets}
            ideas={ideas}
            ideasLoading={ideasLoading}
          />
        </TabsContent>

        <TabsContent value="data" className={c["10"]}>
          <DatabaseDataTabContent
            isTauriEnv={isTauriEnv}
            tickets={tickets}
            allProjects={allProjects}
            activeProjects={activeProjects}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}

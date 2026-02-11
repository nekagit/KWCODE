"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { invoke, isTauri } from "@/lib/tauri";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useRunState } from "@/context/run-state";
import type { Project } from "@/types/project";
import { ProjectsTabContent } from "@/components/molecules/TabAndContentSections/ProjectsTabContent";
import { AllDataTabContent } from "@/components/molecules/TabAndContentSections/AllDataTabContent";
import { DbDataTabContent } from "@/components/molecules/TabAndContentSections/DbDataTabContent";
import { LogTabContent } from "@/components/molecules/TabAndContentSections/LogTabContent";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DashboardTabContent } from "@/components/molecules/TabAndContentSections/DashboardTabContent";
import { PromptsTabContent } from "@/components/molecules/TabAndContentSections/PromptsTabContent"; // Corrected import
import { TicketsTabContent } from "@/components/molecules/TabAndContentSections/TicketsTabContent";
import { FeatureTabContent } from "@/components/molecules/TabAndContentSections/FeatureTabContent";

import type { Ticket, TicketStatus } from "@/types/ticket";
import type { Feature } from "@/types/project";
/** Minimal type for ideas from /api/data/ideas (All data tab). */
interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  source?: string;
}

function tabFromParams(searchParams: ReturnType<typeof useSearchParams>): string {
  const t = searchParams.get("tab");
  return (["dashboard", "projects", "tickets", "feature", "all", "data", "log", "prompts"].includes(t as string) ? t : "dashboard") as string;
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

  const [dataKvEntries, setDataKvEntries] = useState<{ key: string; value: string }[]>([]);
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const running = runningRuns.some((r) => r.status === "running");

  const loadTicketsAndFeatures = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const [ticketList, featureList] = await Promise.all([
        invoke<Ticket[]>("get_tickets"),
        invoke<Feature[]>("get_features"),
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
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isTauri()) loadTicketsAndFeatures();
  }, [loadTicketsAndFeatures]);

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

  const runForFeature = async (feature: Feature) => {
    if (feature.prompt_ids.length === 0) {
      console.error("Feature has no prompts");
      return;
    }
    const projectsToUse =
      feature.project_paths.length > 0 ? feature.project_paths : activeProjects;
    if (projectsToUse.length === 0) {
      console.error("Select at least one project (in Projects tab or on the feature)");
      return;
    }
    await runWithParams({
      promptIds: feature.prompt_ids,
      activeProjects: projectsToUse,
      runLabel: feature.title,
    });
    navigateToTab("log");
  };

  const saveFeatures = async (next: Feature[]) => {
    try {
      await invoke("save_features", { features: next });
      setFeatures(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(msg);
    }
  };

  const saveTickets = async (next: Ticket[]) => {
    try {
      const clean = next.map(({ prompt_ids, project_paths, ...t }) => t);
      await invoke("save_tickets", { tickets: clean });
      setTickets(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(msg);
    }
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

  const displayLogLines =
    selectedRunId != null
      ? runningRuns.find((r) => r.runId === selectedRunId)?.logLines ?? []
      : runningRuns[runningRuns.length - 1]?.logLines ?? [];

  return (
    <Tabs value={tab} onValueChange={(v) => navigateToTab(v as string)} className="flex flex-1 flex-col">
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="mb-4 flex items-center justify-between gap-4">
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="dashboard" className="mt-0 space-y-6">
          <DashboardTabContent
            features={features}
            runningRuns={runningRuns}
            navigateToTab={navigateToTab}
            runForFeature={runForFeature}
            setSelectedRunId={setSelectedRunId}
            tickets={tickets}
            updateTicket={updateTicket}
            deleteTicket={deleteTicket}
            router={router}
          />
        </TabsContent>

        <TabsContent value="prompts" className="mt-0 space-y-6">
          <PromptsTabContent
            prompts={prompts}
            selectedPromptRecordIds={selectedPromptRecordIds}
            setSelectedPromptRecordIds={setSelectedPromptRecordIds}
          />
        </TabsContent>

        <TabsContent value="tickets" className="mt-0">
          <TicketsTabContent
            tickets={tickets}
            saveTickets={saveTickets}
            updateTicket={updateTicket}
            deleteTicket={deleteTicket}
          />
        </TabsContent>

        <TabsContent value="feature" className="mt-0">
          <FeatureTabContent
            features={features}
            tickets={tickets}
            prompts={prompts}
            allProjects={allProjects}
            activeProjects={activeProjects}
            runningRuns={runningRuns}
            featureQueue={featureQueue as Feature[]}
            addFeatureToQueue={addFeatureToQueue}
            removeFeatureFromQueue={removeFeatureFromQueue}
            clearFeatureQueue={clearFeatureQueue}
            runFeatureQueue={runFeatureQueue}
            runForFeature={runForFeature}
            saveFeatures={saveFeatures}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <ProjectsTabContent
            allProjects={allProjects}
            activeProjects={activeProjects}
            toggleProject={toggleProject}
            saveActiveProjects={saveActiveProjects}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-0 space-y-6">
          <AllDataTabContent
            allProjects={allProjects}
            activeProjects={activeProjects}
            toggleProject={toggleProject}
            saveActiveProjects={saveActiveProjects}
            prompts={prompts}
            selectedPromptRecordIds={selectedPromptRecordIds}
            setSelectedPromptRecordIds={setSelectedPromptRecordIds}
            tickets={tickets}
            features={features}
            ideas={ideas}
            ideasLoading={ideasLoading}
          />
        </TabsContent>

        <TabsContent value="data" className="mt-0 space-y-6">
          <DbDataTabContent
            isTauriEnv={isTauriEnv}
            tickets={tickets}
            features={features}
            allProjects={allProjects}
            activeProjects={activeProjects}
          />
        </TabsContent>

        <TabsContent value="log" className="mt-0">
          <LogTabContent
            displayLogLines={displayLogLines}
            selectedRunId={selectedRunId}
            runningRuns={runningRuns}
            running={running}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}

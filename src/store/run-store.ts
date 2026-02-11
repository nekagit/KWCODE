"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { invoke, isTauri } from "@/lib/tauri";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import {
  DEFAULT_TIMING,
  type Timing,
  type PromptRecordItem,
  type RunInfo,
  type FeatureQueueItem,
} from "@/types/run";

export interface RunState {
  isTauriEnv: boolean | null;
  loading: boolean;
  error: string | null;
  /** Non-fatal message when API returns 200 but data dir missing (browser). */
  dataWarning: string | null;
  allProjects: string[];
  activeProjects: string[];
  prompts: PromptRecordItem[];
  selectedPromptRecordIds: number[];
  timing: Timing;
  runningRuns: RunInfo[];
  selectedRunId: string | null;
  /** Features added via + on Feature tab; run queue to execute in order. */
  featureQueue: FeatureQueueItem[];
  /** run_id of the current run that is part of the queue (for advancing on script-exited). */
  queueRunInfoId: string | null;
}

export interface RunActions {
  setError: (e: string | null) => void;
  setActiveProjects: (p: string[] | ((prev: string[]) => string[])) => void;
  toggleProject: (path: string) => void;
  saveActiveProjects: () => Promise<void>;
  setSelectedPromptRecordIds: (ids: number[] | ((prev: number[]) => number[])) => void;
  setTiming: React.Dispatch<React.SetStateAction<Timing>>;
  setRunInfos: React.Dispatch<React.SetStateAction<RunInfo[]>>;
  setSelectedRunId: (id: string | null) => void;
  refreshData: () => Promise<void>;
  runScript: () => Promise<void>;
  runWithParams: (params: {
    promptIds?: number[];
    combinedPromptRecord?: string;
    activeProjects: string[];
    runLabel: string | null;
  }) => Promise<string | null>;
  addFeatureToQueue: (feature: FeatureQueueItem) => void;
  removeFeatureFromQueue: (id: string) => void;
  clearFeatureQueue: () => void;
  runFeatureQueue: (activeProjectsFallback: string[]) => Promise<void>;
  runNextInQueue: (exitedRunId: string) => void;
  stopScript: () => Promise<void>;
  stopRun: (runId: string) => Promise<void>;
  getTimingForRun: () => Record<string, number>;
  // Hydration/setters used by RunStoreHydration
  setIsTauriEnv: (v: boolean | null | ((prev: boolean | null) => boolean | null)) => void;
  setLoading: (v: boolean | ((prev: boolean) => boolean)) => void;
  setAllProjects: (v: string[]) => void;
  setActiveProjectsSync: (v: string[]) => void;
  setPromptRecords: (v: PromptRecordItem[]) => void;
}

export type RunStore = RunState & RunActions;

const initialState: RunState = {
  isTauriEnv: null,
  loading: true,
  error: null,
  dataWarning: null,
  allProjects: [],
  activeProjects: [],
  prompts: [],
  selectedPromptRecordIds: [],
  timing: DEFAULT_TIMING,
  runningRuns: [],
  selectedRunId: null,
  featureQueue: [],
  queueRunInfoId: null,
};

export const useRunStore = create<RunStore>()((set, get) => ({
  ...initialState,

  setError: (e) => set({ error: e }),

  setActiveProjects: (p) =>
    set((s) => ({
      activeProjects: typeof p === "function" ? p(s.activeProjects) : p,
    })),

  toggleProject: (path) =>
    set((s) => ({
      activeProjects: s.activeProjects.includes(path)
        ? s.activeProjects.filter((x) => x !== path)
        : [...s.activeProjects, path],
    })),

  saveActiveProjects: async () => {
    const { activeProjects } = get();
    try {
      await invoke("save_active_projects", { projects: activeProjects });
      set({ error: null });
      toast.success("Saved active projects to cursor_projects.json");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
      toast.error("Failed to save projects", { description: msg });
    }
  },

  setSelectedPromptRecordIds: (ids) =>
    set((s) => ({
      selectedPromptRecordIds:
        typeof ids === "function" ? ids(s.selectedPromptRecordIds) : ids,
    })),

  setTiming: (updater) =>
    set((s) => ({
      timing: typeof updater === "function" ? updater(s.timing) : updater,
    })),

  setRunInfos: (updater) =>
    set((s) => ({
      runningRuns:
        typeof updater === "function" ? updater(s.runningRuns) : updater,
    })),

  setSelectedRunId: (id) => set({ selectedRunId: id }),

  getTimingForRun: () => {
    const { timing } = get();
    return {
      sleep_after_open_project: timing.sleep_after_open_project,
      sleep_after_window_focus: timing.sleep_after_window_focus,
      sleep_between_shift_tabs: timing.sleep_between_shift_tabs,
      sleep_after_all_shift_tabs: timing.sleep_after_all_shift_tabs,
      sleep_after_cmd_n: timing.sleep_after_cmd_n,
      sleep_before_paste: timing.sleep_before_paste,
      sleep_after_paste: timing.sleep_after_paste,
      sleep_after_enter: timing.sleep_after_enter,
      sleep_between_projects: timing.sleep_between_projects,
      sleep_between_rounds: timing.sleep_between_rounds,
    };
  },

  refreshData: async () => {
    set({ error: null, dataWarning: null });
    try {
      if (isTauri()) {
        const [all, active, promptList] = await Promise.all([
          invoke<string[]>("list_february_folders"),
          invoke<string[]>("get_active_projects"),
          invoke<PromptRecordItem[]>("get_prompts"),
        ]);
        set({ allProjects: all, activeProjects: active, prompts: promptList });
      } else {
        const res = await fetch("/api/data");
        if (!res.ok) throw new Error(await getApiErrorMessage(res));
        const data = await res.json();
        const warning =
          typeof (data as { _warning?: string })._warning === "string"
            ? (data as { _warning: string })._warning
            : null;
        set({
          allProjects: Array.isArray(data.allProjects) ? data.allProjects : [],
          activeProjects: Array.isArray(data.activeProjects) ? data.activeProjects : [],
          prompts: Array.isArray(data.prompts) ? data.prompts : [],
          dataWarning: warning ?? null,
        });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  runScript: async () => {
    const { selectedPromptRecordIds, activeProjects, getTimingForRun, setError, setRunInfos, setSelectedRunId } = get();
    if (selectedPromptRecordIds.length === 0) {
      set({ error: "Select at least one prompt" });
      return;
    }
    if (activeProjects.length === 0) {
      set({ error: "Select at least one project" });
      return;
    }
    set({ error: null });
    try {
      const { run_id } = await invoke<{ run_id: string }>("run_script", {
        args: {
          promptIds: selectedPromptRecordIds,
          combinedPromptRecord: null,
          activeProjects,
          timing: getTimingForRun(),
          runLabel: null,
        },
      });
      set((s) => ({
        runningRuns: [
          ...s.runningRuns,
          { runId: run_id, label: "Manual run", logLines: [], status: "running" },
        ],
        selectedRunId: run_id,
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  runWithParams: async (params) => {
    const { getTimingForRun } = get();
    set({ error: null });
    const hasCombined = params.combinedPromptRecord != null && params.combinedPromptRecord.trim() !== "";
    const hasIds = Array.isArray(params.promptIds) && params.promptIds.length > 0;
    if (!hasCombined && !hasIds) {
      set({ error: "Provide either combinedPromptRecord or promptIds" });
      return null;
    }
    try {
      const { run_id } = await invoke<{ run_id: string }>("run_script", {
        args: {
          promptIds: hasIds ? params.promptIds : [],
          combinedPromptRecord: hasCombined ? params.combinedPromptRecord : null,
          activeProjects: params.activeProjects,
          timing: getTimingForRun(),
          runLabel: params.runLabel,
        },
      });
      set((s) => ({
        runningRuns: [
          ...s.runningRuns,
          {
            runId: run_id,
            label: params.runLabel ?? "Run",
            logLines: [],
            status: "running",
          },
        ],
        selectedRunId: run_id,
      }));
      return run_id;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  },

  addFeatureToQueue: (feature) =>
    set((s) => {
      if (s.featureQueue.some((f) => f.id === feature.id)) return s;
      return {
        featureQueue: [
          ...s.featureQueue,
          {
            id: feature.id,
            title: feature.title,
            prompt_ids: feature.prompt_ids,
            project_paths: feature.project_paths,
          },
        ],
      };
    }),

  removeFeatureFromQueue: (id) =>
    set((s) => ({
      featureQueue: s.featureQueue.filter((f) => f.id !== id),
      queueRunInfoId:
        s.queueRunInfoId != null && s.featureQueue[0]?.id === id
          ? null
          : s.queueRunInfoId,
    })),

  clearFeatureQueue: () => set({ featureQueue: [], queueRunInfoId: null }),

  runFeatureQueue: async (activeProjectsFallback) => {
    const s = get();
    if (s.featureQueue.length === 0) return;
    if (s.runningRuns.some((r) => r.status === "running")) {
      set({ error: "A run is already in progress" });
      return;
    }
    const first = s.featureQueue[0];
    const projectsToUse =
      first.project_paths.length > 0 ? first.project_paths : activeProjectsFallback;
    if (projectsToUse.length === 0) {
      set({ error: "Select at least one project (or set projects on the feature)" });
      return;
    }
    if (first.prompt_ids.length === 0) {
      set({ error: "First feature in queue has no prompts" });
      return;
    }
    set({ error: null });
    const runId = await get().runWithParams({
      promptIds: first.prompt_ids,
      activeProjects: projectsToUse,
      runLabel: first.title,
    });
    if (runId != null) set({ queueRunInfoId: runId });
  },

  runNextInQueue: (exitedRunId) => {
    const s = get();
    if (s.queueRunInfoId !== exitedRunId) return;
    set({ queueRunInfoId: null });
    const rest = s.featureQueue.slice(1);
    set({ featureQueue: rest });
    if (rest.length === 0) return;
    const next = rest[0];
    const projectsToUse =
      next.project_paths.length > 0 ? next.project_paths : s.activeProjects;
    if (projectsToUse.length === 0 || next.prompt_ids.length === 0) return;
    get()
      .runWithParams({
        promptIds: next.prompt_ids,
        activeProjects: projectsToUse,
        runLabel: next.title,
      })
      .then((runId) => {
        if (runId != null) set({ queueRunInfoId: runId });
      });
  },

  stopScript: async () => {
    try {
      await invoke("stop_script");
      set((s) => ({
        runningRuns: s.runningRuns.map((r) =>
          r.status === "running" ? { ...r, status: "done" as const } : r
        ),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  stopRun: async (runId) => {
    try {
      await invoke("stop_run", { runId });
      set((s) => ({
        runningRuns: s.runningRuns.map((r) =>
          r.runId === runId ? { ...r, status: "done" as const } : r
        ),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  setIsTauriEnv: (v) =>
    set((s) => ({
      isTauriEnv: typeof v === "function" ? v(s.isTauriEnv) : v,
    })),
  setLoading: (v) =>
    set((s) => ({ loading: typeof v === "function" ? v(s.loading) : v })),
  setAllProjects: (v) => set({ allProjects: v }),
  setActiveProjectsSync: (v) => set({ activeProjects: v }),
  setPromptRecords: (v) => set({ prompts: v }),
}));

/** Hook with same API as legacy useRunState from context. Use anywhere run state is needed. */
export function useRunState() {
  return useRunStore(
    useShallow((s) => ({
      isTauriEnv: s.isTauriEnv,
      loading: s.loading,
      error: s.error,
      dataWarning: s.dataWarning,
      setError: s.setError,
      allProjects: s.allProjects,
      activeProjects: s.activeProjects,
      setActiveProjects: s.setActiveProjects,
      toggleProject: s.toggleProject,
      saveActiveProjects: s.saveActiveProjects,
      prompts: s.prompts,
      selectedPromptRecordIds: s.selectedPromptRecordIds,
      setSelectedPromptRecordIds: s.setSelectedPromptRecordIds,
      timing: s.timing,
      setTiming: s.setTiming,
      runningRuns: s.runningRuns,
      setRunInfos: s.setRunInfos,
      selectedRunId: s.selectedRunId,
      setSelectedRunId: s.setSelectedRunId,
      featureQueue: s.featureQueue,
      queueRunInfoId: s.queueRunInfoId,
      addFeatureToQueue: s.addFeatureToQueue,
      removeFeatureFromQueue: s.removeFeatureFromQueue,
      clearFeatureQueue: s.clearFeatureQueue,
      runFeatureQueue: s.runFeatureQueue,
      runNextInQueue: s.runNextInQueue,
      refreshData: s.refreshData,
      runScript: s.runScript,
      runWithParams: s.runWithParams,
      stopScript: s.stopScript,
      stopRun: s.stopRun,
      getTimingForRun: s.getTimingForRun,
    }))
  );
}

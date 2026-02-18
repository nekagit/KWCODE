"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { invoke, isTauri } from "@/lib/tauri";
import { isImplementAllRun } from "@/lib/run-helpers";
import { getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import {
  DEFAULT_TIMING,
  type Timing,
  type PromptRecordItem,
  type RunInfo,
  type RunMeta,
  type TerminalOutputHistoryEntry,
  type NightShiftCirclePhase,
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
  /** Queue of temp-ticket jobs (fast dev, debug) waiting for a free terminal slot. */
  pendingTempTicketQueue: PendingTempTicketJob[];

  /** Archived Implement All logs (saved when user clicks Archive). */
  archivedImplementAllLogs: Array<{ id: string; timestamp: string; logLines: string[] }>;
  /** Run ID currently shown in the floating terminal dialog (Setup prompt runs). */
  floatingTerminalRunId: string | null;
  /** Whether the floating terminal is minimized (pill); false = expanded. */
  floatingTerminalMinimized: boolean;
  /** History of agent terminal outputs (completed runs). Newest first; capped at TERMINAL_HISTORY_MAX. */
  terminalOutputHistory: TerminalOutputHistoryEntry[];
  /** Night shift: 3 agents run same prompt in a loop until stopped. */
  nightShiftActive: boolean;
  /** Called when a night-shift run exits to enqueue one more job (replenish). Receives slot and optionally the exiting run (for Circle phase logic). */
  nightShiftReplenishCallback: ((slot: 1 | 2 | 3, exitingRun?: RunInfo | null) => Promise<void>) | null;
  /** Night shift Circle: mode on/off, current phase, completed count in current phase (0–3). */
  nightShiftCircleMode: boolean;
  nightShiftCirclePhase: NightShiftCirclePhase | null;
  nightShiftCircleCompletedInPhase: number;
  /** Timestamp (ms) when refreshData last completed successfully; null before first refresh. */
  lastRefreshedAt: number | null;
}

export interface RunActions {
  setError: (e: string | null) => void;
  setActiveProjects: (p: string[] | ((prev: string[]) => string[])) => void;
  toggleProject: (path: string) => void;
  saveActiveProjects: () => Promise<void>;
  setSelectedPromptRecordIds: (ids: number[] | ((prev: number[]) => number[])) => void;
  setTiming: React.Dispatch<React.SetStateAction<Timing>>;
  setRunInfos: React.Dispatch<React.SetStateAction<RunInfo[]>>;
  /** Set localUrl on a run (first detected localhost URL from script output). */
  setLocalUrl: (runId: string, localUrl: string) => void;
  setSelectedRunId: (id: string | null) => void;
  refreshData: () => Promise<void>;
  runScript: () => Promise<void>;
  runWithParams: (params: {
    promptIds?: number[];
    combinedPromptRecord?: string;
    activeProjects: string[];
    runLabel: string | null;
  }) => Promise<string | null>;

  stopScript: () => Promise<void>;
  stopRun: (runId: string) => Promise<void>;
  /** Called when a run exits (e.g. from Tauri); no-op if queue not used. */
  runNextInQueue: (runId: string) => void;
  /** Clear all queued temp-ticket jobs (fast dev, debug, etc.). */
  clearPendingTempTicketQueue: () => void;
  runImplementAll: (projectPath: string, promptContent?: string) => Promise<string | null>;
  /** Run one Implement All run per slot (1–3) with distinct prompt and label; used when tickets are in queue. */
  runImplementAllForTickets: (
    projectPath: string,
    slots: Array<{ slot: 1 | 2 | 3; promptContent: string; label: string; meta?: RunMeta }>
  ) => Promise<string | null>;
  /** Run a single setup prompt (design/ideas/etc.) and open it in the floating terminal. */
  runSetupPrompt: (projectPath: string, promptContent: string, label: string) => Promise<string | null>;
  /** Run a temporary ticket (single prompt) on the next free slot (1–3) with optional meta for post-run actions. */
  runTempTicket: (
    projectPath: string,
    promptContent: string,
    label: string,
    meta?: RunMeta
  ) => Promise<string | null>;
  /** Run an npm script in the project directory (e.g. npm run dev). Tauri only. */
  runNpmScript: (projectPath: string, scriptName: string) => Promise<string | null>;
  /** Run an npm script in the system Terminal (macOS only). Returns true if opened. */
  runNpmScriptInExternalTerminal: (projectPath: string, scriptName: string) => Promise<boolean>;
  /** Open Terminal and run npm run build:desktop in current dir (macOS; use when running via tauri dev). */
  runBuildDesktop: () => Promise<boolean>;
  setFloatingTerminalRunId: (id: string | null) => void;
  setFloatingTerminalMinimized: (minimized: boolean) => void;
  clearFloatingTerminal: () => void;
  /** Remove a run from the dock (runningRuns); clears floating terminal if it was that run. */
  removeRunFromDock: (runId: string) => void;
  stopAllImplementAll: () => Promise<void>;
  clearImplementAllLogs: () => void;
  archiveImplementAllLogs: () => void;
  /** Append a completed run's output to terminal output history (called from hydration on script-exited). */
  addTerminalOutputToHistory: (entry: Omit<TerminalOutputHistoryEntry, "id">) => void;
  /** Remove a single run from terminal output history by id. */
  removeTerminalOutputFromHistory: (id: string) => void;
  clearTerminalOutputHistory: () => void;
  getTimingForRun: () => Record<string, number>;
  // Hydration/setters used by RunStoreHydration
  setIsTauriEnv: (v: boolean | null | ((prev: boolean | null) => boolean | null)) => void;
  setLoading: (v: boolean | ((prev: boolean) => boolean)) => void;
  setAllProjects: (v: string[]) => void;
  setActiveProjectsSync: (v: string[]) => void;
  setPromptRecords: (v: PromptRecordItem[]) => void;
  addPrompt: (title: string, content: string) => void;
  setNightShiftActive: (active: boolean) => void;
  setNightShiftReplenishCallback: (cb: ((slot: 1 | 2 | 3, exitingRun?: RunInfo | null) => Promise<void>) | null) => void;
  setNightShiftCircleState: (mode: boolean, phase: NightShiftCirclePhase | null, completed: number) => void;
  incrementNightShiftCircleCompleted: () => void;
}

export type RunStore = RunState & RunActions;

/** Registry for one-time handlers when a temp ticket run completes (key = onComplete + ':' + (payload.projectId ?? payload.requestId ?? runId)). */
const runCompleteHandlers = new Map<string, (stdout: string) => void>();

export function registerRunCompleteHandler(key: string, handler: (stdout: string) => void): void {
  runCompleteHandlers.set(key, handler);
}

export function takeRunCompleteHandler(key: string): ((stdout: string) => void) | undefined {
  const h = runCompleteHandlers.get(key);
  runCompleteHandlers.delete(key);
  return h;
}

/** Pending temp-ticket job (fast dev, debug, etc.) waiting for a free slot. */
export interface PendingTempTicketJob {
  projectPath: string;
  promptContent: string;
  label: string;
  meta?: RunMeta;
}

/** Next free terminal slot (1–3) or null if all occupied. Used so we only start when a slot is free. */
function getNextFreeSlotOrNull(runningRuns: RunInfo[]): 1 | 2 | 3 | null {
  const occupied = new Set<1 | 2 | 3>();
  for (const r of runningRuns) {
    if (r.status !== "running") continue;
    if (!isImplementAllRun(r)) continue;
    if (r.slot === 1 || r.slot === 2 || r.slot === 3) occupied.add(r.slot);
  }
  for (const slot of [1, 2, 3] as const) {
    if (!occupied.has(slot)) return slot;
  }
  return null;
}

/** Start one pending temp-ticket job if queue non-empty and a slot is free. Called after enqueue and on run exit. */
function processTempTicketQueue(
  get: () => RunStore,
  set: (partial: RunState | ((s: RunState) => RunState | Partial<RunState>)) => void
): void {
  const state = get();
  if (state.pendingTempTicketQueue.length === 0) return;
  const slot = getNextFreeSlotOrNull(state.runningRuns);
  if (slot === null) return;
  const job = state.pendingTempTicketQueue[0];
  set((s) => ({ pendingTempTicketQueue: s.pendingTempTicketQueue.slice(1) }));

  const tempId = `pending-${Date.now()}-${slot}-${Math.random().toString(36).slice(2, 9)}`;
  const placeholder: RunInfo = {
    runId: tempId,
    label: job.label,
    logLines: [],
    status: "running",
    startedAt: Date.now(),
    slot,
    meta: job.meta ?? undefined,
  };
  set((s) => ({
    runningRuns: [...s.runningRuns, placeholder],
    selectedRunId: tempId,
  }));

  (async () => {
    try {
      const { run_id } = await invoke<{ run_id: string }>("run_run_terminal_agent", {
        projectPath: job.projectPath,
        promptContent: job.promptContent,
        label: job.label,
      });
      set((s) => ({
        runningRuns: s.runningRuns.map((r) =>
          r.runId === tempId ? { ...r, runId: run_id } : r
        ),
        selectedRunId: run_id,
      }));
      processTempTicketQueue(get, set);
    } catch (e) {
      set((s) => ({
        ...s,
        error: e instanceof Error ? e.message : String(e),
        runningRuns: s.runningRuns.filter((r) => r.runId !== tempId),
        pendingTempTicketQueue: [job, ...s.pendingTempTicketQueue],
      }));
      toast.error("Failed to start queued agent.");
      processTempTicketQueue(get, set);
    }
  })();
}

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
  pendingTempTicketQueue: [],

  archivedImplementAllLogs: [],
  floatingTerminalRunId: null,
  floatingTerminalMinimized: false,
  terminalOutputHistory: [],
  nightShiftActive: false,
  nightShiftReplenishCallback: null,
  nightShiftCircleMode: false,
  nightShiftCirclePhase: null,
  nightShiftCircleCompletedInPhase: 0,
  lastRefreshedAt: null,
};

const TERMINAL_HISTORY_MAX = 100;

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
      if (isTauri) {
        invoke("frontend_debug_log", { location: "run-store.ts:refreshData", message: "run-store: about to invoke list_february_folders, get_active_projects, get_prompts", data: {} }).catch(() => {});
        const [all, active, promptList] = await Promise.all([
          invoke<string[]>("list_february_folders"),
          invoke<string[]>("get_active_projects"),
          invoke<PromptRecordItem[]>("get_prompts"),
        ]);
        set({ allProjects: all ?? [], activeProjects: active ?? [], prompts: promptList ?? [], lastRefreshedAt: Date.now() });
      } else {
        const [dataRes, promptsRes] = await Promise.all([
          fetch("/api/data"),
          fetch("/api/data/prompts"),
        ]);
        if (!dataRes.ok) throw new Error(await getApiErrorMessage(dataRes));
        const data = await dataRes.json();
        const warning =
          typeof (data as { _warning?: string })._warning === "string"
            ? (data as { _warning: string })._warning
            : null;
        let prompts: PromptRecordItem[] = Array.isArray(data.prompts) ? data.prompts : [];
        if (promptsRes.ok) {
          try {
            const promptsList = await promptsRes.json();
            if (Array.isArray(promptsList)) {
              prompts = promptsList.map((p: { id: number; title: string; content?: string }) => ({
                id: p.id,
                title: p.title ?? "",
                content: p.content ?? "",
              }));
            }
          } catch {
            // keep prompts from /api/data if prompts fetch fails
          }
        }
        set({
          allProjects: Array.isArray(data.allProjects) ? data.allProjects : [],
          activeProjects: Array.isArray(data.activeProjects) ? data.activeProjects : [],
          prompts,
          dataWarning: warning ?? null,
          lastRefreshedAt: Date.now(),
        });
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      // #region agent log
      fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "run-store.ts:refreshData",
          message: "refreshData error (list_february_folders / get_active_projects / get_prompts)",
          data: { error: errMsg },
          timestamp: Date.now(),
          hypothesisId: "B",
        }),
      }).catch(() => {});
      // #endregion
      set({ error: errMsg });
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



  stopScript: async () => {
    try {
      await invoke("stop_script");
      const now = Date.now();
      set((s) => ({
        runningRuns: s.runningRuns.map((r) =>
          r.status === "running"
            ? { ...r, status: "done" as const, doneAt: now }
            : r
        ),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  runImplementAll: async (projectPath, promptContent) => {
    const { setError } = get();
    const path = projectPath?.trim();
    if (!path) {
      set({ error: "Project path is required for Implement All" });
      return null;
    }
    set({ error: null });
    const runIds: string[] = [];
    try {
      for (const slot of [1, 2, 3] as const) {
        const { run_id } = await invoke<{ run_id: string }>("run_implement_all", {
          projectPath: path,
          slot,
          promptContent: promptContent ?? null,
        });
        runIds.push(run_id);
        const label = `Implement All (Terminal ${slot})`;
        set((s) => ({
          runningRuns: [
            ...s.runningRuns,
            {
              runId: run_id,
              label,
              logLines: [],
              status: "running" as const,
              startedAt: Date.now(),
              slot,
            },
          ],
          selectedRunId: run_id,
        }));
        if (slot < 3) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
      return runIds[0] ?? null;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  },

  runImplementAllForTickets: async (projectPath, slots) => {
    const { setError } = get();
    const path = projectPath?.trim();
    if (!path) {
      set({ error: "Project path is required for Implement All" });
      return null;
    }
    if (!slots.length) {
      set({ error: "At least one slot is required" });
      return null;
    }
    set({ error: null });
    let firstRunId: string | null = null;
    try {
      for (let i = 0; i < slots.length; i++) {
        const { slot, promptContent, label, meta } = slots[i];
        const { run_id } = await invoke<{ run_id: string }>("run_implement_all", {
          projectPath: path,
          slot,
          promptContent: promptContent.trim() || null,
        });
        if (firstRunId == null) firstRunId = run_id;
        set((s) => ({
          runningRuns: [
            ...s.runningRuns,
            {
              runId: run_id,
              label,
              logLines: [],
              status: "running" as const,
              startedAt: Date.now(),
              slot,
              ...(meta && { meta }),
            },
          ],
          selectedRunId: run_id,
        }));
        if (i < slots.length - 1) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
      return firstRunId;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  },

  runSetupPrompt: async (projectPath, promptContent, label) => {
    const path = projectPath?.trim();
    if (!path) {
      set({ error: "Project path is required" });
      return null;
    }
    if (!promptContent?.trim()) {
      set({ error: "Prompt content is empty" });
      return null;
    }
    set({ error: null });
    try {
      const { run_id } = await invoke<{ run_id: string }>("run_run_terminal_agent", {
        projectPath: path,
        promptContent: promptContent.trim(),
        label: `Setup Prompt: ${label}`,
      });
      const runLabel = `Setup Prompt: ${label}`;
      set((s) => ({
        runningRuns: [
          ...s.runningRuns,
          {
            runId: run_id,
            label: runLabel,
            logLines: [],
            status: "running" as const,
            startedAt: Date.now(),
          },
        ],
        selectedRunId: run_id,
        floatingTerminalRunId: run_id,
      }));
      return run_id;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  },

  runTempTicket: async (projectPath, promptContent, label, meta): Promise<string | null> => {
    const path = projectPath?.trim();
    if (!path) {
      set({ error: "Project path is required" });
      return null;
    }
    if (!promptContent?.trim()) {
      set({ error: "Prompt content is empty" });
      return null;
    }
    set({ error: null });
    const job: PendingTempTicketJob = {
      projectPath: path,
      promptContent: promptContent.trim(),
      label,
      meta,
    };
    set((s) => ({
      pendingTempTicketQueue: [...s.pendingTempTicketQueue, job],
    }));
    processTempTicketQueue(get, set);
    return "queued";
  },

  runNextInQueue: () => {
    processTempTicketQueue(get, set);
  },

  setLocalUrl: (runId, localUrl) => {
    set((s) => ({
      runningRuns: s.runningRuns.map((r) =>
        r.runId === runId && !r.localUrl ? { ...r, localUrl } : r
      ),
    }));
  },

  runNpmScript: async (projectPath, scriptName) => {
    const path = projectPath?.trim();
    if (!path) {
      set({ error: "Project path is required" });
      return null;
    }
    const name = scriptName?.trim();
    if (!name) {
      set({ error: "Script name is required" });
      return null;
    }
    set({ error: null });
    try {
      const { run_id } = await invoke<{ run_id: string }>("run_npm_script", {
        projectPath: path,
        scriptName: name,
      });
      const label = `npm run ${name}`;
      set((s) => ({
        runningRuns: [
          ...s.runningRuns,
          {
            runId: run_id,
            label,
            logLines: [],
            status: "running" as const,
            startedAt: Date.now(),
          },
        ],
        selectedRunId: run_id,
        floatingTerminalRunId: run_id,
        floatingTerminalMinimized: false,
      }));
      return run_id;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  },

  runNpmScriptInExternalTerminal: async (projectPath, scriptName) => {
    const path = projectPath?.trim();
    const name = scriptName?.trim();
    if (!path || !name) return false;
    set({ error: null });
    try {
      await invoke("run_npm_script_in_external_terminal", {
        projectPath: path,
        scriptName: name,
      });
      return true;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return false;
    }
  },

  runBuildDesktop: async () => {
    set({ error: null });
    try {
      await invoke("run_build_desktop");
      return true;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return false;
    }
  },

  setFloatingTerminalRunId: (id) => set({ floatingTerminalRunId: id }),

  setFloatingTerminalMinimized: (minimized) => set({ floatingTerminalMinimized: minimized }),

  clearFloatingTerminal: () => set({ floatingTerminalRunId: null }),

  removeRunFromDock: (runId) =>
    set((s) => ({
      runningRuns: s.runningRuns.filter((r) => r.runId !== runId),
      floatingTerminalRunId: s.floatingTerminalRunId === runId ? null : s.floatingTerminalRunId,
    })),

  stopRun: async (runId) => {
    try {
      await invoke("stop_run", { runId });
      set((s) => ({
        runningRuns: s.runningRuns.map((r) =>
          r.runId === runId
            ? { ...r, status: "done" as const, doneAt: Date.now() }
            : r
        ),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  stopAllImplementAll: async () => {
    const { runningRuns, stopRun } = get();
    const implementAllRunning = runningRuns.filter(
      (r) => isImplementAllRun(r) && r.status === "running"
    );
    for (const r of implementAllRunning) {
      await stopRun(r.runId);
    }
  },

  clearImplementAllLogs: () => {
    set((s) => ({
      runningRuns: s.runningRuns.map((r) =>
        isImplementAllRun(r) ? { ...r, logLines: [] } : r
      ),
    }));
  },

  archiveImplementAllLogs: () => {
    set((s) => {
      const implementAllRuns = s.runningRuns.filter((r) => isImplementAllRun(r));
      const allLogLines = implementAllRuns.flatMap((r) =>
        r.logLines.length ? [`--- ${r.label} (${r.runId}) ---`, ...r.logLines] : []
      );
      if (allLogLines.length === 0) return s;
      const entry = {
        id: `archived-${Date.now()}`,
        timestamp: new Date().toISOString(),
        logLines: allLogLines,
      };
      return { archivedImplementAllLogs: [...s.archivedImplementAllLogs, entry] };
    });
    toast.success("Logs archived.");
  },

  addTerminalOutputToHistory: (entry) => {
    set((s) => {
      const id = `history-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const list = [{ ...entry, id }, ...s.terminalOutputHistory].slice(0, TERMINAL_HISTORY_MAX);
      return { terminalOutputHistory: list };
    });
  },

  removeTerminalOutputFromHistory: (id) =>
    set((s) => ({
      terminalOutputHistory: s.terminalOutputHistory.filter((e) => e.id !== id),
    })),

  clearTerminalOutputHistory: () => set({ terminalOutputHistory: [] }),

  clearPendingTempTicketQueue: () => set({ pendingTempTicketQueue: [] }),

  setIsTauriEnv: (v) =>
    set((s) => ({
      isTauriEnv: typeof v === "function" ? v(s.isTauriEnv) : v,
    })),
  setLoading: (v) =>
    set((s) => ({ loading: typeof v === "function" ? v(s.loading) : v })),
  setAllProjects: (v) => set({ allProjects: v }),
  setActiveProjectsSync: (v) => set({ activeProjects: v }),
  setPromptRecords: (v) => set({ prompts: v }),

  addPrompt: (title, content) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set((s) => {
      const nextId =
        s.prompts.length === 0
          ? 1
          : Math.max(...s.prompts.map((p) => p.id), 0) + 1;
      return {
        prompts: [
          ...s.prompts,
          { id: nextId, title: trimmed, content: content || "" },
        ],
      };
    });
  },

  setNightShiftActive: (active) => set({ nightShiftActive: active }),
  setNightShiftReplenishCallback: (cb) => set({ nightShiftReplenishCallback: cb }),
  setNightShiftCircleState: (mode, phase, completed) =>
    set({
      nightShiftCircleMode: mode,
      nightShiftCirclePhase: phase,
      nightShiftCircleCompletedInPhase: completed,
    }),
  incrementNightShiftCircleCompleted: () =>
    set((s) => ({ nightShiftCircleCompletedInPhase: s.nightShiftCircleCompletedInPhase + 1 })),
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

      refreshData: s.refreshData,
      lastRefreshedAt: s.lastRefreshedAt,
      runScript: s.runScript,
      runWithParams: s.runWithParams,
      stopScript: s.stopScript,
      stopRun: s.stopRun,
      runNextInQueue: s.runNextInQueue,
      clearPendingTempTicketQueue: s.clearPendingTempTicketQueue,
      runImplementAll: s.runImplementAll,
      stopAllImplementAll: s.stopAllImplementAll,
      clearImplementAllLogs: s.clearImplementAllLogs,
      archiveImplementAllLogs: s.archiveImplementAllLogs,
      archivedImplementAllLogs: s.archivedImplementAllLogs,
      terminalOutputHistory: s.terminalOutputHistory,
      addTerminalOutputToHistory: s.addTerminalOutputToHistory,
      removeTerminalOutputFromHistory: s.removeTerminalOutputFromHistory,
      clearTerminalOutputHistory: s.clearTerminalOutputHistory,
      getTimingForRun: s.getTimingForRun,
      runSetupPrompt: s.runSetupPrompt,
      runTempTicket: s.runTempTicket,
      runNpmScript: s.runNpmScript,
      runBuildDesktop: s.runBuildDesktop,
      setLocalUrl: s.setLocalUrl,
      floatingTerminalRunId: s.floatingTerminalRunId,
      setFloatingTerminalRunId: s.setFloatingTerminalRunId,
      floatingTerminalMinimized: s.floatingTerminalMinimized,
      setFloatingTerminalMinimized: s.setFloatingTerminalMinimized,
      clearFloatingTerminal: s.clearFloatingTerminal,
      removeRunFromDock: s.removeRunFromDock,
      nightShiftActive: s.nightShiftActive,
      setNightShiftActive: s.setNightShiftActive,
      setNightShiftReplenishCallback: s.setNightShiftReplenishCallback,
    }))
  );
}

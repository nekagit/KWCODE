"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { invoke, listen, isTauri } from "@/lib/tauri";
import {
  DEFAULT_TIMING,
  type Timing,
  type PromptItem,
  type RunInfo,
} from "@/types/run";

interface RunStateValue {
  isTauriEnv: boolean | null;
  loading: boolean;
  error: string | null;
  setError: (e: string | null) => void;
  allProjects: string[];
  activeProjects: string[];
  setActiveProjects: (p: string[] | ((prev: string[]) => string[])) => void;
  toggleProject: (path: string) => void;
  saveActiveProjects: () => Promise<void>;
  prompts: PromptItem[];
  selectedPromptIds: number[];
  setSelectedPromptIds: (ids: number[] | ((prev: number[]) => number[])) => void;
  timing: Timing;
  setTiming: React.Dispatch<React.SetStateAction<Timing>>;
  runningRuns: RunInfo[];
  setRunningRuns: React.Dispatch<React.SetStateAction<RunInfo[]>>;
  selectedRunId: string | null;
  setSelectedRunId: (id: string | null) => void;
  runScript: () => Promise<void>;
  runWithParams: (params: {
    promptIds: number[];
    activeProjects: string[];
    runLabel: string | null;
  }) => Promise<void>;
  stopScript: () => Promise<void>;
  stopRun: (runId: string) => Promise<void>;
  getTimingForRun: () => Record<string, number>;
}

const RunStateContext = createContext<RunStateValue | null>(null);

export function useRunState(): RunStateValue {
  const ctx = useContext(RunStateContext);
  if (!ctx) throw new Error("useRunState must be used within RunStateProvider");
  return ctx;
}

export function RunStateProvider({ children }: { children: ReactNode }) {
  const [isTauriEnv, setIsTauriEnv] = useState<boolean | null>(null);
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [activeProjects, setActiveProjects] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const [timing, setTiming] = useState<Timing>(DEFAULT_TIMING);
  const [runningRuns, setRunningRuns] = useState<RunInfo[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const unlistenLogRef = useRef<(() => void) | null>(null);
  const unlistenExitedRef = useRef<(() => void) | null>(null);

  const loadData = useCallback(async () => {
    if (!isTauri()) return;
    setError(null);
    try {
      const [all, active, promptList] = await Promise.all([
        invoke<string[]>("get_all_projects").catch(() => []),
        invoke<string[]>("get_active_projects").catch(() => []),
        invoke<PromptItem[]>("get_prompts").catch(() => []),
      ]);
      setAllProjects(all);
      setActiveProjects(active);
      setPrompts(promptList);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const check = () => setIsTauriEnv(isTauri());
    check();
    const t = setTimeout(check, 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isTauriEnv === true) loadData();
  }, [isTauriEnv, loadData]);

  useEffect(() => {
    if (isTauriEnv !== true) return;
    let cancelled = false;
    listen<{ run_id: string; line: string }>("script-log", (payload) => {
      setRunningRuns((prev) =>
        prev.map((r) =>
          r.runId === payload.run_id
            ? { ...r, logLines: [...r.logLines, payload.line] }
            : r
        )
      );
    }).then((fn) => {
      if (!cancelled) unlistenLogRef.current = fn;
    });
    return () => {
      cancelled = true;
      unlistenLogRef.current?.();
      unlistenLogRef.current = null;
    };
  }, [isTauriEnv]);

  useEffect(() => {
    if (isTauriEnv !== true) return;
    let cancelled = false;
    listen<{ run_id: string }>("script-exited", (payload) => {
      setRunningRuns((prev) =>
        prev.map((r) =>
          r.runId === payload.run_id ? { ...r, status: "done" as const } : r
        )
      );
    }).then((fn) => {
      if (!cancelled) unlistenExitedRef.current = fn;
    });
    return () => {
      cancelled = true;
      unlistenExitedRef.current?.();
      unlistenExitedRef.current = null;
    };
  }, [isTauriEnv]);

  const toggleProject = useCallback((path: string) => {
    setActiveProjects((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }, []);

  const saveActiveProjects = useCallback(async () => {
    try {
      await invoke("save_active_projects", { projects: activeProjects });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [activeProjects]);

  const getTimingForRun = useCallback(
    () => ({
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
    }),
    [timing]
  );

  const runScript = useCallback(async () => {
    if (selectedPromptIds.length === 0) {
      setError("Select at least one prompt");
      return;
    }
    if (activeProjects.length === 0) {
      setError("Select at least one project");
      return;
    }
    setError(null);
    try {
      const { run_id } = await invoke<{ run_id: string }>("run_script", {
        promptIds: selectedPromptIds,
        activeProjects,
        timing: getTimingForRun(),
        runLabel: null,
      });
      setRunningRuns((prev) => [
        ...prev,
        { runId: run_id, label: "Manual run", logLines: [], status: "running" },
      ]);
      setSelectedRunId(run_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [selectedPromptIds, activeProjects, getTimingForRun]);

  const runWithParams = useCallback(
    async (params: {
      promptIds: number[];
      activeProjects: string[];
      runLabel: string | null;
    }) => {
      setError(null);
      try {
        const { run_id } = await invoke<{ run_id: string }>("run_script", {
          promptIds: params.promptIds,
          activeProjects: params.activeProjects,
          timing: getTimingForRun(),
          runLabel: params.runLabel,
        });
        setRunningRuns((prev) => [
          ...prev,
          {
            runId: run_id,
            label: params.runLabel ?? "Run",
            logLines: [],
            status: "running",
          },
        ]);
        setSelectedRunId(run_id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [getTimingForRun]
  );

  const stopScript = useCallback(async () => {
    try {
      await invoke("stop_script");
      setRunningRuns((prev) =>
        prev.map((r) => (r.status === "running" ? { ...r, status: "done" as const } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const stopRun = useCallback(async (runId: string) => {
    try {
      await invoke("stop_run", { run_id: runId });
      setRunningRuns((prev) =>
        prev.map((r) =>
          r.runId === runId ? { ...r, status: "done" as const } : r
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const value: RunStateValue = {
    isTauriEnv,
    loading,
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
    timing,
    setTiming,
    runningRuns,
    setRunningRuns,
    selectedRunId,
    setSelectedRunId,
    runScript,
    runWithParams,
    stopScript,
    stopRun,
    getTimingForRun,
  };

  return (
    <RunStateContext.Provider value={value}>{children}</RunStateContext.Provider>
  );
}

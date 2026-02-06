"use client";

import { useEffect, useRef } from "react";
import { listen, isTauri } from "@/lib/tauri";
import { useRunStore } from "./run-store";

/**
 * Runs side effects that hydrate the run store: Tauri env detection,
 * initial data load, and Tauri event listeners. Mount once in layout.
 */
export function RunStoreHydration() {
  const refreshData = useRunStore((s) => s.refreshData);
  const isTauriEnv = useRunStore((s) => s.isTauriEnv);
  const setIsTauriEnv = useRunStore((s) => s.setIsTauriEnv);
  const setLoading = useRunStore((s) => s.setLoading);
  const setRunningRuns = useRunStore((s) => s.setRunningRuns);
  const unlistenLogRef = useRef<(() => void) | null>(null);
  const unlistenExitedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const check = () => setIsTauriEnv(isTauri());
    check();
    const t1 = setTimeout(check, 150);
    const t2 = setTimeout(() => {
      setIsTauriEnv((prev) => (prev === null ? false : prev));
    }, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [setIsTauriEnv]);

  useEffect(() => {
    if (isTauriEnv === false) setLoading(false);
  }, [isTauriEnv, setLoading]);

  useEffect(() => {
    if (isTauriEnv !== null) refreshData();
  }, [isTauriEnv, refreshData]);

  // Safety: stop blocking the app if initial data load hangs (browser or Tauri).
  useEffect(() => {
    if (isTauriEnv === null) return;
    const t = setTimeout(() => setLoading((prev) => (prev ? false : prev)), 10_000);
    return () => clearTimeout(t);
  }, [isTauriEnv, setLoading]);

  useEffect(() => {
    if (isTauriEnv !== true) return;
    let cancelled = false;
    listen<{ run_id: string; line: string }>("script-log", (payload) => {
      useRunStore.getState().setRunningRuns((prev) =>
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
      const store = useRunStore.getState();
      store.setRunningRuns((prev) =>
        prev.map((r) =>
          r.runId === payload.run_id ? { ...r, status: "done" as const } : r
        )
      );
      store.runNextInQueue(payload.run_id);
    }).then((fn) => {
      if (!cancelled) unlistenExitedRef.current = fn;
    });
    return () => {
      cancelled = true;
      unlistenExitedRef.current?.();
      unlistenExitedRef.current = null;
    };
  }, [isTauriEnv]);

  return null;
}

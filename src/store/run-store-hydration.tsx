"use client";

import { useEffect, useRef } from "react";
import { listen, isTauri } from "@/lib/tauri";
import { writeProjectFile } from "@/lib/api-projects";
import { useRunStore, takeRunCompleteHandler } from "./run-store";

/**
 * Runs side effects that hydrate the run store: Tauri env detection,
 * initial data load, and Tauri event listeners. Mount once in layout.
 */
export function RunStoreHydration() {
  const refreshData = useRunStore((s) => s.refreshData);
  const isTauriEnv = useRunStore((s) => s.isTauriEnv);
  const setIsTauriEnv = useRunStore((s) => s.setIsTauriEnv);
  const setLoading = useRunStore((s) => s.setLoading);
  const setRunInfos = useRunStore((s) => s.setRunInfos);
  const unlistenLogRef = useRef<(() => void) | null>(null);
  const unlistenExitedRef = useRef<(() => void) | null>(null);

  // Resolve Tauri vs browser quickly so refreshData runs without a long delay (was 2000ms, now 400ms).
  useEffect(() => {
    const check = () => setIsTauriEnv(isTauri);
    check();
    const t1 = setTimeout(check, 150);
    const t2 = setTimeout(() => {
      setIsTauriEnv((prev) => (prev === null ? false : prev));
    }, 400);
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

  useEffect(() => {
    if (isTauriEnv !== true) return;
    let cancelled = false;
    listen<{ run_id: string; line: string }>("script-log", (event) => {
      const { run_id, line } = event.payload;
      setRunInfos((prev) =>
        prev.map((r) =>
          r.runId === run_id ? { ...r, logLines: [...r.logLines, line] } : r
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
    listen<{ run_id: string }>("script-exited", (event) => {
      const { run_id } = event.payload;
      const store = useRunStore.getState();
      const run = store.runningRuns.find((r) => r.runId === run_id);
      const now = Date.now();
      store.setRunInfos((prev) =>
        prev.map((r) =>
          r.runId === run_id
            ? { ...r, status: "done" as const, doneAt: now }
            : r
        )
      );
      store.runNextInQueue(run_id);

      if (run?.meta) {
        const stdout = run.logLines.join("\n");
        if (run.meta.projectId && run.meta.outputPath) {
          const repoPath =
            typeof run.meta.payload?.repoPath === "string"
              ? run.meta.payload.repoPath
              : undefined;
          writeProjectFile(
            run.meta.projectId,
            run.meta.outputPath,
            stdout,
            repoPath
          ).catch((err) => {
            console.error("[run-exited] writeProjectFile failed:", err);
          });
        }
        if (run.meta.onComplete) {
          const key =
            run.meta.onComplete +
            ":" +
            (run.meta.payload?.projectId ?? run.meta.payload?.requestId ?? run_id);
          const handler = takeRunCompleteHandler(key);
          if (handler) {
            try {
              handler(stdout);
            } catch (err) {
              console.error("[run-exited] runComplete handler error:", err);
            }
          }
          window.dispatchEvent(
            new CustomEvent("run-complete", {
              detail: {
                runId: run_id,
                onComplete: run.meta.onComplete,
                stdout,
                meta: run.meta,
              },
            })
          );
        }
      }
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

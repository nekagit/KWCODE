"use client";

/**
 * Hydrates the run store: Tauri detection, initial data load, and event listeners.
 * Mount once in the root layout.
 */
import { useEffect, useRef, useCallback } from "react";
import { listen, invoke, isTauri } from "@/lib/tauri";
import { writeProjectFile } from "@/lib/api-projects";
import { stripTerminalArtifacts, MIN_DOCUMENT_LENGTH } from "@/lib/strip-terminal-artifacts";
import { toast } from "sonner";
import { useRunStore, takeRunCompleteHandler } from "./run-store";

/** Cleanup all queues and stop all agents. Called on app close. */
async function cleanupOnClose(): Promise<void> {
  const store = useRunStore.getState();
  store.clearPendingTempTicketQueue();
  store.setNightShiftActive(false);
  store.setNightShiftReplenishCallback(null);
  store.setNightShiftIdeaDrivenState({
    mode: false,
    idea: null,
    tickets: [],
    ticketIndex: 0,
    phase: null,
    completedInPhase: 0,
    ideasQueue: [],
  });
  if (isTauri) {
    try {
      await invoke("stop_script");
    } catch {
      // Ignore errors during cleanup
    }
  }
}

/** Match first localhost/127.0.0.1 URL in a line (e.g. from Next.js, Vite dev server output). */
const LOCALHOST_URL_RE = /https?:\/\/(?:localhost|127\.0\.0\.1)(?::(\d+))?(?:\/[^\s]*)?/i;

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
  const setLocalUrl = useRunStore((s) => s.setLocalUrl);
  const unlistenLogRef = useRef<(() => void) | null>(null);
  const unlistenExitedRef = useRef<(() => void) | null>(null);

  // Resolve Tauri vs browser quickly so refreshData runs without a long delay (was 2000ms, now 400ms).
  useEffect(() => {
    const check = () => {
      const v = isTauri;
      setIsTauriEnv(v);
      // #region agent log
      fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8a3da1" }, body: JSON.stringify({ sessionId: "8a3da1", location: "run-store-hydration.tsx", message: "isTauriEnv_check", data: { isTauri: v }, timestamp: Date.now(), hypothesisId: "H4" }) }).catch(() => {});
      // #endregion
    };
    check();
    const t1 = setTimeout(check, 150);
    const t2 = setTimeout(() => {
      setIsTauriEnv((prev) => {
        const next = prev === null ? false : prev;
        // #region agent log
        fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8a3da1" }, body: JSON.stringify({ sessionId: "8a3da1", location: "run-store-hydration.tsx", message: "isTauriEnv_final", data: { resolved: next }, timestamp: Date.now(), hypothesisId: "H4" }) }).catch(() => {});
        // #endregion
        return next;
      });
    }, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [setIsTauriEnv]);

  // Cleanup all queues and agents when app closes (beforeunload for browser, Tauri close event for desktop)
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupOnClose();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (isTauriEnv === false) setLoading(false);
  }, [isTauriEnv, setLoading]);

  useEffect(() => {
    if (isTauriEnv !== null) {
      // #region agent log
      fetch("http://127.0.0.1:7245/ingest/ba92c391-787b-4b76-842e-308edcb0507d", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8a3da1" }, body: JSON.stringify({ sessionId: "8a3da1", location: "run-store-hydration.tsx", message: "refreshData_called", data: { isTauriEnv }, timestamp: Date.now(), hypothesisId: "H2" }) }).catch(() => {});
      // #endregion
      refreshData();
    }
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
      const match = line.match(LOCALHOST_URL_RE);
      if (match) {
        const url = match[0];
        const store = useRunStore.getState();
        const run = store.runningRuns.find((r) => r.runId === run_id);
        if (run && !run.localUrl) setLocalUrl(run_id, url);
      }
    }).then((fn) => {
      if (!cancelled) unlistenLogRef.current = fn;
    });
    return () => {
      cancelled = true;
      unlistenLogRef.current?.();
        unlistenLogRef.current = null;
    };
  }, [isTauriEnv, setRunInfos, setLocalUrl]);

  useEffect(() => {
    if (isTauriEnv !== true) return;
    let cancelled = false;
    listen<{ run_id: string; exit_code?: number }>("script-exited", (event) => {
      const { run_id, exit_code } = event.payload;
      const store = useRunStore.getState();
      const run = store.runningRuns.find((r) => r.runId === run_id);
      const now = Date.now();
      store.setRunInfos((prev) =>
        prev.map((r) =>
          r.runId === run_id
            ? { ...r, status: "done" as const, doneAt: now, ...(exit_code !== undefined && { exitCode: exit_code }) }
            : r
        )
      );
      store.runNextInQueue(run_id);

      // Night shift: replenish when a night-shift run exits (or run not found but night shift active — e.g. event before runId was set)
      const state = useRunStore.getState();
      if (state.nightShiftActive && state.nightShiftReplenishCallback) {
        const isNightShiftExit = run?.meta?.isNightShift === true;
        const runNotFoundAssumeNightShift = run === undefined;
        if (isNightShiftExit || runNotFoundAssumeNightShift) {
          const slot = run?.slot ?? 1;
          const exitingRun = run ?? null;
          (async () => {
            try {
              await state.nightShiftReplenishCallback!(slot, exitingRun);
            } catch (err) {
              console.error("[night-shift] replenish failed:", err);
              toast.error("Night shift replenish failed. Check console.");
            }
          })();
        }
      }

      // Append to terminal output history (all completed runs)
      if (run) {
        const output = run.logLines.join("\n");
        const durationMs =
          run.startedAt != null && run.doneAt != null && run.doneAt >= run.startedAt
            ? run.doneAt - run.startedAt
            : undefined;
        store.addTerminalOutputToHistory({
          runId: run.runId,
          label: run.label,
          output,
          timestamp: new Date().toISOString(),
          exitCode: exit_code,
          slot: run.slot,
          durationMs,
        });
        // Visible toast for sighted users (RunStatusAnnouncer handles screen readers).
        const label = run.label.trim() || "Run";
        const success = exit_code === undefined || exit_code === 0;
        if (success) {
          toast.success(`Run ${label} completed successfully.`);
        } else {
          toast.error(`Run ${label} failed.`);
        }
      }

      if (run?.meta) {
        const stdout = run.logLines.join("\n");
        const projectId = run.meta.projectId;
        const ticketId = run.meta.ticketId;
        const success = exit_code === undefined || exit_code === 0;

        // Mark ticket as Done in DB when run completed successfully (so it leaves In Progress).
        if (success && projectId && ticketId) {
          fetch(`/api/data/projects/${projectId}/tickets/${ticketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ done: true, status: "Done" }),
          }).catch((err) =>
            console.error("[run-exited] PATCH ticket done failed:", err)
          );
        }

        // Ticket Implement All finished: record implementation_log entry (diff + summary).
        if (
          typeof run.meta.ticketNumber === "number" &&
          projectId &&
          run.meta.repoPath
        ) {
          (async () => {
            let filesChanged: { path: string; status: string }[] = [];
            if (isTauri) {
              try {
                const fromRef = run.meta!.gitRefAtStart ?? "";
                filesChanged = (await invoke<{ path: string; status: string }[]>("get_git_diff_name_status", {
                  projectPath: run.meta!.repoPath!,
                  fromRef: fromRef,
                })) ?? [];
              } catch {
                /* ignore */
              }
            }
            const summaryParts: string[] = [];
            if (filesChanged.length > 0) {
              const added = filesChanged.filter((f) => f.status === "A").length;
              const deleted = filesChanged.filter((f) => f.status === "D").length;
              const modified = filesChanged.filter((f) => f.status === "M").length;
              summaryParts.push(`${filesChanged.length} files changed${added ? `, ${added} added` : ""}${modified ? `, ${modified} modified` : ""}${deleted ? `, ${deleted} deleted` : ""}.`);
            }
            const logPreview = stdout.trim().slice(0, 400);
            if (logPreview) summaryParts.push(logPreview);
            const summary = summaryParts.join(" ");
            const completedAt = new Date().toISOString();
            try {
              if (isTauri) {
                await invoke("append_implementation_log_entry", {
                  project_id: run.meta!.projectId,
                  run_id,
                  ticket_number: run.meta!.ticketNumber,
                  ticket_title: run.meta!.ticketTitle ?? "",
                  milestone_id: run.meta!.milestoneId ?? null,
                  idea_id: run.meta!.ideaId ?? null,
                  completed_at: completedAt,
                  files_changed: JSON.stringify(filesChanged),
                  summary,
                });
              } else {
                const res = await fetch(`/api/data/projects/${run.meta!.projectId}/implementation-log`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    run_id,
                    ticket_number: run.meta!.ticketNumber,
                    ticket_title: run.meta!.ticketTitle ?? "",
                    milestone_id: run.meta!.milestoneId ?? null,
                    idea_id: run.meta!.ideaId ?? null,
                    completed_at: completedAt,
                    files_changed: filesChanged,
                    summary,
                  }),
                });
                if (!res.ok) throw new Error(await res.text());
              }
              // Move UI to Control tab immediately so the new entry is visible.
              window.dispatchEvent(
                new CustomEvent("ticket-implementation-done", {
                  detail: { projectId: run.meta!.projectId },
                })
              );
            } catch (err) {
              console.error("[run-exited] implementation-log POST failed:", err);
            }
          })();
        }
        // When Analyze runs via Worker (analyze-doc): strip terminal artifacts and write to outputPath.
        if (
          run.meta.onComplete === "analyze-doc" &&
          run.meta.projectId &&
          run.meta.outputPath &&
          typeof run.meta.payload?.repoPath === "string"
        ) {
          const stripped = stripTerminalArtifacts(stdout);
          const content =
            stripped.length >= MIN_DOCUMENT_LENGTH
              ? stripped
              : `# ${run.meta.outputPath.replace(/^.*\//, "").replace(/\.md$/i, "")}\n\n*Output was too short or only terminal output. Run Analyze again.*\n`;
          writeProjectFile(
            run.meta.projectId,
            run.meta.outputPath,
            content,
            run.meta.payload.repoPath as string
          ).catch((err) => console.error("[run-exited] writeProjectFile for analyze-doc failed:", err));
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

"use client";

import { useEffect, useRef } from "react";
import { listen, invoke, isTauri } from "@/lib/tauri";
import { writeProjectFile } from "@/lib/api-projects";
import { stripTerminalArtifacts, MIN_DOCUMENT_LENGTH } from "@/lib/strip-terminal-artifacts";
import { useRunStore, takeRunCompleteHandler } from "./run-store";

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

      // Append to terminal output history (all completed runs)
      if (run) {
        const output = run.logLines.join("\n");
        store.addTerminalOutputToHistory({
          runId: run.runId,
          label: run.label,
          output,
          timestamp: new Date().toISOString(),
          exitCode: exit_code,
          slot: run.slot,
        });
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

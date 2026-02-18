import type { TerminalOutputHistoryEntry } from "@/types/run";
import { toast } from "sonner";
import { filenameTimestamp, triggerFileDownload } from "@/lib/download-helpers";

/**
 * Serializable shape for one run entry (matches single-run JSON export).
 */
function entryToPayload(entry: TerminalOutputHistoryEntry) {
  return {
    id: entry.id,
    runId: entry.runId,
    label: entry.label,
    output: entry.output,
    timestamp: entry.timestamp,
    exitCode: entry.exitCode,
    slot: entry.slot,
    durationMs: entry.durationMs,
  };
}

/**
 * Download the full terminal output history as a single JSON file.
 * Payload: { exportedAt: string, entries: Array<{ id, runId, label, output, timestamp, exitCode, slot, durationMs }> }.
 * Entries are in chronological order (oldest first), matching the .txt export.
 * Filename: run-history-{YYYY-MM-DD-HHmm}.json
 * If entries is empty, shows a toast and does nothing.
 */
export function downloadAllRunHistoryJson(
  entries: TerminalOutputHistoryEntry[]
): void {
  if (entries.length === 0) {
    toast.info("No history to export");
    return;
  }

  const reversed = [...entries].reverse();
  const payload = {
    exportedAt: new Date().toISOString(),
    entries: reversed.map(entryToPayload),
  };

  const json = JSON.stringify(payload, null, 2);
  const filename = `run-history-${filenameTimestamp()}.json`;
  triggerFileDownload(json, filename, "application/json;charset=utf-8");
  toast.success("History exported as JSON");
}

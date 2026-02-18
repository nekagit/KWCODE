import type { TerminalOutputHistoryEntry } from "@/types/run";
import {
  safeFilenameSegment,
  filenameTimestamp,
  downloadBlob,
} from "@/lib/download-helpers";

/**
 * Download a single run history entry as a JSON file.
 * Filename: run-{label}-{YYYY-MM-DD-HHmm}.json
 * Includes id, runId, label, output, timestamp, exitCode, slot, durationMs.
 */
export function downloadRunAsJson(entry: TerminalOutputHistoryEntry): void {
  const segment = safeFilenameSegment(entry.label, "run");
  const filename = `run-${segment}-${filenameTimestamp()}.json`;

  const payload = {
    id: entry.id,
    runId: entry.runId,
    label: entry.label,
    output: entry.output,
    timestamp: entry.timestamp,
    exitCode: entry.exitCode,
    slot: entry.slot,
    durationMs: entry.durationMs,
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, filename);
}

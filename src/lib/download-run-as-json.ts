import type { TerminalOutputHistoryEntry } from "@/types/run";
import { toast } from "sonner";
import {
  safeFilenameSegment,
  filenameTimestamp,
  downloadBlob,
} from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

/**
 * Build the JSON payload for a single run. Same shape as download.
 */
export function buildRunJsonPayload(entry: TerminalOutputHistoryEntry): Record<string, unknown> {
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
 * Download a single run history entry as a JSON file.
 * Filename: run-{label}-{YYYY-MM-DD-HHmm}.json
 * Includes id, runId, label, output, timestamp, exitCode, slot, durationMs.
 */
export function downloadRunAsJson(entry: TerminalOutputHistoryEntry): void {
  const segment = safeFilenameSegment(entry.label, "run");
  const filename = `run-${segment}-${filenameTimestamp()}.json`;
  const payload = buildRunJsonPayload(entry);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, filename);
}

/**
 * Copy a single run as pretty-printed JSON to the clipboard.
 * Same payload as downloadRunAsJson.
 */
export async function copyRunAsJsonToClipboard(
  entry: TerminalOutputHistoryEntry
): Promise<void> {
  const payload = buildRunJsonPayload(entry);
  const content = JSON.stringify(payload, null, 2);
  const ok = await copyTextToClipboard(content);
  if (ok) {
    toast.success("Run copied as JSON");
  } else {
    toast.error("Failed to copy to clipboard");
  }
}

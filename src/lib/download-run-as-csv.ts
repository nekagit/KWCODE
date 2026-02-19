/**
 * Download a single run entry as CSV. Used by Run tab History and command palette.
 */
import type { TerminalOutputHistoryEntry } from "@/types/run";
import { toast } from "sonner";
import {
  safeFilenameSegment,
  filenameTimestamp,
  downloadBlob,
} from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { escapeCsvField } from "@/lib/csv-helpers";
import { formatDurationMs } from "@/lib/run-helpers";

/**
 * Build CSV content for a single run. Same columns as bulk export: timestamp, label, slot, exit_code, duration, output.
 */
export function buildRunCsv(entry: TerminalOutputHistoryEntry): string {
  const header = "timestamp,label,slot,exit_code,duration,output";
  const timestamp = escapeCsvField(entry.timestamp);
  const label = escapeCsvField(entry.label);
  const slot = entry.slot !== undefined ? String(entry.slot) : "";
  const exitCode = entry.exitCode !== undefined ? String(entry.exitCode) : "";
  const duration = formatDurationMs(entry.durationMs);
  const output = escapeCsvField(entry.output ?? "");
  const row = `${timestamp},${label},${slot},${exitCode},${duration},${output}`;
  return [header, row].join("\n");
}

/**
 * Download a single run history entry as a CSV file (one row).
 * Columns match bulk export: timestamp, label, slot, exit_code, duration, output.
 * Filename: run-{safeLabel}-{YYYY-MM-DD-HHmm}.csv
 */
export function downloadRunAsCsv(entry: TerminalOutputHistoryEntry): void {
  const csv = buildRunCsv(entry);
  const segment = safeFilenameSegment(entry.label, "run");
  const filename = `run-${segment}-${filenameTimestamp()}.csv`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
  toast.success("Run exported as CSV");
}

/**
 * Copy a single run as CSV to the clipboard.
 * Same columns and format as downloadRunAsCsv.
 */
export async function copyRunAsCsvToClipboard(
  entry: TerminalOutputHistoryEntry
): Promise<void> {
  const csv = buildRunCsv(entry);
  const ok = await copyTextToClipboard(csv);
  if (ok) {
    toast.success("Run copied as CSV");
  } else {
    toast.error("Failed to copy to clipboard");
  }
}

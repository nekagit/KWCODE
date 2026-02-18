import type { TerminalOutputHistoryEntry } from "@/types/run";
import { toast } from "sonner";
import { filenameTimestamp, downloadBlob } from "@/lib/download-helpers";
import { escapeCsvField } from "@/lib/csv-helpers";
import { formatDurationMs } from "@/lib/run-helpers";

/**
 * Download the full terminal output history as a CSV file.
 * Columns: timestamp, label, slot, exit_code, duration, output.
 * Entries are in chronological order (oldest first).
 * Filename: run-history-{YYYY-MM-DD-HHmm}.csv
 * If entries is empty, shows a toast and does nothing.
 */
export function downloadAllRunHistoryCsv(
  entries: TerminalOutputHistoryEntry[]
): void {
  if (entries.length === 0) {
    toast.info("No history to export");
    return;
  }

  const header = "timestamp,label,slot,exit_code,duration,output";
  const rows = [...entries]
    .reverse()
    .map((e) => {
      const timestamp = escapeCsvField(e.timestamp);
      const label = escapeCsvField(e.label);
      const slot = e.slot !== undefined ? String(e.slot) : "";
      const exitCode = e.exitCode !== undefined ? String(e.exitCode) : "";
      const duration = formatDurationMs(e.durationMs);
      const output = escapeCsvField(e.output ?? "");
      return `${timestamp},${label},${slot},${exitCode},${duration},${output}`;
    });
  const csv = [header, ...rows].join("\n");
  const filename = `run-history-${filenameTimestamp()}.csv`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
  toast.success("History exported as CSV");
}

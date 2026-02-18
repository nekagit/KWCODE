import type { TerminalOutputHistoryEntry } from "@/types/run";
import { toast } from "sonner";

/**
 * Escape a CSV field: wrap in double-quotes if it contains comma, newline, or double-quote;
 * double any internal double-quotes.
 */
function escapeCsvField(value: string): string {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Format duration milliseconds as human-readable (e.g. "2:34" or "45s").
 */
function formatDurationMs(ms: number | undefined): string {
  if (ms === undefined || ms < 0) return "";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60_000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

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

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `run-history-${date}-${time}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("History exported as CSV");
}

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
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeLabelForFile(label: string, maxLength = 60): string {
  const sanitized = label.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "run";
}

/**
 * Download a single run history entry as a CSV file (one row).
 * Columns match bulk export: timestamp, label, slot, exit_code, duration, output.
 * Filename: run-{safeLabel}-{YYYY-MM-DD-HHmm}.csv
 */
export function downloadRunAsCsv(entry: TerminalOutputHistoryEntry): void {
  const header = "timestamp,label,slot,exit_code,duration,output";
  const timestamp = escapeCsvField(entry.timestamp);
  const label = escapeCsvField(entry.label);
  const slot = entry.slot !== undefined ? String(entry.slot) : "";
  const exitCode = entry.exitCode !== undefined ? String(entry.exitCode) : "";
  const duration = formatDurationMs(entry.durationMs);
  const output = escapeCsvField(entry.output ?? "");
  const row = `${timestamp},${label},${slot},${exitCode},${duration},${output}`;
  const csv = [header, row].join("\n");

  const segment = safeLabelForFile(entry.label);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `run-${segment}-${date}-${time}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Run exported as CSV");
}

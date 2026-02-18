import type { TerminalOutputHistoryEntry } from "@/types/run";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeLabelForFile(label: string, maxLength = 60): string {
  const sanitized = label.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "run";
}

/**
 * Download a single run history entry as a JSON file.
 * Filename: run-{label}-{YYYY-MM-DD-HHmm}.json
 * Includes id, runId, label, output, timestamp, exitCode, slot, durationMs.
 */
export function downloadRunAsJson(entry: TerminalOutputHistoryEntry): void {
  const segment = safeLabelForFile(entry.label);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `run-${segment}-${date}-${time}.json`;

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
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

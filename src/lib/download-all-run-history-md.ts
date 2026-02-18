import type { TerminalOutputHistoryEntry } from "@/types/run";
import { toast } from "sonner";

/**
 * Format a single history entry as a Markdown section: ## Run: label, metadata block, fenced code for output.
 * History is newest-first in the UI; we write in reverse order so the file is chronological (oldest first).
 */
function formatEntryAsMarkdown(entry: TerminalOutputHistoryEntry): string {
  const lines: string[] = [];
  lines.push(`## Run: ${entry.label}`);
  lines.push("");
  lines.push(`- **ID:** \`${entry.id}\``);
  lines.push(`- **Timestamp:** ${entry.timestamp}`);
  if (entry.exitCode !== undefined) {
    lines.push(`- **Exit code:** ${entry.exitCode}`);
  }
  if (entry.durationMs !== undefined) {
    lines.push(`- **Duration:** ${entry.durationMs} ms`);
  }
  if (entry.slot !== undefined) {
    lines.push(`- **Slot:** ${entry.slot}`);
  }
  lines.push("");
  const output = (entry.output ?? "").trim() || "(no output)";
  lines.push("```");
  lines.push(output);
  lines.push("```");
  lines.push("");
  return lines.join("\n");
}

/**
 * Download the full terminal output history as a single Markdown file.
 * Format: # Run history, then for each entry (chronological): ## Run: label, metadata, fenced code block.
 * Filename: run-history-{YYYY-MM-DD-HHmm}.md
 * If entries is empty, shows a toast and does nothing.
 */
export function downloadAllRunHistoryMarkdown(
  entries: TerminalOutputHistoryEntry[]
): void {
  if (entries.length === 0) {
    toast.info("No history to export");
    return;
  }

  const reversed = [...entries].reverse();
  const body = [
    "# Run history",
    "",
    `Exported at ${new Date().toISOString()}. ${entries.length} run(s).`,
    "",
    "---",
    "",
    ...reversed.map(formatEntryAsMarkdown),
  ].join("\n");

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `run-history-${date}-${time}.md`;

  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("History exported as Markdown");
}

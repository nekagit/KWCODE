import type { TerminalOutputHistoryEntry } from "@/types/run";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeLabelForFile(label: string, maxLength = 60): string {
  const sanitized = label.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "run";
}

/**
 * Format a single history entry as Markdown: heading, metadata, fenced code block for output.
 * Same structure as each section in download-all-run-history-md.
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
 * Download a single run history entry as a Markdown file.
 * Format: ## Run: label, metadata, fenced code block (same as in "Download all as Markdown").
 * Filename: run-{label}-{YYYY-MM-DD-HHmm}.md
 */
export function downloadRunAsMarkdown(entry: TerminalOutputHistoryEntry): void {
  const segment = safeLabelForFile(entry.label);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `run-${segment}-${date}-${time}.md`;

  const body = [
    formatEntryAsMarkdown(entry).trim(),
    "",
    `Exported at ${now.toISOString()}.`,
  ].join("\n");

  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

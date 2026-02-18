import { toast } from "sonner";
import type { ArchitectureRecord } from "@/types/architecture";
import { architectureRecordToMarkdown } from "@/lib/architecture-to-markdown";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeNameForFile(name: string, maxLength = 60): string {
  const sanitized = name.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "architecture";
}

/**
 * Download an architecture record as a markdown file.
 * Filename: architecture-{name}-{YYYY-MM-DD-HHmm}.md
 */
export function downloadArchitectureRecord(record: ArchitectureRecord): void {
  const markdown = architectureRecordToMarkdown(record);
  if (!markdown.trim()) {
    toast.info("Nothing to download");
    return;
  }

  const segment = safeNameForFile(record.name);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `architecture-${segment}-${date}-${time}.md`;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Architecture downloaded");
}

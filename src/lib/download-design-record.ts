import { toast } from "sonner";
import type { DesignRecord } from "@/types/design";
import {
  designRecordToMarkdown,
  type DesignRecordForExport,
} from "@/lib/design-to-markdown";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeNameForFile(name: string, maxLength = 60): string {
  const sanitized = name.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "design";
}

/**
 * Download a design record as a markdown file.
 * Requires record.config; if missing, shows toast and returns.
 * Filename: design-{name}-{YYYY-MM-DD-HHmm}.md
 */
export function downloadDesignRecord(record: DesignRecord): void {
  if (!record.config) {
    toast.info("No design config to download");
    return;
  }

  const exportRecord: DesignRecordForExport = {
    id: record.id,
    name: record.name,
    config: record.config,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };

  const markdown = designRecordToMarkdown(exportRecord);
  if (!markdown.trim()) {
    toast.info("Nothing to download");
    return;
  }

  const segment = safeNameForFile(record.name);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `design-${segment}-${date}-${time}.md`;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Design downloaded");
}

/**
 * Copy a design record as markdown to the clipboard.
 * Requires record.config; if missing, shows toast and returns.
 */
export async function copyDesignRecordToClipboard(record: DesignRecord): Promise<boolean> {
  if (!record.config) {
    toast.info("No design config to copy");
    return false;
  }

  const exportRecord: DesignRecordForExport = {
    id: record.id,
    name: record.name,
    config: record.config,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };

  const markdown = designRecordToMarkdown(exportRecord);
  if (!markdown.trim()) {
    toast.info("Nothing to copy");
    return false;
  }

  return copyTextToClipboard(markdown);
}

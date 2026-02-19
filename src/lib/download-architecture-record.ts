/**
 * Download a single architecture record as Markdown. Used by project Architecture tab and command palette.
 */
import { toast } from "sonner";
import type { ArchitectureRecord } from "@/types/architecture";
import { architectureRecordToMarkdown } from "@/lib/architecture-to-markdown";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import {
  safeNameForFile,
  filenameTimestamp,
  triggerFileDownload,
} from "@/lib/download-helpers";

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

  const segment = safeNameForFile(record.name, "architecture");
  const filename = `architecture-${segment}-${filenameTimestamp()}.md`;

  triggerFileDownload(markdown, filename, "text/markdown;charset=utf-8");
  toast.success("Architecture downloaded");
}

/**
 * Copy an architecture record as markdown to the clipboard.
 * Same format as download. Returns false and shows toast when nothing to copy.
 */
export async function copyArchitectureRecordToClipboard(
  record: ArchitectureRecord
): Promise<boolean> {
  const markdown = architectureRecordToMarkdown(record);
  if (!markdown.trim()) {
    toast.info("Nothing to copy");
    return false;
  }
  return copyTextToClipboard(markdown);
}

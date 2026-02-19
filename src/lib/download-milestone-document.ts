/**
 * Download a milestone document as Markdown or copy to clipboard. Used by Milestones tab and command palette.
 */
import { toast } from "sonner";
import { triggerFileDownload, filenameTimestamp } from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

/**
 * Download the current milestone content as a Markdown file.
 * Filename is `{filenameBase}-{timestamp}.md` so downloads are unique.
 * If content is empty, shows a toast and does nothing.
 */
export function downloadMilestoneContentAsMarkdown(
  content: string,
  filenameBase: string
): void {
  if (!content?.trim()) {
    toast.info("No milestone content to download");
    return;
  }
  const base = (filenameBase || "milestone").replace(/\.md$/i, "");
  const downloadFilename = `${base}-${filenameTimestamp()}.md`;
  triggerFileDownload(content, downloadFilename, "text/markdown;charset=utf-8");
  toast.success("Milestone content downloaded as Markdown");
}

/**
 * Copy the current milestone content as Markdown to the clipboard.
 * Uses copyTextToClipboard (toast is shown there).
 * If content is empty, shows a toast and returns false.
 */
export async function copyMilestoneContentAsMarkdownToClipboard(
  content: string
): Promise<boolean> {
  if (!content?.trim()) {
    toast.info("No milestone content to copy");
    return false;
  }
  return copyTextToClipboard(content);
}

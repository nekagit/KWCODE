/**
 * Download testing document as Markdown. Used by Testing page and command palette.
 */
import { toast } from "sonner";
import { triggerFileDownload, filenameTimestamp } from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

/**
 * Download the current testing document content as a Markdown file.
 * Filename is derived from the given filename (e.g. "testing.md") as
 * `{base}-{timestamp}.md` so downloads are unique.
 * If content is empty, shows a toast and does nothing.
 */
export function downloadTestingDocumentAsMarkdown(
  content: string,
  filename: string
): void {
  if (!content?.trim()) {
    toast.info("No content to download");
    return;
  }
  const base = filename.replace(/\.md$/i, "") || "testing-document";
  const downloadFilename = `${base}-${filenameTimestamp()}.md`;
  triggerFileDownload(content, downloadFilename, "text/markdown;charset=utf-8");
  toast.success("Testing document downloaded as Markdown");
}

/**
 * Copy the current testing document content as Markdown to the clipboard.
 * Uses copyTextToClipboard (toast is shown there).
 * If content is empty, shows a toast and returns false.
 */
export async function copyTestingDocumentAsMarkdownToClipboard(
  content: string
): Promise<boolean> {
  if (!content?.trim()) {
    toast.info("No content to copy");
    return false;
  }
  return copyTextToClipboard(content);
}

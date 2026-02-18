import { toast } from "sonner";
import { triggerFileDownload, filenameTimestamp } from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

/**
 * Download a technologies document (e.g. libraries.md, sources.md) as a Markdown file.
 * Filename is derived from the given filename as `{base}-{timestamp}.md` so downloads are unique.
 * If content is empty, shows a toast and does nothing.
 */
export function downloadTechnologiesDocumentAsMarkdown(
  content: string,
  filename: string
): void {
  if (!content?.trim()) {
    toast.info("No content to download");
    return;
  }
  const base = filename.replace(/\.md$/i, "") || "technologies-document";
  const downloadFilename = `${base}-${filenameTimestamp()}.md`;
  triggerFileDownload(content, downloadFilename, "text/markdown;charset=utf-8");
  toast.success("Document downloaded as Markdown");
}

/**
 * Copy a technologies document content as Markdown to the clipboard.
 * Uses copyTextToClipboard (toast is shown there).
 * If content is empty, shows a toast and returns false.
 */
export async function copyTechnologiesDocumentAsMarkdownToClipboard(
  content: string
): Promise<boolean> {
  if (!content?.trim()) {
    toast.info("No content to copy");
    return false;
  }
  return copyTextToClipboard(content);
}

import { toast } from "sonner";
import {
  filenameTimestamp,
  triggerFileDownload,
} from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

const DESCRIPTION =
  "App documentation lives in the repository. Use your editor or file manager to open the following locations.";
const PATH_CURSOR = ".cursor/documentation/";
const PATH_CURSOR_DESC =
  "setup guide, development guide, architecture overview, API reference";
const PATH_DOCS = "docs/";
const PATH_DOCS_DESC =
  "Docusaurus-ready docs (getting started, architecture, development, api, guides, contributing)";

/**
 * Build a Markdown string for the Documentation page content.
 * Format: # Documentation, Exported at, description, then bullet list of paths.
 * Optional exportedAt for deterministic tests.
 */
export function buildDocumentationInfoMarkdown(exportedAt?: string): string {
  const at = exportedAt ?? new Date().toISOString();
  const lines = [
    "# Documentation",
    "",
    `Exported at ${at}.`,
    "",
    "---",
    "",
    DESCRIPTION,
    "",
    `- **${PATH_CURSOR}** — ${PATH_CURSOR_DESC}`,
    `- **${PATH_DOCS}** — ${PATH_DOCS_DESC}`,
    "",
    "From the repo root, open these folders in your editor or file manager to read or edit the docs.",
    "",
  ];
  return lines.join("\n");
}

/**
 * Download Documentation page info as a Markdown file.
 * Filename: documentation-info-{timestamp}.md
 */
export function downloadDocumentationInfoAsMarkdown(): void {
  const markdown = buildDocumentationInfoMarkdown();
  const filename = `documentation-info-${filenameTimestamp()}.md`;
  triggerFileDownload(markdown, filename, "text/markdown;charset=utf-8");
  toast.success("Documentation info exported as Markdown");
}

/**
 * Copy Documentation page info to the clipboard as Markdown.
 * Same content as downloadDocumentationInfoAsMarkdown.
 * Returns a Promise that resolves to true if copy succeeded, false otherwise.
 */
export async function copyDocumentationInfoAsMarkdownToClipboard(): Promise<boolean> {
  const markdown = buildDocumentationInfoMarkdown();
  const ok = await copyTextToClipboard(markdown);
  if (ok) {
    toast.success("Documentation info copied as Markdown");
  }
  return ok;
}

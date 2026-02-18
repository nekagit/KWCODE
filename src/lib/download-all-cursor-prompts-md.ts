import { toast } from "sonner";

export interface CursorPromptFileWithContent {
  relativePath: string;
  path: string;
  name: string;
  content: string;
  updatedAt: string;
}

function escapeMarkdownHeading(text: string): string {
  return text.replace(/#/g, "\\#");
}

/**
 * Build one markdown document with all .cursor prompt files.
 */
function cursorPromptsToMarkdown(files: CursorPromptFileWithContent[], exportedAt: string): string {
  const lines: string[] = [
    "# All .cursor Prompts (*.prompt.md)",
    "",
    `Exported: ${exportedAt}`,
    "",
    "---",
    "",
  ];

  for (const f of files) {
    const title = escapeMarkdownHeading(f.path);
    lines.push(`## ${title}`);
    lines.push("");
    lines.push(`**Updated:** ${f.updatedAt}`);
    lines.push("");
    lines.push(f.content.trim());
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

/**
 * Download all .cursor *.prompt.md files as a single Markdown file.
 * Fetches content from /api/data/cursor-prompt-files-contents.
 * Filename: all-cursor-prompts-{YYYY-MM-DD-HHmm}.md
 */
export async function downloadAllCursorPromptsAsMarkdown(): Promise<void> {
  try {
    const res = await fetch("/api/data/cursor-prompt-files-contents");
    if (!res.ok) throw new Error("Failed to load .cursor prompts");
    const data = (await res.json()) as { files?: CursorPromptFileWithContent[] };
    const files = Array.isArray(data.files) ? data.files : [];
    if (files.length === 0) {
      toast.info("No .cursor prompts to export");
      return;
    }

    const exportedAt = new Date().toISOString();
    const markdown = cursorPromptsToMarkdown(files, exportedAt);

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5).replace(":", "");
    const filename = `all-cursor-prompts-${date}-${time}.md`;

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(".cursor prompts exported as Markdown");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Export failed");
  }
}

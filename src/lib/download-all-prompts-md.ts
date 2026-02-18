import { toast } from "sonner";

export interface PromptRecordForExport {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function escapeMarkdownHeading(text: string): string {
  return text.replace(/#/g, "\\#");
}

/**
 * Build markdown content for the given prompts.
 */
function promptsToMarkdown(prompts: PromptRecordForExport[], exportedAt: string): string {
  const lines: string[] = [
    "# All Prompts (General)",
    "",
    `Exported: ${exportedAt}`,
    "",
    "---",
    "",
  ];

  for (const p of prompts) {
    const title = escapeMarkdownHeading((p.title ?? "").trim() || "Untitled");
    const category = p.category ?? "";
    const content = (p.content ?? "").trim();
    const created = p.created_at ?? "";
    const updated = p.updated_at ?? "";

    lines.push(`## ${title} (id: ${p.id})`);
    lines.push("");
    if (category) lines.push(`**Category:** ${category}`);
    if (created) lines.push(`**Created:** ${created}`);
    if (updated && updated !== created) lines.push(`**Updated:** ${updated}`);
    lines.push("");
    if (content) {
      lines.push(content);
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

/**
 * Download all general prompt records as a single Markdown file.
 * Filename: all-prompts-{YYYY-MM-DD-HHmm}.md
 */
export function downloadAllPromptsAsMarkdown(prompts: PromptRecordForExport[]): void {
  if (prompts.length === 0) {
    toast.info("No prompts to export");
    return;
  }

  const exportedAt = new Date().toISOString();
  const markdown = promptsToMarkdown(prompts, exportedAt);

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `all-prompts-${date}-${time}.md`;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Prompts exported as Markdown");
}

/**
 * Export My Ideas as Markdown. Used by command palette and Ideas page.
 */
import type { IdeaRecord } from "@/types/idea";
import { toast } from "sonner";
import { filenameTimestamp, triggerFileDownload } from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

const CATEGORY_LABELS: Record<string, string> = {
  saas: "SaaS",
  iaas: "IaaS",
  paas: "PaaS",
  website: "Website",
  webapp: "Webapp",
  webshop: "Webshop",
  other: "Other",
};

function escapeMarkdownHeading(text: string): string {
  return text.replace(/#/g, "\\#");
}

/**
 * Build markdown content for the given ideas.
 * Format: # My Ideas, exportedAt, then for each idea: ## Title, Category, Description, dates.
 * Used by both download and copy-to-clipboard so format stays in sync.
 */
export function buildMyIdeasMarkdown(ideas: IdeaRecord[]): string {
  const exportedAt = new Date().toISOString();
  const lines: string[] = [
    "# My Ideas",
    "",
    `Exported: ${exportedAt}`,
    "",
    "---",
    "",
  ];

  for (const idea of ideas) {
    const title = escapeMarkdownHeading((idea.title ?? "").trim() || "Untitled");
    const category = CATEGORY_LABELS[idea.category] ?? idea.category;
    const description = (idea.description ?? "").trim();
    const created = idea.created_at ?? "";
    const updated = idea.updated_at ?? "";

    lines.push(`## ${title}`);
    lines.push("");
    lines.push(`**Category:** ${category}`);
    if (created) lines.push(`**Created:** ${created}`);
    if (updated && updated !== created) lines.push(`**Updated:** ${updated}`);
    lines.push("");
    if (description) {
      lines.push(description);
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

/**
 * Download the current "My ideas" list as a single Markdown file.
 * Filename: my-ideas-{YYYY-MM-DD-HHmm}.md
 * If ideas is empty, shows a toast and does nothing.
 */
export function downloadMyIdeasAsMarkdown(ideas: IdeaRecord[]): void {
  if (ideas.length === 0) {
    toast.info("No ideas to export");
    return;
  }

  const markdown = buildMyIdeasMarkdown(ideas);
  const filename = `my-ideas-${filenameTimestamp()}.md`;
  triggerFileDownload(markdown, filename, "text/markdown;charset=utf-8");
  toast.success("Ideas exported as Markdown");
}

/**
 * Copy the current "My ideas" list to the clipboard as Markdown.
 * Same format as downloadMyIdeasAsMarkdown: # My Ideas, export timestamp, then per-idea sections.
 * If ideas is empty, shows a toast and returns false.
 */
export async function copyAllMyIdeasMarkdownToClipboard(
  ideas: IdeaRecord[]
): Promise<boolean> {
  if (ideas.length === 0) {
    toast.info("No ideas to copy");
    return false;
  }
  const markdown = buildMyIdeasMarkdown(ideas);
  return copyTextToClipboard(markdown);
}

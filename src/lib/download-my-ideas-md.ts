import type { IdeaRecord } from "@/types/idea";
import { toast } from "sonner";

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
 * Format: title, exportedAt, then for each idea: ## Title, Category, Description, dates.
 */
function ideasToMarkdown(ideas: IdeaRecord[], exportedAt: string): string {
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

  const exportedAt = new Date().toISOString();
  const markdown = ideasToMarkdown(ideas, exportedAt);

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `my-ideas-${date}-${time}.md`;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Ideas exported as Markdown");
}

import { toast } from "sonner";
import type { IdeaRecord } from "@/types/idea";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeTitleForFile(title: string, maxLength = 60): string {
  const sanitized = title.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "idea";
}

/**
 * Download a single idea record as a JSON file.
 * Filename: idea-{title}-{YYYY-MM-DD-HHmm}.json
 * Includes id, title, description, category, source, created_at, updated_at.
 */
export function downloadIdeaAsJson(idea: IdeaRecord): void {
  const segment = safeTitleForFile(idea.title);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `idea-${segment}-${date}-${time}.json`;

  const json = JSON.stringify(idea, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Idea exported as JSON");
}

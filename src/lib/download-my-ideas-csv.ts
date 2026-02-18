import type { IdeaRecord } from "@/types/idea";
import { toast } from "sonner";
import { filenameTimestamp, downloadBlob } from "@/lib/download-helpers";
import { escapeCsvField } from "@/lib/csv-helpers";

/**
 * Build CSV content for the given ideas.
 * Columns: id, title, description, category, source, created_at, updated_at.
 */
function ideasToCsv(ideas: IdeaRecord[]): string {
  const header =
    "id,title,description,category,source,created_at,updated_at";
  const rows = ideas.map((idea) => {
    const id = String(idea.id ?? "");
    const title = escapeCsvField((idea.title ?? "").trim() || "Untitled");
    const description = escapeCsvField((idea.description ?? "").trim());
    const category = escapeCsvField(idea.category ?? "");
    const source = escapeCsvField(idea.source ?? "");
    const created_at = escapeCsvField(idea.created_at ?? "");
    const updated_at = escapeCsvField(idea.updated_at ?? "");
    return `${id},${title},${description},${category},${source},${created_at},${updated_at}`;
  });
  return [header, ...rows].join("\n");
}

/**
 * Download the current "My ideas" list as a CSV file.
 * Columns: id, title, description, category, source, created_at, updated_at.
 * Filename: my-ideas-{YYYY-MM-DD-HHmm}.csv
 * If ideas is empty, shows a toast and does nothing.
 */
export function downloadMyIdeasAsCsv(ideas: IdeaRecord[]): void {
  if (ideas.length === 0) {
    toast.info("No ideas to export");
    return;
  }

  const csv = ideasToCsv(ideas);
  const filename = `my-ideas-${filenameTimestamp()}.csv`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
  toast.success("Ideas exported as CSV");
}

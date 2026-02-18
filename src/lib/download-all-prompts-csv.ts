import { toast } from "sonner";

export interface PromptRecordForExport {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function escapeCsvField(value: string): string {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Build CSV content for the given prompts.
 * Columns: id, title, content, category, created_at, updated_at.
 */
function promptsToCsv(prompts: PromptRecordForExport[]): string {
  const header = "id,title,content,category,created_at,updated_at";
  const rows = prompts.map((p) => {
    const id = String(p.id ?? "");
    const title = escapeCsvField((p.title ?? "").trim() || "Untitled");
    const content = escapeCsvField((p.content ?? "").trim());
    const category = escapeCsvField(String(p.category ?? ""));
    const created_at = escapeCsvField(p.created_at ?? "");
    const updated_at = escapeCsvField(p.updated_at ?? "");
    return `${id},${title},${content},${category},${created_at},${updated_at}`;
  });
  return [header, ...rows].join("\n");
}

/**
 * Download all general prompt records as a single CSV file.
 * Filename: all-prompts-{YYYY-MM-DD-HHmm}.csv
 */
export function downloadAllPromptsAsCsv(prompts: PromptRecordForExport[]): void {
  if (prompts.length === 0) {
    toast.info("No prompts to export");
    return;
  }

  const csv = promptsToCsv(prompts);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `all-prompts-${date}-${time}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Prompts exported as CSV");
}

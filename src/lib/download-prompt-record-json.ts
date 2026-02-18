import { toast } from "sonner";

/**
 * Payload for exporting a prompt record as JSON.
 * At minimum id, title, content; optional fields for full record export.
 */
export interface PromptRecordJsonPayload {
  id: number;
  title: string;
  content: string;
  description?: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeTitleForFile(title: string, maxLength = 60): string {
  const sanitized = title.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "prompt";
}

/**
 * Download a prompt record as a JSON file.
 * Filename: prompt-{title}-{YYYY-MM-DD-HHmm}.json
 * Includes all provided fields (id, title, content, and any optional fields).
 */
export function downloadPromptRecordAsJson(record: PromptRecordJsonPayload): void {
  const segment = safeTitleForFile(record.title);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `prompt-${segment}-${date}-${time}.json`;

  const json = JSON.stringify(record, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Prompt exported as JSON");
}

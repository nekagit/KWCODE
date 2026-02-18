import { toast } from "sonner";
import type { ArchitectureRecord } from "@/types/architecture";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeNameForFile(name: string, maxLength = 60): string {
  const sanitized = name.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "architecture";
}

/**
 * Download an architecture record as a JSON file.
 * Filename: architecture-{name}-{YYYY-MM-DD-HHmm}.json
 * Includes full record (id, name, category, description, practices, scenarios, etc.).
 */
export function downloadArchitectureRecordAsJson(record: ArchitectureRecord): void {
  const segment = safeNameForFile(record.name);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `architecture-${segment}-${date}-${time}.json`;

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
  toast.success("Architecture exported as JSON");
}

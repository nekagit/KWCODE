import { toast } from "sonner";
import type { DesignRecord } from "@/types/design";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeNameForFile(name: string, maxLength = 60): string {
  const sanitized = name.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "design";
}

/**
 * Download a design record as a JSON file.
 * Filename: design-{name}-{YYYY-MM-DD-HHmm}.json
 * Includes full record (id, name, description, config, created_at, updated_at, etc.).
 */
export function downloadDesignRecordAsJson(record: DesignRecord): void {
  const segment = safeNameForFile(record.name);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `design-${segment}-${date}-${time}.json`;

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
  toast.success("Design exported as JSON");
}

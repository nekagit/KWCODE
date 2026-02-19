/**
 * Download a single architecture record as JSON. Used by project Architecture tab and command palette.
 */
import { toast } from "sonner";
import type { ArchitectureRecord } from "@/types/architecture";
import {
  safeNameForFile,
  filenameTimestamp,
  triggerFileDownload,
} from "@/lib/download-helpers";

/**
 * Download an architecture record as a JSON file.
 * Filename: architecture-{name}-{YYYY-MM-DD-HHmm}.json
 * Includes full record (id, name, category, description, practices, scenarios, etc.).
 */
export function downloadArchitectureRecordAsJson(record: ArchitectureRecord): void {
  const segment = safeNameForFile(record.name, "architecture");
  const filename = `architecture-${segment}-${filenameTimestamp()}.json`;

  const json = JSON.stringify(record, null, 2);
  triggerFileDownload(json, filename, "application/json;charset=utf-8");
  toast.success("Architecture exported as JSON");
}

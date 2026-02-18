import { toast } from "sonner";
import type { IdeaRecord } from "@/types/idea";
import {
  safeFilenameSegment,
  filenameTimestamp,
  downloadBlob,
} from "@/lib/download-helpers";

/**
 * Download a single idea record as a JSON file.
 * Filename: idea-{title}-{YYYY-MM-DD-HHmm}.json
 * Includes id, title, description, category, source, created_at, updated_at.
 */
export function downloadIdeaAsJson(idea: IdeaRecord): void {
  const segment = safeFilenameSegment(idea.title, "idea");
  const filename = `idea-${segment}-${filenameTimestamp()}.json`;
  const json = JSON.stringify(idea, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, filename);
  toast.success("Idea exported as JSON");
}

import type { IdeaRecord } from "@/types/idea";
import { toast } from "sonner";
import { filenameTimestamp, triggerFileDownload } from "@/lib/download-helpers";

/**
 * Download the current "My ideas" list as a single JSON file.
 * Payload: { exportedAt: string, ideas: IdeaRecord[] }.
 * Filename: my-ideas-{YYYY-MM-DD-HHmm}.json
 * If ideas is empty, shows a toast and does nothing.
 */
export function downloadMyIdeasAsJson(ideas: IdeaRecord[]): void {
  if (ideas.length === 0) {
    toast.info("No ideas to export");
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    ideas,
  };
  const json = JSON.stringify(payload, null, 2);
  const filename = `my-ideas-${filenameTimestamp()}.json`;
  triggerFileDownload(json, filename, "application/json;charset=utf-8");
  toast.success("Ideas exported as JSON");
}

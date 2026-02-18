import type { IdeaRecord } from "@/types/idea";
import { toast } from "sonner";
import { filenameTimestamp, triggerFileDownload } from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

function buildMyIdeasJsonPayload(ideas: IdeaRecord[]) {
  return {
    exportedAt: new Date().toISOString(),
    ideas,
  };
}

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

  const payload = buildMyIdeasJsonPayload(ideas);
  const json = JSON.stringify(payload, null, 2);
  const filename = `my-ideas-${filenameTimestamp()}.json`;
  triggerFileDownload(json, filename, "application/json;charset=utf-8");
  toast.success("Ideas exported as JSON");
}

/**
 * Copy the current "My ideas" list as pretty-printed JSON to the clipboard.
 * Same payload as download: { exportedAt, ideas }. If ideas is empty, shows a toast and returns.
 */
export async function copyMyIdeasAsJsonToClipboard(
  ideas: IdeaRecord[]
): Promise<void> {
  if (ideas.length === 0) {
    toast.info("No ideas to export");
    return;
  }

  const payload = buildMyIdeasJsonPayload(ideas);
  const content = JSON.stringify(payload, null, 2);
  const ok = await copyTextToClipboard(content);
  if (ok) {
    toast.success("Ideas copied as JSON");
  } else {
    toast.error("Failed to copy to clipboard");
  }
}

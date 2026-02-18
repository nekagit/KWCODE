import type { IdeaRecord } from "@/types/idea";
import { toast } from "sonner";

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
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `my-ideas-${date}-${time}.json`;

  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Ideas exported as JSON");
}

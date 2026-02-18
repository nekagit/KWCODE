import { toast } from "sonner";

export interface PromptRecordForExport {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Download all general prompt records as a single JSON file.
 * Payload: { exportedAt: string, prompts: PromptRecordForExport[] }.
 * Filename: all-prompts-{YYYY-MM-DD-HHmm}.json
 */
export function downloadAllPromptsAsJson(prompts: PromptRecordForExport[]): void {
  if (prompts.length === 0) {
    toast.info("No prompts to export");
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    prompts,
  };

  const json = JSON.stringify(payload, null, 2);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `all-prompts-${date}-${time}.json`;

  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Prompts exported as JSON");
}

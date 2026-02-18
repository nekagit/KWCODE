import { toast } from "sonner";
import { filenameTimestamp, triggerFileDownload } from "@/lib/download-helpers";

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
  const filename = `all-prompts-${filenameTimestamp()}.json`;
  triggerFileDownload(json, filename, "application/json;charset=utf-8");
  toast.success("Prompts exported as JSON");
}

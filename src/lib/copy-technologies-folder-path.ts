/**
 * Copies the technologies folder path (.cursor/technologies) to the clipboard. Tauri only.
 */
import { invoke, isTauri } from "@/lib/tauri";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { toast } from "sonner";

/**
 * Copies the app repo's technologies folder path (.cursor/technologies or .cursor)
 * to the clipboard. Tauri only; in browser shows a toast (ADR 0216).
 */
export async function copyTechnologiesFolderPath(): Promise<void> {
  if (!isTauri) {
    toast.info("Copy path is available in the desktop app.");
    return;
  }
  try {
    const path = await invoke<string>("get_technologies_folder_path");
    const trimmed = path?.trim();
    if (!trimmed) {
      toast.error("Technologies folder path is not available.");
      return;
    }
    await copyTextToClipboard(trimmed);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to copy technologies folder path");
  }
}

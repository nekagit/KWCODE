import { invoke, isTauri } from "@/lib/tauri";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { toast } from "sonner";

/**
 * Copies the app repo's ideas folder path (.cursor/0. ideas or .cursor)
 * to the clipboard. Tauri only; in browser shows a toast (ADR 0219).
 */
export async function copyIdeasFolderPath(): Promise<void> {
  if (!isTauri) {
    toast.info("Copy path is available in the desktop app.");
    return;
  }
  try {
    const path = await invoke<string>("get_ideas_folder_path");
    const trimmed = path?.trim();
    if (!trimmed) {
      toast.error("Ideas folder path is not available.");
      return;
    }
    await copyTextToClipboard(trimmed);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to copy ideas folder path");
  }
}

import { invoke, isTauri } from "@/lib/tauri";
import { toast } from "sonner";

/**
 * Opens the app repo's .cursor/0. ideas folder (or .cursor if that subfolder
 * is missing) in the system file manager. Tauri only; in browser shows a toast.
 * Reuses open_path_in_file_manager pattern (ADR 0128, 0188, 0196, 0202).
 */
export async function openIdeasFolderInFileManager(): Promise<void> {
  if (!isTauri) {
    toast.info("Open ideas folder is available in the desktop app.");
    return;
  }
  try {
    await invoke("open_ideas_folder");
    toast.success("Opened ideas folder in file manager");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to open ideas folder");
  }
}

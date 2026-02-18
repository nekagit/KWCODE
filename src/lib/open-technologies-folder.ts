import { invoke, isTauri } from "@/lib/tauri";
import { toast } from "sonner";

/**
 * Opens the app repo's .cursor/technologies folder (or .cursor if that subfolder
 * is missing) in the system file manager. Tauri only; in browser shows a toast.
 * Reuses open_path_in_file_manager pattern (ADR 0128, 0188, 0196).
 */
export async function openTechnologiesFolderInFileManager(): Promise<void> {
  if (!isTauri) {
    toast.info("Open technologies folder is available in the desktop app.");
    return;
  }
  try {
    await invoke("open_technologies_folder");
    toast.success("Opened technologies folder in file manager");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to open technologies folder");
  }
}

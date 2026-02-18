import { invoke, isTauri } from "@/lib/tauri";
import { toast } from "sonner";

/**
 * Opens the app repo's .cursor/documentation folder (or .cursor if that subfolder
 * is missing) in the system file manager. Tauri only; in browser shows a toast.
 * Reuses open_path_in_file_manager pattern (ADR 0128, 0188).
 */
export async function openDocumentationFolderInFileManager(): Promise<void> {
  if (!isTauri) {
    toast.info("Open documentation folder is available in the desktop app.");
    return;
  }
  try {
    await invoke("open_documentation_folder");
    toast.success("Opened documentation folder in file manager");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to open documentation folder");
  }
}

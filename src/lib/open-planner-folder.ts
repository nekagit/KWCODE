import { invoke, isTauri } from "@/lib/tauri";
import { toast } from "sonner";

/**
 * Opens the app repo's .cursor/7. planner folder (or .cursor if that subfolder
 * is missing) in the system file manager. Tauri only; in browser shows a toast.
 * Matches pattern used for documentation, technologies, and ideas folders.
 */
export async function openPlannerFolderInFileManager(): Promise<void> {
  if (!isTauri) {
    toast.info("Open planner folder is available in the desktop app.");
    return;
  }
  try {
    await invoke("open_planner_folder");
    toast.success("Opened planner folder in file manager");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to open planner folder");
  }
}

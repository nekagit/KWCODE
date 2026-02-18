import { invoke, isTauri } from "@/lib/tauri";
import { toast } from "sonner";

/**
 * Opens the app repo's .cursor/milestones folder (or .cursor if that subfolder
 * is missing) in the system file manager. Tauri only; in browser shows a toast.
 * Matches pattern used for documentation, technologies, ideas, and planner folders.
 */
export async function openMilestonesFolderInFileManager(): Promise<void> {
  if (!isTauri) {
    toast.info("Open milestones folder is available in the desktop app.");
    return;
  }
  try {
    await invoke("open_milestones_folder");
    toast.success("Opened milestones folder in file manager");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to open milestones folder");
  }
}

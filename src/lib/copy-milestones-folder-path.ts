import { invoke, isTauri } from "@/lib/tauri";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { toast } from "sonner";

/**
 * Copies the app repo's milestones folder path (.cursor/milestones or .cursor)
 * to the clipboard. Tauri only; in browser shows a toast.
 * Matches pattern used for documentation, technologies, ideas, and planner folder path copy.
 */
export async function copyMilestonesFolderPath(): Promise<void> {
  if (!isTauri) {
    toast.info("Copy path is available in the desktop app.");
    return;
  }
  try {
    const path = await invoke<string>("get_milestones_folder_path");
    const trimmed = path?.trim();
    if (!trimmed) {
      toast.error("Milestones folder path is not available.");
      return;
    }
    await copyTextToClipboard(trimmed);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to copy milestones folder path");
  }
}

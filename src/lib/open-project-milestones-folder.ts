/**
 * Opens the project milestones folder in the system file manager. Tauri only.
 */
import { invoke, isTauri } from "@/lib/tauri";
import { toast } from "sonner";

/**
 * Opens the project's .cursor/milestones folder in the system file manager.
 * Uses Tauri open_path_in_file_manager with repoPath + "/.cursor/milestones".
 * Tauri only; in browser shows a toast. Path must exist (backend canonicalize).
 */
export async function openProjectMilestonesFolderInFileManager(
  repoPath: string | undefined
): Promise<void> {
  const base = repoPath?.trim();
  if (!base) {
    toast.error("No project path set. Add a repo path in project settings.");
    return;
  }
  if (!isTauri) {
    toast.info("Open folder is available in the desktop app.");
    return;
  }
  const path = `${base.replace(/\/$/, "")}/.cursor/milestones`;
  try {
    await invoke("open_path_in_file_manager", { path });
    toast.success("Opened milestones folder in file manager");
  } catch (e) {
    toast.error(
      e instanceof Error ? e.message : "Failed to open milestones folder"
    );
  }
}

import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { toast } from "sonner";

/**
 * Builds the path to the project's .cursor folder (repoPath/.cursor).
 * Trims trailing slashes from repoPath before appending /.cursor.
 */
export function getProjectCursorFolderPath(repoPath: string | undefined): string {
  const base = repoPath?.trim();
  if (!base) return "";
  return base.replace(/[/\\]+$/, "") + "/.cursor";
}

/**
 * Copies the project's .cursor folder path to the clipboard.
 * Path is derived from repoPath (e.g. /path/to/repo/.cursor).
 * If repoPath is empty, shows a toast and returns without copying.
 */
export async function copyProjectCursorFolderPath(
  repoPath: string | undefined
): Promise<void> {
  const path = getProjectCursorFolderPath(repoPath);
  if (!path) {
    toast.info("No project path set. Add a repo path in project settings.");
    return;
  }
  try {
    await copyTextToClipboard(path);
    toast.success("Copied .cursor folder path to clipboard");
  } catch (e) {
    toast.error(
      e instanceof Error ? e.message : "Failed to copy .cursor folder path"
    );
  }
}

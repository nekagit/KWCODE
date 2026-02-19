/**
 * Copies the documentation folder path (.cursor/documentation) to the clipboard. Tauri only.
 */
import { invoke, isTauri } from "@/lib/tauri";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { toast } from "sonner";

/**
 * Copies the app repo's documentation folder path (.cursor/documentation or .cursor)
 * to the clipboard. Tauri only; in browser shows a toast (ADR 0215).
 */
export async function copyDocumentationFolderPath(): Promise<void> {
  if (!isTauri) {
    toast.info("Copy path is available in the desktop app.");
    return;
  }
  try {
    const path = await invoke<string>("get_documentation_folder_path");
    const trimmed = path?.trim();
    if (!trimmed) {
      toast.error("Documentation folder path is not available.");
      return;
    }
    await copyTextToClipboard(trimmed);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to copy documentation folder path");
  }
}

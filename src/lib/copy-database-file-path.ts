/**
 * Copies the SQLite database file path to the clipboard. Tauri only.
 */
import { invoke, isTauri } from "@/lib/tauri";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { toast } from "sonner";

/**
 * Copies the full path to the SQLite database file (e.g. …/data/app.db)
 * to the clipboard. Tauri only; in browser shows a toast.
 * Reuses get_data_dir; DB file is at {data_dir}/app.db.
 */
export async function copyDatabaseFilePath(): Promise<void> {
  if (!isTauri) {
    toast.info("Copy database path is available in the desktop app.");
    return;
  }
  try {
    const dataDir = await invoke<string>("get_data_dir");
    const trimmed = dataDir?.trim();
    if (!trimmed) {
      toast.error("Data folder path is not available.");
      return;
    }
    const dbPath = trimmed.endsWith("/") ? `${trimmed}app.db` : `${trimmed}/app.db`;
    await copyTextToClipboard(dbPath);
    toast.success("Database file path copied to clipboard");
  } catch (e) {
    toast.error(
      e instanceof Error ? e.message : "Failed to copy database file path"
    );
  }
}

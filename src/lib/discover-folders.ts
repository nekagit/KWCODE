/**
 * Discover folder paths from the app's configured projects root (February directories)
 * that are not yet registered as projects. Used by the Projects list "Discover folders" flow.
 */
import { invoke, isTauri } from "@/lib/tauri";
import { listProjects } from "@/lib/api-projects";
import type { Project } from "@/types/project";

/** Normalize path for comparison (slash style, trim, lowercase). */
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").trim().toLowerCase();
}

/**
 * Fetch all folder paths from the configured root (Tauri list_february_folders or API).
 */
export async function getFolderPaths(): Promise<string[]> {
  if (isTauri) {
    const paths = await invoke<string[]>("list_february_folders");
    return Array.isArray(paths) ? paths : [];
  }
  const res = await fetch("/api/data/february-folders");
  const data = (await res.json().catch(() => ({}))) as { folders?: string[] };
  return Array.isArray(data.folders) ? data.folders : [];
}

/**
 * Return folder paths that are not already in the project list (by repoPath).
 * Paths are compared after normalizing (slashes, trim, case-insensitive).
 */
export async function discoverFoldersNotInProjects(): Promise<{ newPaths: string[] }> {
  const [folderPaths, projects] = await Promise.all([
    getFolderPaths(),
    listProjects(),
  ]);

  const existingNormalized = new Set<string>();
  for (const p of projects as Project[]) {
    const r = p.repoPath?.trim();
    if (r) existingNormalized.add(normalizePath(r));
  }

  const newPaths = folderPaths.filter((path) => !existingNormalized.has(normalizePath(path)));
  return { newPaths };
}

/** Derive a project name from a folder path (last segment). */
export function projectNameFromPath(path: string): string {
  const segments = path.replace(/\\/g, "/").split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1]! : "Project";
}

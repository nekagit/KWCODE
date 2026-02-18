/**
 * Fetch the full ideas list (My Ideas) for export from command palette or other callers.
 * Dual-mode: Tauri uses get_ideas_list(project_id: null); browser uses /api/data/ideas.
 */

import { invoke, isTauri, projectIdArgPayload } from "@/lib/tauri";
import type { IdeaRecord } from "@/types/idea";
import { toast } from "sonner";

type IdeaRow = {
  id: number;
  project_id?: string | null;
  title: string;
  description: string;
  category: string;
  source: string;
  created_at?: string;
  updated_at?: string;
};

function rowToRecord(row: IdeaRow): IdeaRecord {
  return {
    id: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    category: (row.category as IdeaRecord["category"]) ?? "other",
    source: (row.source as IdeaRecord["source"]) ?? "manual",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Returns the current ideas list (all ideas, same as Ideas page "My ideas").
 * On failure shows a toast and returns [].
 */
export async function fetchIdeas(): Promise<IdeaRecord[]> {
  try {
    if (isTauri) {
      const rows = await invoke<IdeaRow[]>("get_ideas_list", projectIdArgPayload(null));
      return Array.isArray(rows) ? rows.map(rowToRecord) : [];
    }
    const res = await fetch("/api/data/ideas");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return Array.isArray(data) ? (data as IdeaRecord[]) : [];
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load ideas";
    toast.error(message);
    return [];
  }
}

/**
 * Fetch the current tech stack for export from command palette or other callers.
 * Dual-mode: Tauri uses read_file_text for .cursor/technologies/tech-stack.json;
 * browser uses GET /api/data/technologies and files["tech-stack.json"].
 */

import { invoke, isTauri } from "@/lib/tauri";
import type { TechStackExport } from "@/lib/download-tech-stack";
import { toast } from "sonner";

const TECH_STACK_PATH = ".cursor/technologies/tech-stack.json";

function parseTechStack(raw: string | undefined): TechStackExport | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw) as TechStackExport;
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

/**
 * Returns the current tech stack (same data as Technologies page).
 * On failure shows a toast and returns null.
 */
export async function fetchTechStack(): Promise<TechStackExport | null> {
  try {
    if (isTauri) {
      const content = await invoke<string>("read_file_text", {
        path: TECH_STACK_PATH,
      });
      return parseTechStack(content ?? undefined);
    }
    const res = await fetch("/api/data/technologies");
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as { files?: Record<string, string> };
    const raw = data.files?.["tech-stack.json"];
    return parseTechStack(raw);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load tech stack";
    toast.error(message);
    return null;
  }
}

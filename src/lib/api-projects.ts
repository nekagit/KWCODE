/**
 * Projects API: uses Tauri invoke when running in Tauri (no Next server),
 * otherwise fetch to /api/data/projects. Fixes 404 when app is loaded as static export (e.g. Tauri production).
 */
import { invoke, isTauri } from "@/lib/tauri";
import type { Project } from "@/types/project";

export type CreateProjectBody = {
  name: string;
  description?: string;
  repoPath?: string;
  promptIds?: number[];
  ticketIds?: string[];
  featureIds?: string[];
  ideaIds?: number[];
  designIds?: string[];
  architectureIds?: string[];
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export type ResolvedProject = Project & {
  prompts: unknown[];
  tickets: unknown[];
  features: unknown[];
  ideas: unknown[];
  designs: unknown[];
  architectures: unknown[];
};

/** Get one project with resolved prompts, tickets, features, ideas, designs, architectures. In Tauri uses same sources as dashboard (SQLite + JSON) so counts match "All data". */
export async function getProjectResolved(id: string): Promise<ResolvedProject> {
  if (isTauri()) {
    return invoke("get_project_resolved", { id });
  } else {
    return fetchJson<ResolvedProject>(`/api/data/projects/${id}?resolve=1`);
  }
}

export async function listProjects(): Promise<Project[]> {
  if (isTauri()) {
    return invoke("list_february_folders");
  } else {
    return fetchJson<Project[]>("/api/data/projects");
  }
}

export async function createProject(body: CreateProjectBody): Promise<Project> {
  if (isTauri()) {
    return invoke("create_project", { project: body });
  } else {
    return fetchJson<Project>("/api/data/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
}

export async function updateProject(id: string, body: Partial<CreateProjectBody>): Promise<Project> {
  if (isTauri()) {
    return invoke("update_project", { id, project: body });
  } else {
    return fetchJson<Project>(`/api/data/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (isTauri()) {
    return invoke("delete_project", { id });
  } else {
    return fetchJson<void>(`/api/data/projects/${id}`, { method: "DELETE" });
  }
}

export async function getProjectExport(id: string, category: keyof ResolvedProject): Promise<string> {
  if (isTauri()) {
    return invoke("get_project_export", { id, category });
  } else {
    return fetchJson<string>(`/api/data/projects/${id}/export/${category}`);
  }
}

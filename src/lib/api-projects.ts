/**
 * Projects API: uses Tauri invoke when running in Tauri (no Next server),
 * otherwise fetch to /api/data/projects. Fixes 404 when app is loaded as static export (e.g. Tauri production).
 */
import { invoke, isTauri } from "@/lib/tauri";
import type { Project } from "@/types/project";

const API = "/api/data/projects";

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

/** List all projects */
export async function listProjects(): Promise<Project[]> {
  if (isTauri()) {
    const json = await invoke<string>("list_projects");
    const data = JSON.parse(json) as unknown;
    return Array.isArray(data) ? (data as Project[]) : [];
  }
  const data = await fetchJson<Project[]>(API);
  return Array.isArray(data) ? data : [];
}

/** Get one project by id */
export async function getProject(id: string): Promise<Project> {
  if (isTauri()) {
    const json = await invoke<string>("get_project", { id });
    return JSON.parse(json) as Project;
  }
  return fetchJson<Project>(`${API}/${encodeURIComponent(id)}`);
}

/** Create a new project */
export async function createProject(body: CreateProjectBody): Promise<Project> {
  if (isTauri()) {
    const json = await invoke<string>("create_project", {
      body: JSON.stringify(body),
    });
    return JSON.parse(json) as Project;
  }
  return fetchJson<Project>(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Update an existing project (partial merge). */
export async function updateProject(id: string, body: Partial<Project>): Promise<Project> {
  if (isTauri()) {
    const current = await getProject(id);
    const merged: Project = {
      ...current,
      ...body,
      id: current.id,
      updated_at: new Date().toISOString(),
    };
    await invoke("update_project", {
      id,
      body: JSON.stringify(merged),
    });
    return getProject(id);
  }
  const res = await fetchJson<Project>(`${API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

/** Delete a project */
export async function deleteProject(id: string): Promise<void> {
  if (isTauri()) {
    await invoke("delete_project", { id });
    return;
  }
  await fetchJson<void>(`${API}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Fetch project export (full project + linked entities). Only supported via HTTP API; in Tauri returns project only. */
export async function getProjectExport(id: string): Promise<{
  exportedAt: string;
  project: Project;
  prompts: unknown[];
  tickets: unknown[];
  features: unknown[];
  ideas: unknown[];
  designs: unknown[];
  architectures: unknown[];
}> {
  if (isTauri()) {
    const project = await getProject(id);
    return {
      exportedAt: new Date().toISOString(),
      project,
      prompts: [],
      tickets: [],
      features: [],
      ideas: [],
      designs: [],
      architectures: [],
    };
  }
  return fetchJson(`${API}/${encodeURIComponent(id)}/export`);
}

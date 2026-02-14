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
  ideas: unknown[];
  designs: unknown[];
  architectures: unknown[];
};

/** Get one project with resolved prompts, tickets, ideas, designs, architectures. In Tauri uses same sources as dashboard (SQLite + JSON) so counts match "All data". */
export async function getProjectResolved(id: string): Promise<ResolvedProject> {
  if (isTauri) {
    return invoke("get_project_resolved", { id });
  } else {
    return fetchJson<ResolvedProject>(`/api/data/projects/${id}?resolve=1`);
  }
}

export async function listProjects(): Promise<Project[]> {
  if (isTauri) {
    return invoke("list_projects", {});
  }
  return fetchJson<Project[]>("/api/data/projects");
}

export async function createProject(body: CreateProjectBody): Promise<Project> {
  if (isTauri) {
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
  if (isTauri) {
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
  if (isTauri) {
    return invoke("delete_project", { id });
  } else {
    return fetchJson<void>(`/api/data/projects/${id}`, { method: "DELETE" });
  }
}

export async function getProjectExport(id: string, category: keyof ResolvedProject): Promise<string> {
  if (isTauri) {
    return invoke("get_project_export", { id, category });
  } else {
    return fetchJson<string>(`/api/data/projects/${id}/export/${category}`);
  }
}

/**
 * Read a file from the project repo (e.g. .cursor/planner/tickets.md).
 * In Tauri pass repoPath; in browser uses projectId.
 * Throws with a clear message when the file is missing or repo path is invalid (reliable read; clear errors when missing).
 */
export async function readProjectFile(
  projectId: string,
  relativePath: string,
  repoPath?: string
): Promise<string> {
  if (isTauri && repoPath) {
    try {
      return await invoke<string>("read_file_text_under_root", {
        root: repoPath,
        path: relativePath,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/no such file|not a file|not found|does not exist|os error 2/i.test(msg)) {
        throw new Error(`${relativePath}: file not found or not accessible. ${msg}`);
      }
      if (/canonicalize|permission denied|not a directory/i.test(msg)) {
        throw new Error(`Repo path invalid or not accessible. ${msg}`);
      }
      throw new Error(`${relativePath}: ${msg}`);
    }
  }
  const res = await fetch(
    `/api/data/projects/${projectId}/file?path=${encodeURIComponent(relativePath)}`
  );
  const text = await res.text();
  if (!res.ok) {
    let errorMsg: string;
    try {
      const j = JSON.parse(text) as { error?: string };
      errorMsg = j.error ?? res.statusText;
    } catch {
      errorMsg = text || res.statusText;
    }
    if (res.status === 404) {
      throw new Error(`${relativePath}: file not found. ${errorMsg}`);
    }
    if (res.status === 400 || res.status === 403) {
      throw new Error(`${relativePath}: ${errorMsg}`);
    }
    throw new Error(`${relativePath}: ${errorMsg}`);
  }
  return text;
}

/**
 * Read a file from the project repo, or return empty string if the file does not exist.
 * Use for optional files (e.g. .cursor/planner/tickets.md) so the UI can load with empty data instead of showing a file-not-found error.
 */
export async function readProjectFileOrEmpty(
  projectId: string,
  relativePath: string,
  repoPath?: string
): Promise<string> {
  try {
    return await readProjectFile(projectId, relativePath, repoPath);
  } catch {
    return "";
  }
}

/** Write a file under the project repo. In Tauri pass repoPath; in browser uses projectId. */
export async function writeProjectFile(
  projectId: string,
  relativePath: string,
  content: string,
  repoPath?: string
): Promise<void> {
  if (isTauri && repoPath) {
    await invoke("write_spec_file", {
      projectPath: repoPath,
      relativePath,
      content,
    });
    return;
  }
  const res = await fetch(`/api/data/projects/${projectId}/file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: relativePath, content }),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = res.statusText;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }
}

export type FileEntry = {
  name: string;
  isDirectory: boolean;
  size: number;
  updatedAt: string;
};

export async function listProjectFiles(
  projectId: string,
  relativePath: string = "",
  repoPath?: string
): Promise<FileEntry[]> {
  if (isTauri && repoPath) {
    // Attempting invoke call, might fail if not implemented in Rust backend yet
    try {
      return await invoke<FileEntry[]>("list_files_under_root", {
        root: repoPath,
        path: relativePath,
      });
    } catch (e) {
      console.warn("Tauri list_files_under_root failed:", e);
      throw new Error(e instanceof Error ? e.message : "File listing failed.");
    }
  }

  const query = relativePath ? `?path=${encodeURIComponent(relativePath)}` : "";
  const res = await fetch(`/api/data/projects/${projectId}/files${query}`);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to list files");
  }

  return json.files;
}

import {
  INITIAL_ARCHITECT_PROMPT,
  INITIAL_FRONTEND_PROMPT,
  INITIAL_BACKEND_PROMPT,
  INITIAL_SETUP_ARCHITECTURE,
  INITIAL_SETUP_DESIGN,
  INITIAL_SETUP_DOCUMENTATION,
  INITIAL_SETUP_TESTING,
  INITIAL_SETUP_IDEAS,
  INITIAL_TICKETS_TEMPLATE,
  INITIAL_FEATURES_TEMPLATE,
  INITIAL_PROMPT_ARCHITECTURE,
  INITIAL_PROMPT_DESIGN,
  INITIAL_PROMPT_TESTING,
  INITIAL_PROMPT_IDEAS,
  INITIAL_PROMPT_DOCUMENTATION,
  INITIAL_PROMPT_TICKETS,
  INITIAL_PROMPT_FEATURES,
  INITIAL_PROMPT_WORKER
} from "./initialization-templates";

/** Fetches canonical agent template from public/cursor-templates/agents; falls back to inline constant if unavailable. */
async function getAgentTemplateContent(name: string, fallback: string): Promise<string> {
  if (typeof window === "undefined") return fallback;
  try {
    const base = window.location.origin;
    const res = await fetch(`${base}/cursor-templates/agents/${name}.md`);
    if (res.ok) return await res.text();
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * Initializes a project repository with a standard .cursor structure and high-quality prompt templates.
 * Agent .md files are loaded from public/cursor-templates/agents/ (full KWCode agent content); fallback to inline templates if fetch fails.
 */
export async function initializeProjectRepo(projectId: string, repoPath: string): Promise<void> {
  const now = new Date().toISOString().split("T")[0];

  const [archContent, frontendContent, backendContent] = await Promise.all([
    getAgentTemplateContent("solution-architect", INITIAL_ARCHITECT_PROMPT),
    getAgentTemplateContent("frontend-dev", INITIAL_FRONTEND_PROMPT),
    getAgentTemplateContent("backend-dev", INITIAL_BACKEND_PROMPT),
  ]);

  const filesToWrite = [
    // Agents (full content from cursor-templates when available)
    { path: ".cursor/agents/solution-architect.md", content: archContent },
    { path: ".cursor/agents/frontend-dev.md", content: frontendContent },
    { path: ".cursor/agents/backend-dev.md", content: backendContent },

    // Planner
    { path: ".cursor/planner/tickets.md", content: INITIAL_TICKETS_TEMPLATE.replace(/\[PROJECT_NAME\]/g, projectId).replace(/\[DATE\]/g, now) },
    { path: ".cursor/planner/features.md", content: INITIAL_FEATURES_TEMPLATE },
    { path: ".cursor/planner/kanban-state.json", content: JSON.stringify({ inProgressIds: [] }, null, 2) },

    // Prompts
    { path: ".cursor/prompts/architecture.md", content: INITIAL_PROMPT_ARCHITECTURE },
    { path: ".cursor/prompts/design.md", content: INITIAL_PROMPT_DESIGN },
    { path: ".cursor/prompts/testing.md", content: INITIAL_PROMPT_TESTING },
    { path: ".cursor/prompts/ideas.md", content: INITIAL_PROMPT_IDEAS },
    { path: ".cursor/prompts/documentation.md", content: INITIAL_PROMPT_DOCUMENTATION },
    { path: ".cursor/prompts/tickets.md", content: INITIAL_PROMPT_TICKETS },
    { path: ".cursor/prompts/features.md", content: INITIAL_PROMPT_FEATURES },
    { path: ".cursor/prompts/worker.md", content: INITIAL_PROMPT_WORKER },

    // Setup
    { path: ".cursor/setup/architecture.md", content: INITIAL_SETUP_ARCHITECTURE.replace(/\[PROJECT_NAME\]/g, projectId) },
    { path: ".cursor/setup/design.md", content: INITIAL_SETUP_DESIGN.replace(/\[PROJECT_NAME\]/g, projectId) },
    { path: ".cursor/setup/documentation.md", content: INITIAL_SETUP_DOCUMENTATION.replace(/\[PROJECT_NAME\]/g, projectId) },
    { path: ".cursor/setup/testing.md", content: INITIAL_SETUP_TESTING.replace(/\[PROJECT_NAME\]/g, projectId) },
    { path: ".cursor/setup/ideas.md", content: INITIAL_SETUP_IDEAS.replace(/\[PROJECT_NAME\]/g, projectId) },
  ];

  for (const file of filesToWrite) {
    await writeProjectFile(projectId, file.path, file.content, repoPath);
  }

  // Ensure gitkeeps for organizational clarity
  await writeProjectFile(projectId, ".cursor/agents/.gitkeep", "", repoPath);
  await writeProjectFile(projectId, ".cursor/setup/.gitkeep", "", repoPath);
  await writeProjectFile(projectId, ".cursor/prompts/.gitkeep", "", repoPath);
  await writeProjectFile(projectId, ".cursor/planner/.gitkeep", "", repoPath);
}


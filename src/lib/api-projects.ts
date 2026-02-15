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

/**
 * Initializes a project's .cursor folder by copying exactly the contents of .cursor_inti (same structure, renamed to .cursor).
 * Nothing more: no inline templates, no extra files. Template is read from API (browser) or Tauri command (desktop).
 */
export async function initializeProjectRepo(projectId: string, repoPath: string): Promise<void> {
  let files: Record<string, string>;
  if (isTauri) {
    try {
      files = await invoke<Record<string, string>>("get_cursor_init_template", {});
    } catch (e) {
      throw new Error(
        "Failed to load .cursor_inti template. In Tauri, ensure .cursor_inti exists next to the app."
      );
    }
  } else {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/data/cursor-init-template`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error || "Failed to load .cursor_inti template");
    }
    const json = (await res.json()) as { files?: Record<string, string> };
    files = json.files ?? {};
  }
  if (Object.keys(files).length === 0) {
    throw new Error(".cursor_inti folder is empty or not found");
  }
  for (const [relativePath, content] of Object.entries(files)) {
    const normalized = relativePath.replace(/\\/g, "/");
    if (!normalized || normalized.startsWith("..")) continue;
    const cursorPath = `.cursor/${normalized}`;
    await writeProjectFile(projectId, cursorPath, content, repoPath);
  }
}

/**
 * Run the analyze-project-doc API: read prompt from project repo, send current doc + prompt to LLM, write result to output path.
 * Uses POST /api/analyze-project-doc (browser or Tauri with Next server).
 */
export async function analyzeProjectDoc(
  projectId: string,
  promptPath: string,
  outputPath: string
): Promise<void> {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const res = await fetch(`${base}/api/analyze-project-doc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, promptPath, outputPath }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || res.statusText || "Analyze failed");
  }
}


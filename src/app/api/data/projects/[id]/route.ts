import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { Project, EntityCategory, ProjectEntityCategories } from "@/types/project";

function findDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

const DATA_DIR = findDataDir();
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

function readJson<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readProjects(): Project[] {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) return [];
    const raw = fs.readFileSync(PROJECTS_FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

type ResolvedEntityCategory = EntityCategory;

type ResolvedProject = Project & {
  prompts: ({ id: number; title: string; content?: string } & ResolvedEntityCategory)[];
  tickets: ({ id: string; title: string; status: string; description?: string } & ResolvedEntityCategory)[];

  ideas: ({ id: number; title: string; description: string; category: string } & ResolvedEntityCategory)[];
  designs: ({ id: string; name: string } & ResolvedEntityCategory)[];
  architectures: ({ id: string; name: string } & ResolvedEntityCategory)[];
};

function getCategory(ec: ProjectEntityCategories | undefined, kind: keyof ProjectEntityCategories, entityId: string | number): EntityCategory | undefined {
  const map = ec?.[kind];
  if (!map || typeof map !== "object") return undefined;
  const key = typeof entityId === "number" ? String(entityId) : entityId;
  return map[key];
}

/** GET: single project with resolved prompts, tickets, ideas */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projects = readProjects();
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const promptsRaw = readJson<{ id: number; title: string; content?: string }[]>("prompts-export.json");
    const promptsList = Array.isArray(promptsRaw) ? promptsRaw : [];
    const ticketsList = readJson<{ id: string; title: string; status: string; description?: string }[]>("tickets.json") ?? [];

    const ideasList = readJson<{ id: number; title: string; description: string; category: string }[]>("ideas.json") ?? [];
    const designsRaw = readJson<{ id: string; name: string }[]>("designs.json");
    const designsList = Array.isArray(designsRaw) ? designsRaw : [];
    const architecturesRaw = readJson<{ id: string; name: string }[]>("architectures.json");
    const architecturesList = Array.isArray(architecturesRaw) ? architecturesRaw : [];

    const promptIds = Array.isArray(project.promptIds) ? project.promptIds : [];
    const ticketIds = Array.isArray(project.ticketIds) ? project.ticketIds : [];

    const ideaIds = Array.isArray(project.ideaIds) ? project.ideaIds : [];
    const designIds = Array.isArray((project as { designIds?: string[] }).designIds) ? (project as { designIds: string[] }).designIds : [];
    const architectureIds = Array.isArray((project as { architectureIds?: string[] }).architectureIds) ? (project as { architectureIds: string[] }).architectureIds : [];
    const entityCategories = project.entityCategories;

    const resolved: ResolvedProject = {
      ...project,
      designIds,
      architectureIds,
      promptIds,
      ticketIds,

      ideaIds,
      prompts: (promptIds as number[])
        .map((pid) => {
          const p = promptsList.find((pr) => Number(pr.id) === pid);
          if (!p) return null;
          const cat = getCategory(entityCategories, "prompts", pid);
          return { ...p, ...cat };
        })
        .filter(Boolean) as ResolvedProject["prompts"],
      tickets: ticketIds
        .map((tid) => {
          const t = ticketsList.find((tr) => tr.id === tid);
          if (!t) return null;
          const cat = getCategory(entityCategories, "tickets", tid);
          return { ...t, ...cat };
        })
        .filter(Boolean) as ResolvedProject["tickets"],

      ideas: ideaIds
        .map((iid) => {
          const i = ideasList.find((ir) => Number(ir.id) === iid);
          if (!i) return null;
          const cat = getCategory(entityCategories, "ideas", String(iid));
          return { ...i, ...cat };
        })
        .filter(Boolean) as ResolvedProject["ideas"],
      designs: designIds
        .map((did) => {
          const d = designsList.find((dr) => dr.id === did);
          if (!d) return null;
          const cat = getCategory(entityCategories, "designs", did);
          return { ...d, ...cat };
        })
        .filter(Boolean) as ResolvedProject["designs"],
      architectures: architectureIds
        .map((aid) => {
          const a = architecturesList.find((ar) => ar.id === aid);
          if (!a) return null;
          const cat = getCategory(entityCategories, "architectures", aid);
          return { ...a, ...cat };
        })
        .filter(Boolean) as ResolvedProject["architectures"],
    };

    return NextResponse.json(resolved);
  } catch (e) {
    console.error("Project GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load project" },
      { status: 500 }
    );
  }
}

/** PUT: update project. Body: partial Project */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const projects = readProjects();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const now = new Date().toISOString();
    const specFilesValid =
      Array.isArray(body.specFiles) &&
        body.specFiles.every(
          (e: unknown) => {
            if (typeof e !== "object" || e == null || !("name" in e) || !("path" in e)) return false;
            const o = e as { name: unknown; path: unknown; content?: unknown };
            return typeof o.name === "string" && typeof o.path === "string" && (o.content === undefined || typeof o.content === "string");
          }
        )
        ? (body.specFiles as { name: string; path: string; content?: string }[])
        : undefined;
    const specFilesTicketsValid = Array.isArray(body.specFilesTickets)
      ? (body.specFilesTickets as unknown[]).filter((s): s is string => typeof s === "string")
      : undefined;

    const updated: Project = {
      ...projects[idx],
      ...(typeof body.name === "string" && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: typeof body.description === "string" ? body.description.trim() : undefined }),
      ...(body.repoPath !== undefined && { repoPath: typeof body.repoPath === "string" ? body.repoPath.trim() || undefined : undefined }),
      ...(Array.isArray(body.promptIds) && { promptIds: body.promptIds.filter((n: unknown) => typeof n === "number") }),
      ...(Array.isArray(body.ticketIds) && { ticketIds: body.ticketIds.filter((s: unknown) => typeof s === "string") }),

      ...(Array.isArray(body.ideaIds) && { ideaIds: body.ideaIds.filter((n: unknown) => typeof n === "number") }),
      ...(Array.isArray(body.designIds) && { designIds: body.designIds.filter((s: unknown) => typeof s === "string") }),
      ...(Array.isArray(body.architectureIds) && { architectureIds: body.architectureIds.filter((s: unknown) => typeof s === "string") }),
      ...(body.entityCategories !== undefined && typeof body.entityCategories === "object" && body.entityCategories !== null && { entityCategories: body.entityCategories as ProjectEntityCategories }),
      ...(specFilesValid !== undefined && { specFiles: specFilesValid }),
      ...(specFilesTicketsValid !== undefined && { specFilesTickets: specFilesTicketsValid }),

      updated_at: now,
    };
    projects[idx] = updated;
    writeProjects(projects);
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Project PUT error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update project" },
      { status: 500 }
    );
  }
}

/** PATCH: same as PUT (partial merge). */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

/** DELETE: remove project */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projects = readProjects();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    writeProjects(filtered);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Project DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete project" },
      { status: 500 }
    );
  }
}

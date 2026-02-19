/** route component. */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { Project } from "@/types/project";
import { parseAndValidate, createProjectSchema } from "@/lib/api-validation";

export const dynamic = "force-static";

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

/** GET: list all projects */
export async function GET() {
  try {
    const projects = readProjects();
    return NextResponse.json(projects);
  } catch (e) {
    console.error("Projects GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load projects" },
      { status: 500 }
    );
  }
}

/** POST: create a new project. Body: { name, description?, repoPath?, promptIds?, ticketIds?, ideaIds? } */
export async function POST(request: NextRequest) {
  try {
    const parsed = await parseAndValidate(request, createProjectSchema);
    if (!parsed.success) return parsed.response;
    const body = parsed.data;
    const projects = readProjects();
    const now = new Date().toISOString();
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      description: body.description?.trim() || undefined,
      repoPath: body.repoPath?.trim() || undefined,
      promptIds: body.promptIds ?? [],
      ticketIds: body.ticketIds ?? [],

      ideaIds: body.ideaIds ?? [],
      designIds: body.designIds ?? [],
      architectureIds: body.architectureIds ?? [],
      created_at: now,
      updated_at: now,
    };
    projects.push(newProject);
    writeProjects(projects);
    return NextResponse.json(newProject);
  } catch (e) {
    console.error("Projects POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create project" },
      { status: 500 }
    );
  }
}

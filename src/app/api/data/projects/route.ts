import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { Project } from "@/types/project";

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

/** POST: create a new project. Body: { name, description?, repoPath?, promptIds?, ticketIds?, featureIds?, ideaIds? } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const projects = readProjects();
    const now = new Date().toISOString();
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description: typeof body.description === "string" ? body.description.trim() : undefined,
      repoPath: typeof body.repoPath === "string" ? body.repoPath.trim() || undefined : undefined,
      promptIds: Array.isArray(body.promptIds) ? body.promptIds.filter((n: unknown) => typeof n === "number") : [],
      ticketIds: Array.isArray(body.ticketIds) ? body.ticketIds.filter((s: unknown) => typeof s === "string") : [],
      featureIds: Array.isArray(body.featureIds) ? body.featureIds.filter((s: unknown) => typeof s === "string") : [],
      ideaIds: Array.isArray(body.ideaIds) ? body.ideaIds.filter((n: unknown) => typeof n === "number") : [],
      designIds: Array.isArray(body.designIds) ? body.designIds.filter((s: unknown) => typeof s === "string") : [],
      architectureIds: Array.isArray(body.architectureIds) ? body.architectureIds.filter((s: unknown) => typeof s === "string") : [],
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

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { Project } from "@/types/project";
import type { ArchitectureRecord } from "@/types/architecture";
import type { DesignConfig } from "@/types/design";

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

/** Full design record as stored (id, name, config, timestamps) */
interface DesignRecord {
  id: string;
  name: string;
  config: DesignConfig;
  created_at: string;
  updated_at: string;
}

/** Export payload: project plus all linked entities as full records */
export interface ProjectExport {
  exportedAt: string;
  project: Project;
  prompts: { id: number; title: string; content?: string; category?: string | null; tags?: string[] | null; created_at?: string | null; updated_at?: string | null }[];
  tickets: { id: string; title: string; description?: string; status: string; priority?: number; created_at?: string; updated_at?: string }[];
  features: { id: string; title: string; ticket_ids?: string[]; prompt_ids: number[]; project_paths: string[]; created_at?: string; updated_at?: string }[];
  ideas: { id: number; title: string; description: string; category: string; source?: string; created_at?: string; updated_at?: string }[];
  designs: DesignRecord[];
  architectures: ArchitectureRecord[];
}

/** GET: export project as JSON including all linked entities (full records) */
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

    const promptsRaw = readJson<{ id: number; title: string; content?: string; category?: string | null; tags?: string[] | null; created_at?: string | null; updated_at?: string | null }[]>("prompts-export.json");
    const promptsList = Array.isArray(promptsRaw) ? promptsRaw : [];
    const ticketsList = readJson<{ id: string; title: string; description?: string; status: string; priority?: number; created_at?: string; updated_at?: string }[]>("tickets.json") ?? [];
    const featuresList = readJson<{ id: string; title: string; ticket_ids?: string[]; prompt_ids: number[]; project_paths: string[]; created_at?: string; updated_at?: string }[]>("features.json") ?? [];
    const ideasList = readJson<{ id: number; title: string; description: string; category: string; source?: string; created_at?: string; updated_at?: string }[]>("ideas.json") ?? [];
    const designsRaw = readJson<DesignRecord[]>("designs.json");
    const designsList = Array.isArray(designsRaw) ? designsRaw : [];
    const architecturesRaw = readJson<ArchitectureRecord[]>("architectures.json");
    const architecturesList = Array.isArray(architecturesRaw) ? architecturesRaw : [];

    const promptIds = Array.isArray(project.promptIds) ? project.promptIds : [];
    const ticketIds = Array.isArray(project.ticketIds) ? project.ticketIds : [];
    const featureIds = Array.isArray(project.featureIds) ? project.featureIds : [];
    const ideaIds = Array.isArray(project.ideaIds) ? project.ideaIds : [];
    const designIds = Array.isArray((project as { designIds?: string[] }).designIds) ? (project as { designIds: string[] }).designIds : [];
    const architectureIds = Array.isArray((project as { architectureIds?: string[] }).architectureIds) ? (project as { architectureIds: string[] }).architectureIds : [];

    const prompts = (promptIds as number[])
      .map((pid) => promptsList.find((p) => Number(p.id) === pid))
      .filter(Boolean) as ProjectExport["prompts"];
    const tickets = ticketIds
      .map((tid) => ticketsList.find((t) => t.id === tid))
      .filter(Boolean) as ProjectExport["tickets"];
    const features = featureIds
      .map((fid) => featuresList.find((f) => f.id === fid))
      .filter(Boolean) as ProjectExport["features"];
    const ideas = ideaIds
      .map((iid) => ideasList.find((i) => Number(i.id) === iid))
      .filter(Boolean) as ProjectExport["ideas"];
    const designs = designIds
      .map((did) => designsList.find((d) => d.id === did))
      .filter(Boolean) as DesignRecord[];
    const architectures = architectureIds
      .map((aid) => architecturesList.find((a) => a.id === aid))
      .filter(Boolean) as ArchitectureRecord[];

    const payload: ProjectExport = {
      exportedAt: new Date().toISOString(),
      project,
      prompts,
      tickets,
      features,
      ideas,
      designs,
      architectures,
    };

    return NextResponse.json(payload);
  } catch (e) {
    console.error("Project export error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to export project" },
      { status: 500 }
    );
  }
}

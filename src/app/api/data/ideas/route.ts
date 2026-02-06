import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

function findDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

const DATA_DIR = findDataDir();
const IDEAS_FILE = path.join(DATA_DIR, "ideas.json");

export type IdeaCategory =
  | "saas"
  | "iaas"
  | "paas"
  | "website"
  | "webapp"
  | "webshop"
  | "other";

export interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: IdeaCategory;
  source: "template" | "ai" | "manual";
  created_at?: string;
  updated_at?: string;
}

function readIdeas(): IdeaRecord[] {
  try {
    if (!fs.existsSync(IDEAS_FILE)) return [];
    const raw = fs.readFileSync(IDEAS_FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeIdeas(ideas: IdeaRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2), "utf-8");
}

export async function GET() {
  try {
    const ideas = readIdeas();
    return NextResponse.json(ideas);
  } catch (e) {
    console.error("Ideas GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load ideas" },
      { status: 500 }
    );
  }
}

const CATEGORIES = new Set<string>([
  "saas", "iaas", "paas", "website", "webapp", "webshop", "other",
]);
const SOURCES = new Set<string>(["template", "ai", "manual"]);

/** POST: create or update. Body: { id?: number, title, description, category, source } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = CATEGORIES.has(String(body.category)) ? body.category : "other";
    const source = body.source !== undefined && SOURCES.has(String(body.source))
      ? body.source
      : undefined;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const ideas = readIdeas();
    const existingId = typeof body.id === "number" ? body.id : undefined;
    const now = new Date().toISOString();

    if (existingId !== undefined) {
      const idx = ideas.findIndex((i) => Number(i.id) === existingId);
      if (idx >= 0) {
        ideas[idx] = {
          ...ideas[idx],
          title,
          description,
          category,
          ...(source !== undefined && { source }),
          updated_at: now,
        };
        writeIdeas(ideas);
        return NextResponse.json(ideas[idx]);
      }
    }

    const nextId =
      ideas.length === 0 ? 1 : Math.max(...ideas.map((i) => Number(i.id)), 0) + 1;
    const newIdea: IdeaRecord = {
      id: nextId,
      title,
      description,
      category,
      source: source ?? "manual",
      created_at: now,
      updated_at: now,
    };
    ideas.push(newIdea);
    writeIdeas(ideas);
    return NextResponse.json(newIdea);
  } catch (e) {
    console.error("Ideas POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save idea" },
      { status: 500 }
    );
  }
}

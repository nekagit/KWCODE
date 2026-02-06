import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { IdeaRecord } from "../route";

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

/** GET: single idea by id (numeric, passed as URL segment) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "Invalid idea id" }, { status: 400 });
    }
    const ideas = readIdeas();
    const record = ideas.find((i) => Number(i.id) === numId);
    if (!record) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (e) {
    console.error("Idea GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load idea" },
      { status: 500 }
    );
  }
}

/** DELETE: remove idea */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "Invalid idea id" }, { status: 400 });
    }
    const ideas = readIdeas();
    const filtered = ideas.filter((i) => Number(i.id) !== numId);
    if (filtered.length === ideas.length) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    writeIdeas(filtered);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Idea DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete idea" },
      { status: 500 }
    );
  }
}

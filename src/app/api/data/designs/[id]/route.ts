import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { DesignConfig } from "@/types/design";

export interface DesignRecord {
  id: string;
  name: string;
  config: DesignConfig;
  created_at: string;
  updated_at: string;
}

function findDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

const DATA_DIR = findDataDir();
const DESIGNS_FILE = path.join(DATA_DIR, "designs.json");

function readDesigns(): DesignRecord[] {
  try {
    if (!fs.existsSync(DESIGNS_FILE)) return [];
    const raw = fs.readFileSync(DESIGNS_FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeDesigns(designs: DesignRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DESIGNS_FILE, JSON.stringify(designs, null, 2), "utf-8");
}

/** GET: single design */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designs = readDesigns();
    const design = designs.find((d) => d.id === id);
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }
    return NextResponse.json(design);
  } catch (e) {
    console.error("Design GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load design" },
      { status: 500 }
    );
  }
}

/** PUT: update design. Body: { name?, config? } */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const designs = readDesigns();
    const idx = designs.findIndex((d) => d.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }
    const now = new Date().toISOString();
    const updated: DesignRecord = {
      ...designs[idx],
      ...(typeof body.name === "string" && { name: body.name.trim() }),
      ...(body.config && typeof body.config === "object" && { config: body.config as DesignConfig }),
      updated_at: now,
    };
    designs[idx] = updated;
    writeDesigns(designs);
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Design PUT error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update design" },
      { status: 500 }
    );
  }
}

/** DELETE: remove design */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designs = readDesigns();
    const filtered = designs.filter((d) => d.id !== id);
    if (filtered.length === designs.length) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }
    writeDesigns(filtered);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Design DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete design" },
      { status: 500 }
    );
  }
}

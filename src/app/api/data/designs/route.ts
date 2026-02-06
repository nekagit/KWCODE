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

/** GET: list all designs (id, name for link section) */
export async function GET() {
  try {
    const designs = readDesigns();
    return NextResponse.json(designs);
  } catch (e) {
    console.error("Designs GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load designs" },
      { status: 500 }
    );
  }
}

/** POST: create design. Body: { name, config: DesignConfig } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const config = body.config as DesignConfig | undefined;
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "config is required" }, { status: 400 });
    }
    const designs = readDesigns();
    const now = new Date().toISOString();
    const newDesign: DesignRecord = {
      id: crypto.randomUUID(),
      name,
      config,
      created_at: now,
      updated_at: now,
    };
    designs.push(newDesign);
    writeDesigns(designs);
    return NextResponse.json(newDesign);
  } catch (e) {
    console.error("Designs POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create design" },
      { status: 500 }
    );
  }
}

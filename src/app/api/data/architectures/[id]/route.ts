import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { ArchitectureRecord } from "@/types/architecture";

function findDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

const DATA_DIR = findDataDir();
const ARCHITECTURES_FILE = path.join(DATA_DIR, "architectures.json");

const CATEGORIES = new Set<string>([
  "ddd", "tdd", "bdd", "dry", "solid", "kiss", "yagni",
  "clean", "hexagonal", "cqrs", "event_sourcing", "microservices",
  "rest", "graphql", "scenario",
]);

function readArchitectures(): ArchitectureRecord[] {
  try {
    if (!fs.existsSync(ARCHITECTURES_FILE)) return [];
    const raw = fs.readFileSync(ARCHITECTURES_FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeArchitectures(architectures: ArchitectureRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ARCHITECTURES_FILE, JSON.stringify(architectures, null, 2), "utf-8");
}

/** GET: single architecture */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const architectures = readArchitectures();
    const record = architectures.find((a) => a.id === id);
    if (!record) {
      return NextResponse.json({ error: "Architecture not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (e) {
    console.error("Architecture GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load architecture" },
      { status: 500 }
    );
  }
}

function parseExtraInputs(v: unknown): Record<string, string> | undefined {
  if (v == null || typeof v !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof k === "string" && typeof val === "string" && k.trim()) {
      out[k.trim()] = val.trim();
    }
  }
  return Object.keys(out).length ? out : undefined;
}

/** PATCH: update architecture. Body: { name?, category?, description?, practices?, scenarios?, references?, anti_patterns?, examples?, extra_inputs? } */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const architectures = readArchitectures();
    const idx = architectures.findIndex((a) => a.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "Architecture not found" }, { status: 404 });
    }
    const now = new Date().toISOString();
    const extra = parseExtraInputs(body.extra_inputs);
    const updated: ArchitectureRecord = {
      ...architectures[idx],
      ...(typeof body.name === "string" && { name: body.name.trim() }),
      ...(CATEGORIES.has(String(body.category)) && { category: body.category }),
      ...(typeof body.description === "string" && { description: body.description.trim() }),
      ...(typeof body.practices === "string" && { practices: body.practices.trim() }),
      ...(typeof body.scenarios === "string" && { scenarios: body.scenarios.trim() }),
      ...(body.references !== undefined && { references: typeof body.references === "string" ? body.references.trim() || undefined : undefined }),
      ...(body.anti_patterns !== undefined && { anti_patterns: typeof body.anti_patterns === "string" ? body.anti_patterns.trim() || undefined : undefined }),
      ...(body.examples !== undefined && { examples: typeof body.examples === "string" ? body.examples.trim() || undefined : undefined }),
      ...(extra !== undefined && { extra_inputs: extra }),
      updated_at: now,
    };
    architectures[idx] = updated;
    writeArchitectures(architectures);
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Architecture PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update architecture" },
      { status: 500 }
    );
  }
}

/** DELETE: remove architecture */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const architectures = readArchitectures();
    const filtered = architectures.filter((a) => a.id !== id);
    if (filtered.length === architectures.length) {
      return NextResponse.json({ error: "Architecture not found" }, { status: 404 });
    }
    writeArchitectures(filtered);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Architecture DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete architecture" },
      { status: 500 }
    );
  }
}

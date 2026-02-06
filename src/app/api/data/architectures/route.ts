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

/** GET: list all architectures */
export async function GET() {
  try {
    const architectures = readArchitectures();
    return NextResponse.json(architectures);
  } catch (e) {
    console.error("Architectures GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load architectures" },
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

/** POST: create architecture. Body: { name, category, description, practices?, scenarios?, references?, anti_patterns?, examples?, extra_inputs? } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = CATEGORIES.has(String(body.category)) ? body.category : "scenario";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const practices = typeof body.practices === "string" ? body.practices.trim() : "";
    const scenarios = typeof body.scenarios === "string" ? body.scenarios.trim() : "";
    const references = typeof body.references === "string" ? body.references.trim() : undefined;
    const anti_patterns = typeof body.anti_patterns === "string" ? body.anti_patterns.trim() : undefined;
    const examples = typeof body.examples === "string" ? body.examples.trim() : undefined;
    const extra_inputs = parseExtraInputs(body.extra_inputs);

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const architectures = readArchitectures();
    const now = new Date().toISOString();
    const newRecord: ArchitectureRecord = {
      id: crypto.randomUUID(),
      name,
      category,
      description,
      practices,
      scenarios,
      ...(references !== undefined && { references: references || undefined }),
      ...(anti_patterns !== undefined && { anti_patterns: anti_patterns || undefined }),
      ...(examples !== undefined && { examples: examples || undefined }),
      ...(extra_inputs && { extra_inputs }),
      created_at: now,
      updated_at: now,
    };
    architectures.push(newRecord);
    writeArchitectures(architectures);
    return NextResponse.json(newRecord);
  } catch (e) {
    console.error("Architectures POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create architecture" },
      { status: 500 }
    );
  }
}

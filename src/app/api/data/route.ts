import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

function findDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return inCwd;
}
const DATA_DIR = findDataDir();

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

export async function GET() {
  try {
    if (!fs.existsSync(DATA_DIR) || !fs.statSync(DATA_DIR).isDirectory()) {
      return NextResponse.json(
        { error: `Data directory not found: ${DATA_DIR}` },
        { status: 500 }
      );
    }
    const allProjects = readJson<string[]>("all_projects.json") ?? [];
    const activeProjects = readJson<string[]>("cursor_projects.json") ?? [];
    const tickets = readJson<unknown[]>("tickets.json") ?? [];
    const features = readJson<unknown[]>("features.json") ?? [];

    const promptsRaw = readJson<{ id: number; title: string }[]>("prompts-export.json");
    const prompts = Array.isArray(promptsRaw)
      ? promptsRaw.map((p) => ({ id: Number(p.id), title: p.title ?? "" }))
      : [];

    // KV-style entries for browser Data tab (mirrors SQLite kv_store)
    const kvEntries = [
      { key: "all_projects", value: JSON.stringify(allProjects, null, 2) },
      { key: "cursor_projects", value: JSON.stringify(activeProjects, null, 2) },
    ];

    return NextResponse.json({
      allProjects,
      activeProjects,
      prompts,
      tickets,
      features,
      kvEntries,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load data";
    console.error("API data load error:", message, e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

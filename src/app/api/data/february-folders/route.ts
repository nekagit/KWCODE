import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/** All direct subdirectories under dir. No filter by name—every folder is included. */
function listSubdirPaths(dir: string): string[] {
  const folders: string[] = [];
  try {
    const names = fs.readdirSync(dir, { withFileTypes: true });
    for (const d of names) {
      const isDir = d.isDirectory();
      const isLink = d.isSymbolicLink();
      if (!isDir && !isLink) continue;
      const full = path.join(dir, d.name);
      try {
        folders.push(fs.realpathSync(full));
      } catch {
        folders.push(path.resolve(full));
      }
    }
  } catch {
    // ignore unreadable dir
  }
  return folders;
}

function getDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

/** Read projects root path from data/february-dir.txt (one line). Highest priority. */
function februaryDirFromDataFile(): string | null {
  const dataDir = getDataDir();
  const filePath = path.join(dataDir, "february-dir.txt");
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8");
    const line = content.split("\n")[0]?.trim();
    if (!line) return null;
    const resolved = path.resolve(line);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) return resolved;
  } catch {
    // ignore
  }
  return null;
}

/**
 * GET /api/data/february-folders
 * Returns all subdirectories of the configured projects root. No filter by name.
 * Priority: data/february-dir.txt, then FEBRUARY_DIR env, then parent of cwd.
 */
export async function GET() {
  try {
    const candidates: string[] = [];
    const addCandidate = (p: string) => {
      try {
        const resolved = fs.realpathSync(p);
        if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory() && !candidates.includes(resolved))
          candidates.push(resolved);
      } catch {
        const abs = path.resolve(p);
        if (fs.existsSync(abs) && fs.statSync(abs).isDirectory() && !candidates.includes(abs)) candidates.push(abs);
      }
    };
    const fromFile = februaryDirFromDataFile();
    if (fromFile) addCandidate(fromFile);
    if (candidates.length === 0 && process.env.FEBRUARY_DIR?.trim()) {
      addCandidate(process.env.FEBRUARY_DIR.trim());
    }
    if (candidates.length === 0) {
      addCandidate(path.resolve(process.cwd(), ".."));
    }

    const seen = new Set<string>();
    const folders: string[] = [];
    for (const dir of candidates) {
      for (const full of listSubdirPaths(dir)) {
        if (!seen.has(full)) {
          seen.add(full);
          folders.push(full);
        }
      }
    }
    folders.sort();
    return NextResponse.json({ folders });
  } catch (e) {
    console.error("february-folders error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list project folders" },
      { status: 500 }
    );
  }
}

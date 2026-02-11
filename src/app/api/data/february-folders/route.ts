import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/** Collect full paths of all direct subdirectories; include dirs and symlinks so none are missed. */
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

/**
 * GET /api/data/february-folders
 * Returns full paths of all subdirectories of the February folder(s).
 * Uses (1) FEBRUARY_DIR env, (2) ~/Documents/February, (3) parent of cwd. Merges all so none are missed.
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
    if (process.env.FEBRUARY_DIR) addCandidate(process.env.FEBRUARY_DIR);
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) addCandidate(path.join(home, "Documents", "February"));
    addCandidate(path.resolve(process.cwd(), ".."));

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
      { error: e instanceof Error ? e.message : "Failed to list February folders" },
      { status: 500 }
    );
  }
}

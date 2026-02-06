import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/**
 * GET /api/data/february-folders
 * Returns full paths of all subdirectories of the parent of cwd (Documents/February).
 * Used by the Projects page Local projects card so all February folders are always shown.
 */
export async function GET() {
  try {
    const cwd = process.cwd();
    const februaryDir = path.resolve(cwd, "..");
    if (!fs.existsSync(februaryDir) || !fs.statSync(februaryDir).isDirectory()) {
      return NextResponse.json({ folders: [] });
    }
    const names = fs.readdirSync(februaryDir, { withFileTypes: true });
    const folders: string[] = [];
    for (const d of names) {
      if (!d.isDirectory()) continue;
      const full = path.join(februaryDir, d.name);
      try {
        folders.push(path.resolve(full));
      } catch {
        // skip if resolve fails
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

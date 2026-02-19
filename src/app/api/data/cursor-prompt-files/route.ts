/** route component. */
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-static";

const ROOT = process.cwd();
const CURSOR_DIR = path.join(ROOT, ".cursor");

export type CursorPromptFileEntry = {
  /** Relative path from .cursor (e.g. "1. project/prompts/design.prompt.md") */
  relativePath: string;
  /** Full path under root (e.g. ".cursor/1. project/prompts/design.prompt.md") */
  path: string;
  /** File name (e.g. "design.prompt.md") */
  name: string;
  /** Size in bytes */
  size: number;
  /** ISO date string of mtime */
  updatedAt: string;
};

function walkPromptMdFiles(dir: string, prefix: string): CursorPromptFileEntry[] {
  const results: CursorPromptFileEntry[] = [];
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...walkPromptMdFiles(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".prompt.md")) {
      const stat = fs.statSync(fullPath);
      results.push({
        relativePath,
        path: `.cursor/${relativePath}`,
        name: entry.name,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
      });
    }
  }
  return results;
}

/**
 * GET: List all *.prompt.md files under .cursor.
 * Used by the Prompts page ".cursor prompts" tab to keep the table in sync with the repo.
 */
export async function GET() {
  try {
    const files = walkPromptMdFiles(CURSOR_DIR, "").sort((a, b) =>
      a.path.localeCompare(b.path)
    );
    return NextResponse.json({ files });
  } catch (e) {
    console.error("cursor-prompt-files GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list .cursor prompt files" },
      { status: 500 }
    );
  }
}

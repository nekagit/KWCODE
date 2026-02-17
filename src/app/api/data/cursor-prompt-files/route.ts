import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-static";

const ROOT = process.cwd();
const CURSOR_DIR = path.join(ROOT, ".cursor");
const CURSOR_TEMPLATE_DIR = path.join(ROOT, ".cursor_template");

export type CursorPromptFileEntry = {
  /** Relative path from .cursor or .cursor_template (e.g. "1. project/prompts/design.prompt.md") */
  relativePath: string;
  /** Full path under root (e.g. ".cursor/1. project/prompts/design.prompt.md") */
  path: string;
  /** File name (e.g. "design.prompt.md") */
  name: string;
  /** Size in bytes */
  size: number;
  /** ISO date string of mtime */
  updatedAt: string;
  /** ".cursor" or ".cursor_template" */
  source: ".cursor" | ".cursor_template";
};

function walkPromptMdFiles(
  dir: string,
  prefix: string,
  source: ".cursor" | ".cursor_template"
): CursorPromptFileEntry[] {
  const results: CursorPromptFileEntry[] = [];
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(
        ...walkPromptMdFiles(fullPath, relativePath, source)
      );
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".prompt.md")) {
      const stat = fs.statSync(fullPath);
      results.push({
        relativePath,
        path: source === ".cursor" ? `.cursor/${relativePath}` : `.cursor_template/${relativePath}`,
        name: entry.name,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
        source,
      });
    }
  }
  return results;
}

/**
 * GET: List all *.prompt.md files under .cursor and .cursor_template.
 * Used by the Prompts page "Cursor prompts" tab to keep the table in sync with the repo.
 */
export async function GET() {
  try {
    const fromCursor = walkPromptMdFiles(CURSOR_DIR, "", ".cursor");
    const fromTemplate = walkPromptMdFiles(CURSOR_TEMPLATE_DIR, "", ".cursor_template");
    const files: CursorPromptFileEntry[] = [...fromCursor, ...fromTemplate].sort((a, b) =>
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

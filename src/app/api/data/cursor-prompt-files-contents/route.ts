import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-static";

const ROOT = process.cwd();
const CURSOR_DIR = path.join(ROOT, ".cursor");

export type CursorPromptFileWithContent = {
  relativePath: string;
  path: string;
  name: string;
  content: string;
  updatedAt: string;
};

function walkAndReadPromptMdFiles(dir: string, prefix: string): CursorPromptFileWithContent[] {
  const results: CursorPromptFileWithContent[] = [];
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...walkAndReadPromptMdFiles(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".prompt.md")) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const stat = fs.statSync(fullPath);
        results.push({
          relativePath,
          path: `.cursor/${relativePath}`,
          name: entry.name,
          content,
          updatedAt: stat.mtime.toISOString(),
        });
      } catch {
        // skip unreadable files
      }
    }
  }
  return results;
}

/**
 * GET: List all *.prompt.md files under .cursor with their content.
 * Used for exporting all .cursor prompts as JSON or Markdown.
 * Path is /api/data/cursor-prompt-files-contents to avoid static-export conflict with cursor-prompt-files/contents.
 */
export async function GET() {
  try {
    const files = walkAndReadPromptMdFiles(CURSOR_DIR, "").sort((a, b) =>
      a.path.localeCompare(b.path)
    );
    return NextResponse.json({ files });
  } catch (e) {
    console.error("cursor-prompt-files-contents GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to read .cursor prompt files" },
      { status: 500 }
    );
  }
}

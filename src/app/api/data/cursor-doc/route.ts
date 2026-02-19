/** route component. */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-static";

/**
 * GET: Read a file from process.cwd()/.cursor/ (app root .cursor folder).
 * Query param: path = relative path under .cursor (e.g. "0. ideas/ideas.md", "1. project/design.md").
 * Used as fallback when project repo read returns empty so tabs show content when project is the app repo.
 */
export async function GET(request: NextRequest) {
  if (process.env.TAURI_BUILD === "1") return NextResponse.json({ content: null }, { status: 200 });
  try {
    const { searchParams } = new URL(request.url);
    const relativeParam = searchParams.get("path");
    if (!relativeParam || typeof relativeParam !== "string") {
      return NextResponse.json({ content: null }, { status: 200 });
    }
    const trimmed = relativeParam.trim();
    if (trimmed.startsWith("..") || trimmed.includes("..") || path.isAbsolute(trimmed)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    const cwd = process.cwd();
    const cursorDirResolved = path.resolve(cwd, ".cursor");
    const filePath = path.resolve(cursorDirResolved, path.normalize(trimmed));
    if (!filePath.startsWith(cursorDirResolved)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return NextResponse.json({ content: null }, { status: 200 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch (e) {
    console.error("Cursor doc read error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to read file" },
      { status: 500 }
    );
  }
}

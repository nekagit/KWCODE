import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

function getDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

/**
 * GET /api/data/february-repos-overview
 * Returns repos overview from data/february-repos-overview.json when present; otherwise [].
 * No hardcoded projects—data is config-driven.
 */
export async function GET() {
  try {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, "february-repos-overview.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ overview: [], summary: { totalRepos: 0, commonTech: [] } });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    const overview = Array.isArray(data.overview) ? data.overview : Array.isArray(data) ? data : [];
    const summary =
      data && typeof data.summary === "object"
        ? { totalRepos: data.summary.totalRepos ?? overview.length, commonTech: data.summary.commonTech ?? [] }
        : { totalRepos: overview.length, commonTech: [] };
    return NextResponse.json({ overview, summary });
  } catch (e) {
    console.error("february-repos-overview error:", e);
    return NextResponse.json(
      { overview: [], summary: { totalRepos: 0, commonTech: [] } },
      { status: 200 }
    );
  }
}

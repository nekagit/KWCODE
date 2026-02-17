import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { Project } from "@/types/project";
import { repoAllowed } from "@/lib/repo-allowed";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

function findDataDir(): string {
    const cwd = process.cwd();
    const inCwd = path.join(cwd, "data");
    if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
    const inParent = path.join(cwd, "..", "data");
    if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
    return cwd;
}

const DATA_DIR = findDataDir();
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

function readProjects(): Project[] {
    try {
        if (!fs.existsSync(PROJECTS_FILE)) return [];
        const raw = fs.readFileSync(PROJECTS_FILE, "utf-8");
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projects = readProjects();
        const project = projects.find((p) => p.id === id);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        const repoPath = project.repoPath?.trim();
        if (!repoPath) {
            return NextResponse.json(
                { error: "Project has no repo path; cannot list files" },
                { status: 400 }
            );
        }
        const { searchParams } = new URL(request.url);
        const relativePath = searchParams.get("path") || "";

        // Validate path
        const normalized = path.normalize(relativePath.trim());
        if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
            return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        const cwd = process.cwd();
        const resolvedRepo = path.resolve(repoPath);

        if (!repoAllowed(resolvedRepo, cwd)) {
            return NextResponse.json(
                { error: "Project repo is outside app directory; file access not allowed" },
                { status: 403 }
            );
        }

        const resolved = path.resolve(resolvedRepo, normalized);
        if (!resolved.startsWith(resolvedRepo)) {
            return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        if (!fs.existsSync(resolved)) {
            return NextResponse.json({ error: "Path not found" }, { status: 404 });
        }

        const stats = fs.statSync(resolved);
        if (!stats.isDirectory()) {
            return NextResponse.json({ error: "Path is not a directory" }, { status: 400 });
        }

        const entries = fs.readdirSync(resolved, { withFileTypes: true });

        const files = entries.map((entry) => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            size: entry.isDirectory() ? 0 : fs.statSync(path.join(resolved, entry.name)).size,
            updatedAt: fs.statSync(path.join(resolved, entry.name)).mtime,
        }));

        return NextResponse.json({ files });
    } catch (e) {
        console.error("Project file list error:", e);
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Failed to list files" },
            { status: 500 }
        );
    }
}

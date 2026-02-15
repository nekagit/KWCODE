import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import type { Project } from "@/types/project";

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

function readFileInRepo(repoPath: string, relativePath: string, cwd: string): string | null {
  const normalized = path.normalize(relativePath.trim());
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null;
  const resolvedRepo = path.resolve(repoPath);
  if (!resolvedRepo.startsWith(cwd)) return null;
  const resolved = path.resolve(resolvedRepo, normalized);
  if (!resolved.startsWith(resolvedRepo)) return null;
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return null;
  return fs.readFileSync(resolved, "utf-8");
}

function writeFileInRepo(repoPath: string, relativePath: string, content: string, cwd: string): boolean {
  const normalized = path.normalize(relativePath.trim());
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return false;
  const resolvedRepo = path.resolve(repoPath);
  if (!resolvedRepo.startsWith(cwd)) return false;
  const resolved = path.resolve(resolvedRepo, normalized);
  if (!resolved.startsWith(resolvedRepo)) return false;
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolved, content, "utf-8");
  return true;
}

/** Strip markdown code fence if present (e.g. ```md ... ```). */
function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(\w*)\n?([\s\S]*?)```$/);
  if (fence) return fence[2].trim();
  return trimmed;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  let body: { projectId: string; promptPath: string; outputPath: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
  const promptPath = typeof body.promptPath === "string" ? body.promptPath.trim() : "";
  const outputPath = typeof body.outputPath === "string" ? body.outputPath.trim() : "";

  if (!projectId || !promptPath || !outputPath) {
    return NextResponse.json(
      { error: "Missing projectId, promptPath, or outputPath" },
      { status: 400 }
    );
  }

  const cwd = process.cwd();
  const projects = readProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const repoPath = project.repoPath?.trim();
  if (!repoPath) {
    return NextResponse.json(
      { error: "Project has no repo path; cannot analyze" },
      { status: 400 }
    );
  }

  const resolvedRepo = path.resolve(repoPath);
  if (!resolvedRepo.startsWith(cwd)) {
    return NextResponse.json(
      { error: "Project repo is outside app directory; analysis not allowed" },
      { status: 403 }
    );
  }

  const promptContent = readFileInRepo(repoPath, promptPath, cwd);
  if (!promptContent || !promptContent.trim()) {
    return NextResponse.json(
      { error: `Prompt not found at ${promptPath}` },
      { status: 400 }
    );
  }

  const currentContent = readFileInRepo(repoPath, outputPath, cwd) ?? "";
  const projectName = project.name ?? "Project";

  const systemPrompt = `You are a senior engineer. You will be given the current content of a project document and instructions (a prompt). Your task is to output the updated document content only. Output the full document as markdown (or as instructed). Do not add a preamble, explanation, or code fence—output the document content that should be written to the file. Base the update on the current state and the instructions.`;

  const userContent = [
    `Project: ${projectName}`,
    "",
    "Current content of the target file:",
    currentContent || "(empty or file does not exist yet)",
    "",
    "---",
    "",
    "Instructions (prompt):",
    "",
    promptContent.trim(),
  ].join("\n");

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const content = stripCodeFence(raw);

    const written = writeFileInRepo(repoPath, outputPath, content, cwd);
    if (!written) {
      return NextResponse.json(
        { error: "Failed to write output file (invalid path or permission)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}

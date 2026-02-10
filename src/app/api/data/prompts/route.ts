import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { parseAndValidate, createPromptSchema } from "@/lib/api-validation";

function findDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

const DATA_DIR = findDataDir();
const PROMPTS_FILE = path.join(DATA_DIR, "prompts-export.json");

export interface PromptRecord {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function readPrompts(): PromptRecord[] {
  try {
    if (!fs.existsSync(PROMPTS_FILE)) return [];
    const raw = fs.readFileSync(PROMPTS_FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writePrompts(prompts: PromptRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2), "utf-8");
}

/** GET: return full prompt list (with content) for edit UI */
export async function GET() {
  try {
    const prompts = readPrompts();
    return NextResponse.json(prompts);
  } catch (e) {
    console.error("Prompts GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load prompts" },
      { status: 500 }
    );
  }
}

/** POST: create or update a prompt. Body: { id?: number, title: string, content: string, category?: string } */
export async function POST(request: NextRequest) {
  try {
    const parsed = await parseAndValidate(request, createPromptSchema);
    if (!parsed.success) return parsed.response;
    const body = parsed.data;

    const title = body.title.trim();
    const content = body.content;
    const category = body.category ?? null;

    const prompts = readPrompts();
    const existingId = body.id;
    const now = new Date().toISOString();

    if (existingId !== undefined) {
      const idx = prompts.findIndex((p) => Number(p.id) === existingId);
      if (idx >= 0) {
        prompts[idx] = {
          ...prompts[idx],
          title,
          content,
          category: category ?? prompts[idx].category ?? null,
          updated_at: now,
        };
        writePrompts(prompts);
        return NextResponse.json(prompts[idx]);
      }
    }

    const nextId =
      prompts.length === 0
        ? 1
        : Math.max(...prompts.map((p) => Number(p.id)), 0) + 1;
    const newPrompt: PromptRecord = {
      id: nextId,
      title,
      content,
      category,
      tags: null,
      created_at: now,
      updated_at: now,
    };
    prompts.push(newPrompt);
    writePrompts(prompts);
    return NextResponse.json(newPrompt);
  } catch (e) {
    console.error("Prompts POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save prompt" },
      { status: 500 }
    );
  }
}

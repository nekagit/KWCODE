/** route component. */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { PromptRecordRecord } from "../route";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "1" }];
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
const PROMPTS_FILE = path.join(DATA_DIR, "prompts-export.json");

function readPromptRecords(): PromptRecordRecord[] {
  try {
    if (!fs.existsSync(PROMPTS_FILE)) return [];
    const raw = fs.readFileSync(PROMPTS_FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writePromptRecords(prompts: PromptRecordRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2), "utf-8");
}

/** GET: single prompt by id (numeric, passed as URL segment) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "Invalid prompt id" }, { status: 400 });
    }
    const prompts = readPromptRecords();
    const record = prompts.find((p) => Number(p.id) === numId);
    if (!record) {
      return NextResponse.json({ error: "PromptRecord not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (e) {
    console.error("PromptRecord GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load prompt" },
      { status: 500 }
    );
  }
}

/** DELETE: remove prompt */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "Invalid prompt id" }, { status: 400 });
    }
    const prompts = readPromptRecords();
    const filtered = prompts.filter((p) => Number(p.id) !== numId);
    if (filtered.length === prompts.length) {
      return NextResponse.json({ error: "PromptRecord not found" }, { status: 404 });
    }
    writePromptRecords(filtered);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PromptRecord DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete prompt" },
      { status: 500 }
    );
  }
}

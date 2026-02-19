/** route component. */
import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import {
  parseTicketsMd,
} from "@/lib/todos-kanban";

export const dynamic = "force-static";

const CURSOR_PATH = ".cursor";
const PLANNER_PATH = `${CURSOR_PATH}/7. planner`;

function resolveCursorPath(relativePath: string): string {
  return path.join(process.cwd(), relativePath);
}

async function safeReadFile(filePath: string, defaultValue: string = ""): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") {
      return defaultValue;
    }
    throw error;
  }
}

async function getAllProjects(): Promise<string[]> {
  const projectsContent = await safeReadFile(resolveCursorPath(`${CURSOR_PATH}/projects.json`), "[]");
  try {
    const projects = JSON.parse(projectsContent);
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
}

async function getActiveProjects(): Promise<string[]> {
  const projectsContent = await safeReadFile(resolveCursorPath(`${CURSOR_PATH}/projects.json`), "[]");
  try {
    const projects = JSON.parse(projectsContent);
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
}

async function getPromptsData(): Promise<{ id: number; title: string }[]> {
  const promptsContent = await safeReadFile(resolveCursorPath(`${CURSOR_PATH}/prompt-records.json`), "[]");
  try {
    const prompts = JSON.parse(promptsContent);
    return Array.isArray(prompts) ? prompts : [];
  } catch {
    return [];
  }
}

async function getDesignsData(): Promise<unknown[]> {
  const designsContent = await safeReadFile(resolveCursorPath(`${CURSOR_PATH}/designs.json`), "[]");
  try {
    const designs = JSON.parse(designsContent);
    return Array.isArray(designs) ? designs : [];
  } catch {
    return [];
  }
}

async function getTicketsData(): Promise<unknown[]> {
  const ticketsMd = await safeReadFile(resolveCursorPath(`${PLANNER_PATH}/tickets.md`), "");
  return parseTicketsMd(ticketsMd);
}

export async function GET() {
  try {
    const allProjects = await getAllProjects();
    const activeProjects = await getActiveProjects();
    const tickets = await getTicketsData();
    const prompts = await getPromptsData();
    const designs = await getDesignsData();

    // KV-style entries for browser Data tab (mirrors SQLite kv_store)
    const kvEntries = [
      { key: "all_projects", value: JSON.stringify(allProjects, null, 2) },
      { key: "cursor_projects", value: JSON.stringify(activeProjects, null, 2) },
    ];

    return NextResponse.json({
      allProjects,
      activeProjects,
      prompts,
      tickets,
      designs,
      kvEntries,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load data";
    console.error("API data load error:", message, e);
    return NextResponse.json(
      {
        allProjects: [],
        activeProjects: [],
        prompts: [],
        tickets: [],
        designs: [],
        kvEntries: [],
        error: message,
      },
      { status: 500 }
    );
  }
}

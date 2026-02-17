import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { parseTicketsMd } from "@/lib/todos-kanban";

export const dynamic = "force-static";

const CURSOR_PATH = ".cursor";
const PLANNER_PATH = `${CURSOR_PATH}/7. planner`;
const TICKETS_MD_PATH = `${PLANNER_PATH}/tickets.md`;
const PROMPTS_JSON_PATH = `${CURSOR_PATH}/prompt-records.json`;
const DESIGNS_JSON_PATH = `${CURSOR_PATH}/designs.json`;
const PROJECTS_JSON_PATH = `${CURSOR_PATH}/projects.json`;

async function safeReadFile(filePath: string, defaultValue: string = ""): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return defaultValue;
    }
    throw err;
  }
}

export interface DashboardMetricsResponse {
  tickets_count: number;
  prompts_count: number;
  designs_count: number;
  active_projects_count: number;
  all_projects_count: number;
}

export async function GET() {
  try {
    const cwd = process.cwd();
    const resolve = (p: string) => path.join(cwd, p);

    const [ticketsMd, promptsRaw, designsRaw, projectsRaw] = await Promise.all([
      safeReadFile(resolve(TICKETS_MD_PATH)),
      safeReadFile(resolve(PROMPTS_JSON_PATH), "[]"),
      safeReadFile(resolve(DESIGNS_JSON_PATH), "[]"),
      safeReadFile(resolve(PROJECTS_JSON_PATH), "[]"),
    ]);

    const tickets = parseTicketsMd(ticketsMd);
    const prompts = Array.isArray(JSON.parse(promptsRaw)) ? JSON.parse(promptsRaw) : [];
    const designs = Array.isArray(JSON.parse(designsRaw)) ? JSON.parse(designsRaw) : [];
    const projects = Array.isArray(JSON.parse(projectsRaw)) ? JSON.parse(projectsRaw) : [];

    const body: DashboardMetricsResponse = {
      tickets_count: tickets.length,
      prompts_count: prompts.length,
      designs_count: designs.length,
      active_projects_count: projects.length,
      all_projects_count: projects.length,
    };

    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load dashboard metrics";
    console.error("dashboard-metrics error:", message, e);
    return NextResponse.json(
      {
        tickets_count: 0,
        prompts_count: 0,
        designs_count: 0,
        active_projects_count: 0,
        all_projects_count: 0,
        error: message,
      },
      { status: 200 }
    );
  }
}

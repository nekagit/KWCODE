import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import {
  parseFeaturesMd,
  parseTicketsMd,
} from "@/lib/todos-kanban";

const CURSOR_PATH = ".cursor";
const FEATURES_MD_PATH = `${CURSOR_PATH}/features.md`;
const TICKETS_MD_PATH = `${CURSOR_PATH}/tickets.md`;
const PROMPTS_JSON_PATH = `${CURSOR_PATH}/prompt-records.json`; // Assuming prompts are stored in a JSON file
const DESIGNS_JSON_PATH = `${CURSOR_PATH}/designs.json`; // Assuming designs are stored in a JSON file
const PROJECTS_JSON_PATH = `${CURSOR_PATH}/projects.json`; // Assuming active projects are stored in a JSON file

async function safeReadFile(path: string, defaultValue: string = ""): Promise<string> {
  try {
    return await fs.readFile(path, "utf-8");
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return defaultValue;
    }
    throw error;
  }
}

async function getAllProjects(): Promise<string[]> {
  // In a real scenario, this would dynamically discover all projects.
  // For now, return a placeholder or read from a configuration file.
  // Given the git status, it seems like projects are represented by repo paths.
  // We'll read from projects.json if it exists, otherwise return a mock.
  const projectsContent = await safeReadFile(PROJECTS_JSON_PATH, "[]");
  try {
    const projects = JSON.parse(projectsContent);
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
}

async function getActiveProjects(): Promise<string[]> {
  const projectsContent = await safeReadFile(PROJECTS_JSON_PATH, "[]");
  try {
    const projects = JSON.parse(projectsContent);
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
}

async function getPromptsData(): Promise<{ id: number; title: string }[]> {
  const promptsContent = await safeReadFile(PROMPTS_JSON_PATH, "[]");
  try {
    const prompts = JSON.parse(promptsContent);
    return Array.isArray(prompts) ? prompts : [];
  } catch {
    return [];
  }
}

async function getDesignsData(): Promise<unknown[]> {
  const designsContent = await safeReadFile(DESIGNS_JSON_PATH, "[]");
  try {
    const designs = JSON.parse(designsContent);
    return Array.isArray(designs) ? designs : [];
  } catch {
    return [];
  }
}

async function getFeaturesData(): Promise<unknown[]> {
  const featuresMd = await safeReadFile(FEATURES_MD_PATH);
  return parseFeaturesMd(featuresMd);
}

async function getTicketsData(): Promise<unknown[]> {
  const ticketsMd = await safeReadFile(TICKETS_MD_PATH);
  return parseTicketsMd(ticketsMd);
}

export async function GET() {
  try {
    const allProjects = await getAllProjects();
    const activeProjects = await getActiveProjects();
    const tickets = await getTicketsData();
    const features = await getFeaturesData();
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
      features,
      designs,
      kvEntries,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load data";
    console.error("API data load error:", message, e);
    return NextResponse.json({
      allProjects: [],
      activeProjects: [],
      prompts: [],
      tickets: [],
      features: [],
      designs: [],
      kvEntries: [],
      error: message,
    });
  }
}

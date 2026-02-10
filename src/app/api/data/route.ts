import { NextResponse } from "next/server";
import { invoke } from "@tauri-apps/api/tauri";

export async function GET() {
  try {
    const allProjects = (await invoke("get_all_projects")) as string[];
    const activeProjects = (await invoke("get_active_projects")) as string[];
    const tickets = (await invoke("get_tickets")) as unknown[];
    const features = (await invoke("get_features")) as unknown[];
    const prompts = (await invoke("get_prompts")) as { id: number; title: string }[];
    const designs = (await invoke("get_designs")) as unknown[]; // New designs data

    // KV-style entries for browser Data tab (mirrors SQLite kv_store)
    const kvEntries = [
      { key: "all_projects", value: JSON.stringify(allProjects, null, 2) },
      { key: "cursor_projects", value: JSON.stringify(activeProjects, null, 2) },
      // Add other key-value pairs if needed, or remove if not relevant
    ];

    return NextResponse.json({
      allProjects,
      activeProjects,
      prompts,
      tickets,
      features,
      designs, // Include designs
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
      designs: [], // Ensure designs is included here too
      kvEntries: [],
      error: message,
    });
  }
}

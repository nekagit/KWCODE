import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import type { Project, ProjectEntityCategories, EntityCategory } from "@/types/project";
import type { ArchitectureRecord } from "@/types/architecture";
import type { DesignConfig, SectionKind, PageTemplateId } from "@/types/design";

function findDataDir(): string {
  const cwd = process.cwd();
  const inCwd = path.join(cwd, "data");
  if (fs.existsSync(inCwd) && fs.statSync(inCwd).isDirectory()) return inCwd;
  const inParent = path.join(cwd, "..", "data");
  if (fs.existsSync(inParent) && fs.statSync(inParent).isDirectory()) return inParent;
  return cwd;
}

const DATA_DIR = findDataDir();

function readJson<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function writeJson(filename: string, data: unknown): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  source: string;
  created_at?: string;
  updated_at?: string;
}

interface PromptRecord {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const ARCH_CATEGORIES = new Set<string>([
  "ddd", "tdd", "bdd", "dry", "solid", "kiss", "yagni",
  "clean", "hexagonal", "cqrs", "event_sourcing", "microservices",
  "rest", "graphql", "scenario",
]);
const PAGE_TEMPLATES = new Set<string>(["landing", "contact", "about", "pricing", "blog", "dashboard", "auth", "docs", "product", "custom"]);
const SECTION_KINDS = new Set<string>(["hero", "features", "testimonials", "cta", "pricing", "faq", "team", "contact-form", "footer", "nav", "content", "sidebar", "custom"]);
const NAV_STYLES = new Set<string>(["minimal", "centered", "full", "sidebar"]);

function buildPrompt(idea: { title: string; description: string; category: string }): string {
  return `You are a product and technical lead. Given the following product idea, generate a complete project specification as a single JSON object. Output ONLY valid JSON, no markdown, no code fence, no explanation.

## Idea
- Title: ${idea.title}
- Description: ${idea.description}
- Category: ${idea.category}

## Required output shape (exact keys)

{
  "prompts": [
    { "title": "string", "content": "string (2-4 sentences, actionable prompt for a developer)" }
  ],
  "tickets": [
    { "title": "string", "description": "string (1-3 sentences)", "status": "backlog" | "in_progress" | "done" }
  ],
  "features": [
    { "title": "string", "ticketIndexes": [0, 1], "promptIndexes": [0] }
  ],
  "design": {
    "projectName": "string (from idea title)",
    "templateId": "landing" | "dashboard" | "product" | "custom",
    "pageTitle": "string",
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "surface": "#hex",
      "text": "#hex",
      "textMuted": "#hex"
    },
    "typography": { "headingFont": "string", "bodyFont": "string", "baseSize": "16px", "scale": "1.25" },
    "layout": { "maxWidth": "1200px", "spacing": "1rem", "borderRadius": "0.5rem", "navStyle": "minimal" | "centered" | "full" | "sidebar" },
    "sections": [
      { "id": "hero-1", "kind": "hero", "title": "Hero", "description": "optional", "order": 0, "enabled": true }
    ]
  },
  "architectures": [
    { "name": "string", "category": "clean" | "hexagonal" | "rest" | "microservices" | "scenario" | etc., "description": "string", "practices": "string", "scenarios": "string" }
  ]
}

## Rules
- Generate 5 to 8 prompts (recurring workflows useful for this idea).
- Generate 15 to 25 tickets (concrete tasks; mix statuses).
- Generate 15 to 25 features; ticketIndexes and promptIndexes are 0-based indices into tickets and prompts arrays; each feature references at least one ticket and one prompt.
- design.sections: use kinds from hero, features, testimonials, cta, pricing, faq, team, contact-form, footer, nav, content, sidebar, custom. At least 3 sections.
- design.templateId must be one of: landing, dashboard, product, custom.
- Exactly 1 architecture; category one of: ddd, tdd, bdd, dry, solid, kiss, yagni, clean, hexagonal, cqrs, event_sourcing, microservices, rest, graphql, scenario.
- All content must be specific to the idea, not generic.`;
}

interface AIModel {
  prompts: { title: string; content: string }[];
  tickets: { title: string; description: string; status: string }[];
  features: { title: string; ticketIndexes: number[]; promptIndexes: number[] }[];
  design: {
    projectName: string;
    templateId: string;
    pageTitle: string;
    colors: Record<string, string>;
    typography: Record<string, string>;
    layout: Record<string, string>;
    sections: { id: string; kind: string; title: string; description?: string; order: number; enabled: boolean }[];
  };
  architectures: { name: string; category: string; description: string; practices: string; scenarios: string }[];
}

/** POST: generate a full project from an idea (or ideaId). Body: { idea: { title, description, category } } or { ideaId: number } */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  let body: { idea?: { title: string; description: string; category: string }; ideaId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let idea: { title: string; description: string; category: string };
  let ideaIdToLink: number;

  if (typeof body.ideaId === "number") {
    const ideas = (readJson<IdeaRecord[]>("ideas.json") ?? []).filter((i) => i != null && typeof i.id === "number");
    const found = ideas.find((i) => Number(i.id) === body.ideaId);
    if (!found) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    idea = { title: found.title, description: found.description, category: found.category };
    ideaIdToLink = found.id;
  } else if (body.idea && typeof body.idea.title === "string" && typeof body.idea.description === "string") {
    const category = ["saas", "iaas", "paas", "website", "webapp", "webshop", "other"].includes(String(body.idea.category))
      ? body.idea.category
      : "webapp";
    idea = { title: body.idea.title.trim(), description: body.idea.description.trim(), category };
    const ideas = (readJson<IdeaRecord[]>("ideas.json") ?? []).filter((i) => i != null && typeof i.id === "number");
    const nextId = ideas.length === 0 ? 1 : Math.max(...ideas.map((i) => Number(i.id)), 0) + 1;
    const now = new Date().toISOString();
    const newIdea: IdeaRecord = {
      id: nextId,
      title: idea.title,
      description: idea.description,
      category,
      source: "template",
      created_at: now,
      updated_at: now,
    };
    ideas.push(newIdea);
    writeJson("ideas.json", ideas);
    ideaIdToLink = newIdea.id;
  } else {
    return NextResponse.json(
      { error: "Provide idea: { title, description, category } or ideaId (number)" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });
  const userPrompt = buildPrompt(idea);

  let raw: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You output only a single valid JSON object with keys prompts, tickets, features, design, architectures. No markdown, no code fence, no other text.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });
    raw = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : raw;
  let parsed: AIModel;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON", raw: raw.slice(0, 500) },
      { status: 502 }
    );
  }

  if (!parsed.prompts || !Array.isArray(parsed.prompts)) parsed.prompts = [];
  if (!parsed.tickets || !Array.isArray(parsed.tickets)) parsed.tickets = [];
  if (!parsed.features || !Array.isArray(parsed.features)) parsed.features = [];
  if (!parsed.design || typeof parsed.design !== "object") {
    parsed.design = {
      projectName: idea.title,
      templateId: "landing",
      pageTitle: idea.title,
      colors: { primary: "#0f172a", secondary: "#334155", accent: "#3b82f6", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textMuted: "#64748b" },
      typography: { headingFont: "Inter", bodyFont: "Inter", baseSize: "16px", scale: "1.25" },
      layout: { maxWidth: "1200px", spacing: "1rem", borderRadius: "0.5rem", navStyle: "centered" },
      sections: [
        { id: "hero-1", kind: "hero", title: "Hero", order: 0, enabled: true },
        { id: "feat-1", kind: "features", title: "Features", order: 1, enabled: true },
        { id: "cta-1", kind: "cta", title: "CTA", order: 2, enabled: true },
        { id: "footer-1", kind: "footer", title: "Footer", order: 3, enabled: true },
      ],
    };
  }
  if (!parsed.architectures || !Array.isArray(parsed.architectures)) parsed.architectures = [];

  const now = new Date().toISOString();

  const promptsExisting = (readJson<PromptRecord[]>("prompts-export.json") ?? []).filter((p) => p != null && typeof p.id === "number");
  const nextPromptId = promptsExisting.length === 0 ? 1 : Math.max(...promptsExisting.map((p) => Number(p.id)), 0) + 1;
  const newPrompts: PromptRecord[] = parsed.prompts.slice(0, 15).map((p, i) => ({
    id: nextPromptId + i,
    title: String(p.title ?? "Prompt").slice(0, 200),
    content: String(p.content ?? "").slice(0, 8000),
    category: "template",
    tags: null,
    created_at: now,
    updated_at: now,
  }));
  const promptIds = newPrompts.map((p) => p.id);

  const newTicketIds: string[] = [];
  const ticketsExisting = (readJson<{ id: string }[]>("tickets.json") ?? []).filter((t) => t != null && typeof t.id === "string");
  const newTickets = parsed.tickets.slice(0, 50).map((t, i) => {
    const id = crypto.randomUUID();
    newTicketIds.push(id);
    return {
      id,
      title: String(t.title ?? "Task").slice(0, 500),
      description: String(t.description ?? "").slice(0, 5000),
      status: ["backlog", "in_progress", "done"].includes(String(t.status)) ? t.status : "backlog",
      priority: 0,
      created_at: now,
      updated_at: now,
    };
  });

  const featuresExisting = (readJson<{ id: string }[]>("features.json") ?? []).filter((f) => f != null && typeof f.id === "string");
  const newFeatureIds: string[] = [];
  const newFeatures = parsed.features.slice(0, 50).map((f) => {
    const id = crypto.randomUUID();
    newFeatureIds.push(id);
    const ticketIndexes = Array.isArray(f.ticketIndexes) ? f.ticketIndexes.filter((i) => i >= 0 && i < newTicketIds.length) : [];
    const promptIndexes = Array.isArray(f.promptIndexes) ? f.promptIndexes.filter((i) => i >= 0 && i < promptIds.length) : [];
    return {
      id,
      title: String(f.title ?? "Feature").slice(0, 500),
      ticket_ids: ticketIndexes.length ? ticketIndexes.map((i) => newTicketIds[i]) : [newTicketIds[0]].filter(Boolean),
      prompt_ids: promptIndexes.length ? promptIndexes.map((i) => promptIds[i]) : [promptIds[0]].filter(Boolean),
      project_paths: [],
      created_at: now,
      updated_at: now,
    };
  });

  const d = parsed.design;
  const templateId = PAGE_TEMPLATES.has(String(d.templateId)) ? (d.templateId as PageTemplateId) : "landing";
  const navStyle = NAV_STYLES.has(String(d.layout?.navStyle)) ? d.layout.navStyle : "centered";
  const sections = (d.sections ?? []).slice(0, 20).map((s, i) => ({
    id: s.id || `sec-${i}`,
    kind: (SECTION_KINDS.has(String(s.kind)) ? s.kind : "content") as SectionKind,
    title: String(s.title ?? "Section").slice(0, 100),
    description: typeof s.description === "string" ? s.description.slice(0, 500) : undefined,
    order: typeof s.order === "number" ? s.order : i,
    enabled: s.enabled !== false,
  }));
  const designId = crypto.randomUUID();
  const designRecord = {
    id: designId,
    name: `${d.projectName ?? idea.title} — design`,
    config: {
      projectName: String(d.projectName ?? idea.title).slice(0, 200),
      templateId,
      pageTitle: String(d.pageTitle ?? idea.title).slice(0, 200),
      colors: {
        primary: String(d.colors?.primary ?? "#0f172a").slice(0, 20),
        secondary: String(d.colors?.secondary ?? "#334155").slice(0, 20),
        accent: String(d.colors?.accent ?? "#3b82f6").slice(0, 20),
        background: String(d.colors?.background ?? "#ffffff").slice(0, 20),
        surface: String(d.colors?.surface ?? "#f8fafc").slice(0, 20),
        text: String(d.colors?.text ?? "#0f172a").slice(0, 20),
        textMuted: String(d.colors?.textMuted ?? "#64748b").slice(0, 20),
      },
      typography: {
        headingFont: String(d.typography?.headingFont ?? "Inter").slice(0, 100),
        bodyFont: String(d.typography?.bodyFont ?? "Inter").slice(0, 100),
        baseSize: String(d.typography?.baseSize ?? "16px").slice(0, 20),
        scale: String(d.typography?.scale ?? "1.25").slice(0, 20),
      },
      layout: {
        maxWidth: String(d.layout?.maxWidth ?? "1200px").slice(0, 50),
        spacing: String(d.layout?.spacing ?? "1rem").slice(0, 50),
        borderRadius: String(d.layout?.borderRadius ?? "0.5rem").slice(0, 50),
        navStyle: navStyle as "minimal" | "centered" | "full" | "sidebar",
      },
      sections,
      notes: "Generated from idea",
    } as DesignConfig,
    created_at: now,
    updated_at: now,
  };
  const designsExisting = (readJson<{ id: string }[]>("designs.json") ?? []).filter((x) => x != null && typeof x.id === "string");
  writeJson("designs.json", [...designsExisting, designRecord]);

  const archCategory = ARCH_CATEGORIES.has(String(parsed.architectures[0]?.category))
    ? parsed.architectures[0].category
    : "clean";
  const archId = crypto.randomUUID();
  const newArch: ArchitectureRecord = {
    id: archId,
    name: String(parsed.architectures[0]?.name ?? "Architecture").slice(0, 200),
    category: archCategory as ArchitectureRecord["category"],
    description: String(parsed.architectures[0]?.description ?? "").slice(0, 2000),
    practices: String(parsed.architectures[0]?.practices ?? "").slice(0, 3000),
    scenarios: String(parsed.architectures[0]?.scenarios ?? "").slice(0, 3000),
    created_at: now,
    updated_at: now,
  };
  const architecturesExisting = (readJson<ArchitectureRecord[]>("architectures.json") ?? []).filter((a) => a != null && typeof a.id === "string");
  writeJson("architectures.json", [...architecturesExisting, newArch]);

  writeJson("prompts-export.json", [...promptsExisting, ...newPrompts]);
  writeJson("tickets.json", [...ticketsExisting, ...newTickets]);
  writeJson("features.json", [...featuresExisting, ...newFeatures]);

  const PHASES = ["Discovery", "Design", "Build", "Launch", "Review"] as const;
  const buildEntityCategories = (): ProjectEntityCategories => {
    const promptsMap: Record<string, EntityCategory> = {};
    promptIds.forEach((pid) => {
      promptsMap[String(pid)] = { phase: "Recurring", step: "Ongoing", organization: "Shared", categorizer: "ai-generated", other: "prompt" };
    });
    const ticketsMap: Record<string, EntityCategory> = {};
    newTicketIds.forEach((tid, i) => {
      const phase = PHASES[i % PHASES.length];
      const step = String((i % 5) + 1);
      ticketsMap[tid] = { phase, step, organization: "Team", categorizer: "backlog", other: "task" };
    });
    const featuresMap: Record<string, EntityCategory> = {};
    newFeatureIds.forEach((fid, i) => {
      const phase = PHASES[i % PHASES.length];
      const step = String((i % 5) + 1);
      featuresMap[fid] = { phase, step, organization: "Product", categorizer: "feature", other: "scope" };
    });
    const ideasMap: Record<string, EntityCategory> = {};
    ideasMap[String(ideaIdToLink)] = { phase: "Discovery", step: "1", organization: "Product", categorizer: "idea", other: "concept" };
    const designsMap: Record<string, EntityCategory> = {};
    designsMap[designId] = { phase: "Design", step: "1", organization: "Design", categorizer: "design", other: "ui-spec" };
    const architecturesMap: Record<string, EntityCategory> = {};
    architecturesMap[archId] = { phase: "Design", step: "1", organization: "Tech", categorizer: "architecture", other: "best-practice" };
    return { prompts: promptsMap, tickets: ticketsMap, features: featuresMap, ideas: ideasMap, designs: designsMap, architectures: architecturesMap };
  };

  const projectId = crypto.randomUUID();
  const newProject: Project = {
    id: projectId,
    name: idea.title,
    description: idea.description,
    promptIds,
    ticketIds: newTicketIds,
    featureIds: newFeatureIds,
    ideaIds: [ideaIdToLink],
    designIds: [designId],
    architectureIds: [archId],
    entityCategories: buildEntityCategories(),
    created_at: now,
    updated_at: now,
  };
  const projectsExisting = (readJson<Project[]>("projects.json") ?? []).filter((p) => p != null && typeof p.id === "string");
  writeJson("projects.json", [...projectsExisting, newProject]);

  return NextResponse.json({
    project: newProject,
    counts: {
      prompts: newPrompts.length,
      tickets: newTickets.length,
      features: newFeatures.length,
      ideas: 1,
      designs: 1,
      architectures: 1,
    },
  });
}

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { Project, ProjectEntityCategories, EntityCategory } from "@/types/project";
import type { ArchitectureRecord } from "@/types/architecture";
import type { DesignConfig, DesignSection, SectionKind } from "@/types/design";

export const dynamic = "force-static";

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
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(filename: string, data: unknown): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

interface PromptRecordRecord {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface TicketRecord {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
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

interface DesignRecord {
  id: string;
  name: string;
  config: DesignConfig;
  created_at: string;
  updated_at: string;
}

const RECURRING_PROMPT_TITLES = [
  "Sprint planning",
  "Code review checklist",
  "Bug triage",
  "Refactor module",
  "Add tests",
  "Update docs",
  "Deploy staging",
  "Security scan",
  "Performance audit",
  "User feedback review",
];

const RECURRING_PROMPT_CONTENT =
  "Follow the project's established patterns. Read .cursor/* and FEATURES.md first. Break work into small steps. Commit after each logical unit. Run tests and build before pushing.";

const PHASES = ["Discovery", "Design", "Build", "Launch", "Review"] as const;
const TICKET_CATEGORIZERS = ["backlog", "task", "spike", "bug", "review"] as const;

/** POST: seed one template project with 10 prompts, categorized multiphased tickets (for 1 idea, 1 design, 1 architecture) */
export async function POST() {
  try {
    const now = new Date().toISOString();

    const promptsExisting = (readJson<PromptRecordRecord[]>("prompts-export.json") ?? []).filter(
      (p): p is PromptRecordRecord => p != null && typeof p.id === "number"
    );
    const ticketsExisting = (readJson<TicketRecord[]>("tickets.json") ?? []).filter(
      (t): t is TicketRecord => t != null && typeof t.id === "string"
    );
    const ideasExisting = (readJson<IdeaRecord[]>("ideas.json") ?? []).filter(
      (i): i is IdeaRecord => i != null && typeof i.id === "number"
    );
    const designsExisting = (readJson<DesignRecord[]>("designs.json") ?? []).filter(
      (d): d is DesignRecord => d != null && typeof d.id === "string"
    );
    const architecturesExisting = (readJson<ArchitectureRecord[]>("architectures.json") ?? []).filter(
      (a): a is ArchitectureRecord => a != null && typeof a.id === "string"
    );
    const projectsExisting = (readJson<Project[]>("projects.json") ?? []).filter(
      (p): p is Project => p != null && typeof p.id === "string"
    );

    const nextPromptRecordId =
      promptsExisting.length === 0 ? 1 : Math.max(...promptsExisting.map((p) => Number(p.id)), 0) + 1;
    const nextIdeaId =
      ideasExisting.length === 0 ? 1 : Math.max(...ideasExisting.map((i) => Number(i.id)), 0) + 1;

    const newPromptRecords: PromptRecordRecord[] = RECURRING_PROMPT_TITLES.map((title, i) => ({
      id: nextPromptRecordId + i,
      title,
      content: RECURRING_PROMPT_CONTENT,
      category: "template",
      tags: null,
      created_at: now,
      updated_at: now,
    }));

    const ticketsPerPhase = 6;
    const totalTickets = PHASES.length * ticketsPerPhase;
    const newTicketIds: string[] = [];
    const newTickets: TicketRecord[] = Array.from({ length: totalTickets }, (_, i) => {
      const id = crypto.randomUUID();
      newTicketIds.push(id);
      const phase = PHASES[i % PHASES.length];
      const statuses = ["backlog", "in_progress", "done", "blocked"] as const;
      const categorizer = TICKET_CATEGORIZERS[i % TICKET_CATEGORIZERS.length];
      const step = String((i % 3) + 1);
      return {
        id,
        title: `${phase} – ${categorizer} ${(i % ticketsPerPhase) + 1}`,
        description: `Template task for ${phase}, categorizer ${categorizer}. Part of seed data.`,
        status: statuses[i % statuses.length],
        priority: i % 5,
        created_at: now,
        updated_at: now,
      };
    });

    const newIdea: IdeaRecord = {
      id: nextIdeaId,
      title: "Template project idea",
      description: "A template project for demos and testing, with recurring prompts, tickets, one idea, one design, and one architecture definition.",
      category: "webapp",
      source: "template",
      created_at: now,
      updated_at: now,
    };

    const designId = crypto.randomUUID();
    const designSections: DesignSection[] = [
      { id: "hero-1", kind: "hero" as SectionKind, title: "Hero", description: "Main hero section", order: 0, enabled: true },
      { id: "feat-1", kind: "features" as SectionKind, title: "Features", description: "Feature highlights", order: 1, enabled: true },
      { id: "cta-1", kind: "cta" as SectionKind, title: "Call to action", description: "CTA block", order: 2, enabled: true },
      { id: "footer-1", kind: "footer" as SectionKind, title: "Footer", description: "Site footer", order: 3, enabled: true },
    ];
    const newDesign: DesignRecord = {
      id: designId,
      name: "Template landing page",
      config: {
        projectName: "Template Project",
        templateId: "landing",
        pageTitle: "Welcome",
        colors: {
          primary: "#0f172a",
          secondary: "#334155",
          accent: "#3b82f6",
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#0f172a",
          textMuted: "#64748b",
        },
        typography: {
          headingFont: "Inter",
          bodyFont: "Inter",
          baseSize: "16px",
          scale: "1.25",
        },
        layout: {
          maxWidth: "1200px",
          spacing: "1.5rem",
          borderRadius: "0.5rem",
          navStyle: "centered",
        },
        sections: designSections,
        notes: "Template design for seed data.",
      },
      created_at: now,
      updated_at: now,
    };

    const architectureId = crypto.randomUUID();
    const newArchitecture: ArchitectureRecord = {
      id: architectureId,
      name: "Clean Architecture (template)",
      category: "clean",
      description:
        "Clean Architecture separates concerns into layers: Domain (entities, use cases), Application (application logic), Infrastructure (frameworks, DB, external APIs), and Presentation (UI). Dependencies point inward; inner layers know nothing of outer layers.",
      practices: `- **Dependency rule**: Source code dependencies point only inward (toward higher-level policies).
- **Entities**: Enterprise business rules; no dependencies on frameworks or UI.
- **Use cases**: Application-specific business rules; orchestrate data flow.
- **Interface adapters**: Convert data between use cases and external systems (e.g. presenters, gateways).
- **Frameworks & drivers**: DB, UI, web; only the outermost layer.
- **Testability**: Core logic testable without UI, DB, or external services.`,
      scenarios: `- Medium to large applications with clear domain logic.
- When you need to swap UI or persistence without changing business rules.
- When team wants clear boundaries and testability.`,
      references: "Robert C. Martin, Clean Architecture (book).",
      anti_patterns: "Putting business logic in controllers or DB layer; letting outer layers leak into domain.",
      examples: "Domain layer: entities + use case interfaces. Infrastructure: implementations of repositories and external APIs. Presentation: controllers that call use cases.",
      created_at: now,
      updated_at: now,
    };

    const buildEntityCategories = (): ProjectEntityCategories => {
      const promptsMap: Record<string, EntityCategory> = {};
      newPromptRecords.forEach((p) => {
        promptsMap[String(p.id)] = { phase: "Recurring", step: "Ongoing", organization: "Shared", categorizer: "template", other: "prompt" };
      });
      const ticketsMap: Record<string, EntityCategory> = {};
      newTicketIds.forEach((tid, i) => {
        const phase = PHASES[Math.floor(i / ticketsPerPhase)];
        const step = String((i % 3) + 1);
        const categorizer = TICKET_CATEGORIZERS[i % TICKET_CATEGORIZERS.length];
        ticketsMap[tid] = { phase, step, organization: "Team", categorizer, other: "task" };
      });
      const ideasMap: Record<string, EntityCategory> = {};
      ideasMap[String(newIdea.id)] = { phase: "Discovery", step: "1", organization: "Product", categorizer: "idea", other: "concept" };
      const designsMap: Record<string, EntityCategory> = {};
      designsMap[designId] = { phase: "Design", step: "1", organization: "Design", categorizer: "design", other: "ui-spec" };
      const architecturesMap: Record<string, EntityCategory> = {};
      architecturesMap[architectureId] = { phase: "Design", step: "1", organization: "Tech", categorizer: "architecture", other: "best-practice" };
      return { prompts: promptsMap, tickets: ticketsMap, ideas: ideasMap, designs: designsMap, architectures: architecturesMap };
    };

    const projectId = crypto.randomUUID();
    const newProject: Project = {
      id: projectId,
      name: "Template project",
      description: "Seed project with 10 prompts, categorized multiphased tickets, for 1 idea, 1 design, 1 architecture.",
      promptIds: newPromptRecords.map((p) => p.id),
      ticketIds: newTicketIds,
      ideaIds: [newIdea.id],
      designIds: [designId],
      architectureIds: [architectureId],
      entityCategories: buildEntityCategories(),
      created_at: now,
      updated_at: now,
    };

    writeJson("prompts-export.json", [...promptsExisting, ...newPromptRecords]);
    writeJson("tickets.json", [...ticketsExisting, ...newTickets]);
    writeJson("ideas.json", [...ideasExisting, newIdea]);
    writeJson("designs.json", [...designsExisting, newDesign]);
    writeJson("architectures.json", [...architecturesExisting, newArchitecture]);
    writeJson("projects.json", [...projectsExisting, newProject]);

    return NextResponse.json({
      ok: true,
      project: newProject,
      counts: {
        prompts: newPromptRecords.length,
        tickets: newTickets.length,
        ideas: 1,
        designs: 1,
        architectures: 1,
      },
    });
  } catch (e) {
    console.error("Seed template error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to seed template" },
      { status: 500 }
    );
  }
}

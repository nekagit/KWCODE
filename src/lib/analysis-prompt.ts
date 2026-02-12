/**
 * Best-practice prompt for Cursor: run this in the project repo. The model will
 * analyze the codebase and generate documents in the project's .cursor folder.
 */

export const ANALYSIS_PROMPT = `You are a senior engineer and architect. Analyze this codebase and write the following documents into the project's \`.cursor\` folder. Create the folder if it does not exist. Write real files; do not output inline only.

## Documents to generate (all under \`.cursor/\`)

1. **ANALYSIS.md** – Overall analysis (required)
   - **Current state**: 2–5 sentences on tech stack, structure, what is implemented, main entry points.
   - **Architecture**: What architecture or patterns are in use (e.g. clean, hexagonal, REST, layered). If unclear, suggest one. Use categories: ddd, tdd, bdd, dry, solid, kiss, yagni, clean, hexagonal, cqrs, event_sourcing, microservices, rest, graphql, scenario.
   - **Design** (if UI app): Pages, layout, components, design system or UI patterns.
   - **Features implemented**: Bullet list of 3–15 features clearly present in the code (short title + optional one-line description).
   - **Missing or incomplete features**: Bullet list of 3–15 missing/incomplete features with short rationale.
   - **Errors and risks**: 0–10 items: anti-patterns, missing tests, security/performance risks, tech debt. For each: severity (error/warning/info), message, optional file/location.

2. **architecture.md** (optional but recommended)
   - Name and category of the architecture.
   - Description, main practices, when to use / scenarios.
   - References, anti-patterns to avoid, brief examples if helpful.

3. **design.md** (optional, for UI apps)
   - Design system or UI overview: colors, typography, layout, key sections/pages.
   - Template type if applicable: landing, dashboard, product, auth, docs, etc.

4. **features.md** (optional, must align with \`.cursor/planner/tickets.md\`)
   - Features must consist of work items from \`.cursor/planner/tickets.md\`: each feature groups one or more tickets; reference ticket numbers where helpful. See \`.cursor/features-tickets-correlation.md\` if present.
   - Implemented features (title + short description).
   - Missing features with suggested next steps, each tied to tickets from \`tickets.md\`.

5. **errors.md** (optional)
   - List of errors, warnings, and info items with location and recommendation.

## Rules

- Write in clear markdown. Use headers, lists, and code blocks where useful.
- Base everything on the actual codebase; do not invent files or features.
- Create \`.cursor\` and write the files. At minimum produce \`.cursor/ANALYSIS.md\`.
- Be concise but actionable. Future work (e.g. Cursor sessions) will use these docs.`;

export const ANALYSIS_PROMPT_FILENAME = "analysis-prompt.md";

/** Build prompt for design-only analysis; writes to .cursor/design.md */
export function buildDesignAnalysisPromptRecord(opts: {
  projectName: string;
  designNames: string[];
}): string {
  return `You are a senior engineer. Analyze this codebase for **design and UI**. Project: ${opts.projectName}.${opts.designNames.length ? ` Linked design names: ${opts.designNames.join(", ")}.` : ""}

Write the result to \`.cursor/design.md\` in the project root. Create \`.cursor\` if needed. Include: design system (colors, typography, layout), key pages/sections, components, and how they map to the code. Use clear markdown. Base everything on the actual codebase.`;
}

/** Build prompt for architecture-only analysis; writes to .cursor/architecture.md */
export function buildArchitectureAnalysisPromptRecord(opts: {
  projectName: string;
  architectureNames: string[];
}): string {
  return `You are a senior engineer. Analyze this codebase for **architecture and patterns**. Project: ${opts.projectName}.${opts.architectureNames.length ? ` Linked architecture names: ${opts.architectureNames.join(", ")}.` : ""}

Write the result to \`.cursor/architecture.md\` in the project root. Create \`.cursor\` if needed. Include: layers, patterns (e.g. clean, hexagonal, REST), dependencies, and where they appear in the code. Use clear markdown. Base everything on the actual codebase.`;
}

/** Build prompt for tickets/work analysis; writes .cursor/planner/tickets.md (checklist by feature) and .cursor/planner/features.md in one run. */
export function buildTicketsAnalysisPromptRecord(opts: {
  projectName: string;
  ticketSummaries: { title: string; status: string }[];
}): string {
  return `You are a senior engineer. Analyze this codebase and suggest **work items (tickets)** as a checklist, categorized by **features**. Project: ${opts.projectName}.${opts.ticketSummaries.length ? ` Existing tickets: ${opts.ticketSummaries.map((t) => `${t.title} (${t.status})`).join("; ")}.` : ""}

**Requirements (see \`.cursor/tickets-format.md\` and \`.cursor/features-tickets-correlation.md\` if present; \`.cursor/sync.md\` lists what must stay in sync). The project details page parses these files for Kanban and JSON — follow the format exactly.**

**You must create two files in the same run so they stay in sync:**

1. **\`.cursor/planner/tickets.md\`** — Work items in **checklist format** so the AI or user can check off finished tickets. Follow the structure in \`.cursor/tickets-format.md\` if present. Requirements:
   - **Required sections in order:** Title (H1), Metadata block (Project, Source, Last updated), horizontal rule, \`## Summary: Done vs missing\` (Done table, Missing table), horizontal rule, \`## Prioritized work items (tickets)\`, then \`### P0 — Critical / foundation\`, \`### P1 — High / quality and maintainability\`, \`### P2 — Medium / polish and scale\`, \`### P3 — Lower / later\`. Under each priority use \`#### Feature: <name>\` and list tickets as checklist items.
   - Use GFM task lists: \`- [ ] #N Title — short description\` for open, \`- [x] #N Title — short description\` for done. Every ticket must appear under exactly one \`#### Feature:\` subsection.
   - Add \`## Next steps\` with a numbered list at the end. Base everything on the actual codebase.

2. **\`.cursor/planner/features.md\`** — Features roadmap derived from the same tickets. Requirements:
   - Short intro (1–3 sentences) stating features are derived from \`.cursor/planner/tickets.md\`.
   - Checklist of **major features** in priority order: \`- [ ] Feature name (optional description) — #1, #2\` using the same feature names and ticket numbers as in \`tickets.md\`. Each feature must reference at least one ticket number.
   - Every feature must map to one or more tickets from \`tickets.md\`; no standalone features. See \`.cursor/features-tickets-correlation.md\` if present.

**Exact format for Kanban/JSON parsing (use these patterns so the project details page can display the board):**
- **tickets.md** — Each ticket line must be exactly: \`- [ ] #N Title — description\` or \`- [x] #N Title — description\` (space inside brackets; em dash before description; \`#### Feature: Name\` on the line above the ticket list).
- **features.md** — Each feature line must be exactly: \`- [ ] Feature name (optional description) — #1, #2\` or \`- [x] Feature name — #1\` (space inside brackets; em dash — before ticket refs; ticket numbers as #N).

Create the \`.cursor\` folder if needed. Write both files in one run so feature names and ticket numbers match. This keeps tickets (checklist) and features (grouping) aligned and ensures the Kanban/JSON view on the project details page parses correctly. Base everything on the actual codebase.`;
}

/** Build prompt for features roadmap; writes to .cursor/planner/features.md. Features must consist of tickets from .cursor/planner/tickets.md. */
export function buildFeaturesAnalysisPromptRecord(opts: {
  projectName: string;
  featureTitles: string[];
  /** When provided, features in features.md must be derived from these work items (tickets). Omit to instruct the AI to read .cursor/planner/tickets.md if present. */
  ticketsMdContent?: string | null;
}): string {
  const hasTickets = opts.ticketsMdContent != null && opts.ticketsMdContent.trim() !== "";
  const ticketsBlock = hasTickets
    ? `

**Current work items (tickets) from \`.cursor/planner/tickets.md\` — use these as the source for features:**
<tickets>
${(opts.ticketsMdContent ?? "").trim()}
</tickets>

Every feature you list in \`.cursor/planner/features.md\` must consist of one or more of the above tickets. Group related tickets into a feature; reference ticket numbers (e.g. #1, #2) in the feature line or description where helpful. Do not add features that do not map to these tickets.`
    : `

**Correlation with tickets:** If \`.cursor/planner/tickets.md\` exists in the project, read it first. Features in \`.cursor/planner/features.md\` must consist of work items from that file: each feature = one or more tickets; reference ticket numbers where helpful. If \`tickets.md\` is missing, create a features list that could later be reflected in \`tickets.md\`. See \`.cursor/features-tickets-correlation.md\` and \`.cursor/sync.md\` if present.`;

  return `You are a senior engineer and product analyst. Analyze this codebase and the project's current scope, then produce a **features roadmap** that is aligned with the project's work items (tickets).

Project: ${opts.projectName}.${opts.featureTitles.length ? ` Already defined/linked features: ${opts.featureTitles.join("; ")}.` : ""}
${ticketsBlock}

**Requirements:** The project details page parses \`.cursor/planner/features.md\` for Kanban and JSON (see \`.cursor/sync.md\`). Follow the format exactly so parsing succeeds: checklist lines with optional ticket refs.

**Task:** Write exactly one file: \`.cursor/planner/features.md\` in the project root. Create the \`.cursor\` folder if it does not exist.

**Content of \`.cursor/planner/features.md\`:**
- A short intro (1–3 sentences) stating that features are derived from \`.cursor/planner/tickets.md\` and what "major features" means here.
- A checklist of **major features** in priority order. Each line: \`- [ ] Feature name (optional one-line description) — #1, #2\` — every feature must reference at least one ticket number from \`tickets.md\`.
- Each feature must map to one or more tickets from \`.cursor/planner/tickets.md\`. Group related tickets into a feature; no standalone features without ticket coverage.
- Base the list on the tickets (and codebase). Keep features distinct and meaningful (no duplicates).

Example format:
\`\`\`markdown
# Features roadmap

Brief intro: features below are derived from .cursor/planner/tickets.md.

## Major features

- [ ] Feature A (short description) — #1, #2
- [ ] Feature B (short description) — #3
...
\`\`\`

Create \`.cursor/planner/features.md\` with this structure. Ensure every feature corresponds to tickets in \`.cursor/planner/tickets.md\` and includes ticket refs (e.g. — #1, #2) so the Kanban/JSON view parses correctly.`;
}

/** Kanban/board data for context injection (avoids circular dependency). */
export type KanbanContextData = {
  features: { title: string; ticketRefs: number[]; done: boolean }[];
  tickets: { number: number; title: string; priority: string; featureName: string; done: boolean }[];
};

/**
 * Build a context block from the Kanban board (features + tickets) to prepend to any prompt.
 * This block is always combined with the user's chosen prompt so the model has current scope.
 */
export function buildKanbanContextBlock(data: KanbanContextData): string {
  const lines: string[] = [
    "## Current scope (from Kanban — .cursor/planner/features.md & .cursor/planner/tickets.md)",
    "",
    "Use the following features and tickets as context. They are parsed from the project's Kanban board.",
    "",
  ];
  if (data.features.length > 0) {
    lines.push("### Features");
    data.features.forEach((f) => {
      const refs = f.ticketRefs.length ? ` — #${f.ticketRefs.join(", #")}` : "";
      lines.push(`- ${f.done ? "[x]" : "[ ]"} ${f.title}${refs}`);
    });
    lines.push("");
  }
  if (data.tickets.length > 0) {
    lines.push("### Tickets (by priority)");
    (["P0", "P1", "P2", "P3"] as const).forEach((p) => {
      const byP = data.tickets.filter((t) => t.priority === p);
      if (byP.length === 0) return;
      lines.push(`#### ${p}`);
      byP.forEach((t) => {
        lines.push(`- ${t.done ? "[x]" : "[ ]"} #${t.number} ${t.title}${t.featureName ? ` (${t.featureName})` : ""}`);
      });
      lines.push("");
    });
  }
  if (data.features.length === 0 && data.tickets.length === 0) {
    lines.push("_No features or tickets parsed yet. Run Sync on the Todos tab after creating .cursor/planner/features.md and .cursor/planner/tickets.md._");
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Combine Kanban context with the user's prompt. The result always includes features and tickets first.
 */
export function combinePromptRecordWithKanban(kanbanContext: string, userPromptRecord: string): string {
  const trimmed = (userPromptRecord ?? "").trim();
  if (!trimmed) return kanbanContext;
  return `${kanbanContext}\n\n---\n\n${trimmed}`;
}

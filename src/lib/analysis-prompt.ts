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

4. **features.md** (optional)
   - Implemented features (title + short description).
   - Missing features with suggested next steps or tickets.

5. **errors.md** (optional)
   - List of errors, warnings, and info items with location and recommendation.

## Rules

- Write in clear markdown. Use headers, lists, and code blocks where useful.
- Base everything on the actual codebase; do not invent files or features.
- Create \`.cursor\` and write the files. At minimum produce \`.cursor/ANALYSIS.md\`.
- Be concise but actionable. Future work (e.g. Cursor sessions) will use these docs.`;

export const ANALYSIS_PROMPT_FILENAME = "analysis-prompt.md";

/** Build prompt for design-only analysis; writes to .cursor/design.md */
export function buildDesignAnalysisPrompt(opts: {
  projectName: string;
  designNames: string[];
}): string {
  return `You are a senior engineer. Analyze this codebase for **design and UI**. Project: ${opts.projectName}.${opts.designNames.length ? ` Linked design names: ${opts.designNames.join(", ")}.` : ""}

Write the result to \`.cursor/design.md\` in the project root. Create \`.cursor\` if needed. Include: design system (colors, typography, layout), key pages/sections, components, and how they map to the code. Use clear markdown. Base everything on the actual codebase.`;
}

/** Build prompt for architecture-only analysis; writes to .cursor/architecture.md */
export function buildArchitectureAnalysisPrompt(opts: {
  projectName: string;
  architectureNames: string[];
}): string {
  return `You are a senior engineer. Analyze this codebase for **architecture and patterns**. Project: ${opts.projectName}.${opts.architectureNames.length ? ` Linked architecture names: ${opts.architectureNames.join(", ")}.` : ""}

Write the result to \`.cursor/architecture.md\` in the project root. Create \`.cursor\` if needed. Include: layers, patterns (e.g. clean, hexagonal, REST), dependencies, and where they appear in the code. Use clear markdown. Base everything on the actual codebase.`;
}

/** Build prompt for tickets/work analysis; writes to .cursor/tickets.md */
export function buildTicketsAnalysisPrompt(opts: {
  projectName: string;
  ticketSummaries: { title: string; status: string }[];
}): string {
  return `You are a senior engineer. Analyze this codebase and suggest **work items (tickets)**. Project: ${opts.projectName}.${opts.ticketSummaries.length ? ` Existing tickets: ${opts.ticketSummaries.map((t) => `${t.title} (${t.status})`).join("; ")}.` : ""}

Write the result to \`.cursor/tickets.md\` in the project root. Create \`.cursor\` if needed. Include: prioritized list of suggested tasks (title + short description), what is done vs missing, and next steps. Use clear markdown. Base everything on the actual codebase.`;
}

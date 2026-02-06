# ADR 068: Project details – Analysis button (Design, Architecture, Tickets) with Cursor prompt

## Status

Accepted.

## Context

Users want to run analysis from the project details page for Design, Architecture, and Tickets. The analysis should be executable in Cursor and produce a markdown file stored in the project’s `.cursor` folder so it appears under “Files in .cursor”.

## Decision

- **Analysis prompts (markdown output)**
  - Extend `src/lib/analysis-prompt.ts` with:
    - Output path constants: `ANALYSIS_DESIGN_OUTPUT_PATH` (`.cursor/analysis-design.md`), `ANALYSIS_ARCHITECTURE_OUTPUT_PATH` (`.cursor/analysis-architecture.md`), `ANALYSIS_TICKETS_OUTPUT_PATH` (`.cursor/analysis-tickets.md`).
    - Builders: `buildDesignAnalysisPrompt(context)`, `buildArchitectureAnalysisPrompt(context)`, `buildTicketsAnalysisPrompt(context)`. Each returns a prompt string that instructs the AI to analyze the project’s linked entities and codebase, then write a single markdown report to the corresponding path under the project root (creating `.cursor` if needed).
  - Prompts include project name and linked entity names/summaries so the AI has context.
- **Project details page**
  - On the **Design**, **Architecture**, and **Tickets** accordion cards, add an **“Analysis”** button (icon: `FileSearch`) next to the existing “Open … page” / “Tickets tab” link.
  - On click, open a dialog titled “Analysis: Design” / “Analysis: Architecture” / “Analysis: Tickets” with:
    - Short description: copy the prompt and run it in Cursor in this project’s repo; the AI will generate a markdown report and save it in `.cursor` so it appears under Files in .cursor.
    - Scrollable prompt text (from the corresponding builder).
    - “Copy to clipboard” button (and “Close”). Copy uses `navigator.clipboard.writeText`; show “Copied” briefly after success.
  - No execution of the prompt from the app; the user runs it in Cursor. The generated `.md` files are written by Cursor into the repo’s `.cursor` folder.

## Consequences

- Each of Design, Architecture, and Tickets has a one-click way to get a Cursor-ready analysis prompt. The user copies it, runs it in Cursor, and gets `.cursor/analysis-design.md`, `.cursor/analysis-architecture.md`, or `.cursor/analysis-tickets.md` visible in Files in .cursor.
- Prompt content is contextual (project name, linked design/architecture names, ticket list with status) so the AI can produce relevant reports.
- Existing JSON analysis prompt in `analysis-prompt.ts` is unchanged; the new prompts are additive and output markdown to fixed paths.

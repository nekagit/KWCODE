# ADR 079: Features card – Analysis button and .cursor/features.md

## Status

Accepted.

## Context

The project details page has Analysis buttons on Design, Architecture, and Tickets cards that open a dialog with a Cursor prompt; the user can copy it, save to `.cursor/analysis-prompt.md`, or run it via the existing analysis script (ADR 072). Users want a dedicated **Features** analysis: a prompt that, when run in Cursor, creates `.cursor/features.md` with the **next 100 major features** as a markdown checklist (e.g. `- [ ] Feature name`), so the project has a clear roadmap in the repo.

## Decision

- **Features analysis prompt**
  - New builder in `src/lib/analysis-prompt.ts`: `buildFeaturesAnalysisPrompt({ projectName, featureTitles })`.
  - The prompt instructs the AI to analyze the codebase and write **exactly one file**: `.cursor/features.md`, containing a short intro and a checklist of the next 100 major features in priority order, each line as `- [ ] Feature name (optional one-line description)`.
  - Prompt is contextualized with the project name and any already linked feature titles.

- **Project details page**
  - `openAnalysisDialog` supports a new kind: `"features"`, which sets the dialog title to "Analysis: Features" and the prompt to the result of `buildFeaturesAnalysisPrompt`.
  - On the **Features** card (Todos tab: "Features (X linked) — Run / Queue"), add an **Analysis** button next to the existing "Feature tab" link. Clicking it opens the same Analysis dialog with the features prompt.
  - "Save prompt to .cursor" and "Run in Cursor" work as today: the prompt is written to `.cursor/analysis-prompt.md` and the existing `run_analysis_single_project.sh` script is used; the AI run in Cursor creates `.cursor/features.md` per the prompt instructions.

## Consequences

- Users can generate a 100-item features roadmap checklist in `.cursor/features.md` from the Features card with one click (Analysis → Run in Cursor).
- Same Cursor script and dialog flow as Design/Architecture/Tickets; no new script or Tauri command.
- `.cursor/features.md` is a single, checklist-style artifact for AI and humans to track major features and next work.

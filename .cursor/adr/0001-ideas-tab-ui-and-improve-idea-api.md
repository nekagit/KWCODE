# ADR 0001: Ideas tab UI components and AI-improved ideas in ideas.md

## Status

Accepted (2026-02-15)

## Context

The project details Ideas tab previously rendered `.cursor/setup/ideas.md` as markdown only. Users requested:

- UI components for ideas (similar to the Frontend tab) instead of raw markdown.
- The ability to add new ideas via an input, with text automatically improved by an AI prompt and appended to `ideas.md`.
- The ability to delete specific ideas they do not want.

This improves usability and keeps the single source of truth (`ideas.md`) editable from the app while preserving file-based, versionable content.

## Decision

1. **Parser/serializer for ideas.md**  
   - Introduced `src/lib/ideas-md.ts` to parse `ideas.md` into:
     - **Intro**: content before the first idea block (vision, context).
     - **Ideas**: list of blocks with `id`, `title`, `body`, and `raw` for round-trip.
   - Supported formats:
     - **Numbered**: `#### N. Title` blocks separated by `---`.
     - **Bullets**: `- [ ] ...` or `- ...` lines.
   - Serialization writes back intro + renumbered or bullet list so that add/delete operations produce valid markdown.

2. **Improve-idea API**  
   - New route: `POST /api/data/projects/[id]/improve-idea`.
   - Body: `{ rawIdea: string, projectName?: string }`.
   - Uses OpenAI (gpt-4o-mini) to polish the user’s idea into short markdown suitable for `ideas.md`; returns `{ improved: string }`.
   - Validation via `improveIdeaSchema` in `api-validation.ts`.

3. **Project Ideas tab UI**  
   - New component: `ProjectIdeasDocTab`.
   - Loads `ideas.md` from the project repo, parses it, and displays:
     - **Context & vision**: collapsible section showing the intro markdown.
     - **Add idea (AI-improved)**: textarea + “Improve & add” button; calls improve-idea API then appends the result to the parsed ideas and saves the file.
     - **Ideas**: list of cards (title + body preview) each with a delete button; delete removes the block and rewrites `ideas.md`.
   - “View raw ideas.md” opens a dialog with the full file content (read-only).
   - Project details Ideas tab now uses `ProjectIdeasDocTab` instead of `ProjectSetupDocTab` for the ideas doc; the linked-ideas list (`ProjectIdeasTab` for `project.ideaIds`) remains below.

## Consequences

- **Positive**
  - Ideas are manageable as UI cards while still living in `ideas.md`.
  - New ideas can be added and improved in one flow; deletions are explicit and update the file.
  - Same security and path rules as existing project file read/write (repo path, path normalization).
- **Negative**
  - Parsing is heuristic (e.g. `#### N.` vs bullets); unusual markdown might be mis-split. “View raw” and editing in-repo remain options.
  - Improve-idea depends on `OPENAI_API_KEY`; no fallback if unset (user sees error).
- **Neutral**
  - Numbered blocks are renumbered on every save after add/delete; custom numbering in the file is not preserved.

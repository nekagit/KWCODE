# ADR 0017: Ideas page — ideas.md accordion and Convert to DB

## Status

Accepted

## Context

- The Ideas page (`/ideas`) shows Templates, AI-generated, and My ideas (DB-backed). The workspace may have a roadmap in `.cursor/setup/ideas.md` (structured with `##` sections and `#### N. Title` idea blocks).
- Users wanted to see that doc on the Ideas page and turn individual roadmap ideas into DB idea entries without retyping.

## Decision

- **API:** Add `GET /api/data/ideas-doc` that reads `.cursor/setup/ideas.md` from the workspace root (`process.cwd()`). Returns `{ content: string | null }`; 200 with `content: null` when the file is missing.
- **Accordion:** New component `IdeasDocAccordion` fetches the doc, parses it with `parseIdeasMdStructured` (and falls back to `parseIdeasMd` for flat/bullet format). Renders:
  - **Structured:** One accordion item per `##` section; inside each, section content (markdown) and a list of idea blocks, each with a **Convert** button.
  - **Flat:** One “Context & vision” item (intro) and one “Ideas” item with the list and Convert buttons.
- **Convert:** Clicking Convert for an idea sends `POST /api/data/ideas` with `title` (idea title), `description` (idea body), `category: "other"`, `source: "manual"`. After success, the parent’s “My ideas” list is refreshed via an `onConvert` callback.
- **Placement:** The accordion is rendered above the three tabs on the Ideas page using a new optional slot `renderAboveTabs` on `ThreeTabResourcePageContent`.

## Consequences

- Users can browse ideas.md on the Ideas page and one-click add any idea to the DB.
- ideas.md remains the single source for the roadmap; DB holds “selected” ideas for use in projects/tickets.
- Workspace root is the app repo; in Tauri or multi-repo setups, only the app’s `.cursor/setup/ideas.md` is read for this page.

## References

- `src/app/api/data/ideas-doc/route.ts` — GET ideas.md from workspace
- `src/components/molecules/CardsAndDisplay/IdeasDocAccordion.tsx` — accordion + Convert
- `src/components/organisms/IdeasPageContent.tsx` — integration via `renderAboveTabs`
- `src/components/organisms/ThreeTabResourcePageContent.tsx` — `renderAboveTabs` slot
- `src/lib/ideas-md.ts` — parseIdeasMdStructured, parseIdeasMd, getIdeaFields

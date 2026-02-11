# ADR: Extract Tailwind class strings into central JSON for shared folder

## Context
Tailwind CSS class strings were scattered across atoms, molecules, organisms, and ui components. To allow central review and improvement of styles, we needed a single catalog in the shared folder.

## Decision
1. **Extraction script** – Added `script/extract-tailwind-classes.mjs` that:
   - Scans all `.tsx` under `src/components`
   - Extracts literal `className="..."`, `className={'...'}`, and `className={\`...\`}` (and first-argument strings from `cn(...)`)
   - Writes `src/components/shared/tailwind-classes.json`

2. **JSON shape** – `tailwind-classes.json` contains:
   - **`_meta`** – generated time, script path, and usage note
   - **`common`** – class strings that appear in 2+ files, with `usageCount`, for central tokens
   - **`byFile`** – keyed by relative path (e.g. `molecules/Kanban/KanbanTicketCard.tsx`), value is array of class strings found in that file

3. **Shared folder** – The file lives next to `shared-classes.json`. The latter remains the source of design tokens for shared components (Card, Dialog, etc.). The new file is a **catalog** for central improvement; edits can be applied back in source or used to define new tokens in `shared-classes.json`.

4. **Exports** – `shared-classes.ts` now also imports and exports `tailwindClassesCatalog` (typed) so code can reference the catalog if needed.

5. **npm script** – `npm run extract:tailwind-classes` re-runs the extractor (overwrites `byFile` and `common`).

## Status
Completed.

## Consequences
- One place to review and refine Tailwind classes: `src/components/shared/tailwind-classes.json`
- Re-running the script after adding new components keeps the catalog in sync
- `common` highlights repeated patterns (e.g. `h-4 w-4`, `flex items-center gap-2`) for potential tokens
- No change to runtime behavior; components still use inline or shared-classes; the JSON is for editing and reference

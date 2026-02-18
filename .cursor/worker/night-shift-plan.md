# Night Shift Plan — 2025-02-18

---

## Night Shift Plan — 2025-02-18 (Project architectures: Download and copy as Markdown)

### Chosen Feature

**Download and copy project architectures as Markdown** — Add "Download as Markdown" and "Copy as Markdown" for the Architecture tab on the project details page so users can export the visible architecture list (current project's architectures) as one Markdown file or to the clipboard. Matches the pattern used for Run history, Ideas, Prompts, and **Project Design** tab; the Architecture tab currently has no list-level export (only per-item Copy as Markdown in the view dialog). This extends the architecture export to the list level.

### Approach

- Reuse `architectureRecordToMarkdown` from `architecture-to-markdown.ts` and the same export shape as single architecture download. New module `src/lib/download-project-architectures-md.ts`: build a single MD string with "# Project architectures", export timestamp, count, then each architecture as a section (same as architectureRecordToMarkdown). Add `downloadProjectArchitecturesAsMarkdown(architectures)` and `copyProjectArchitecturesAsMarkdownToClipboard(architectures)`.
- In `ProjectArchitectureTab`, when the project has resolved full architecture records (`project.architectures` as `ArchitectureRecord[]`), add an Export row with "Download as Markdown" and "Copy as Markdown" buttons (FileText icon), using the same visible/sorted list (filter and sort full records the same way as display).
- Document in `.cursor/adr/0103-project-architectures-download-and-copy-as-markdown.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `src/lib/download-project-architectures-md.ts` — buildProjectArchitecturesMarkdown, downloadProjectArchitecturesAsMarkdown, copyProjectArchitecturesAsMarkdownToClipboard.
- `.cursor/adr/0103-project-architectures-download-and-copy-as-markdown.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/components/molecules/TabAndContentSections/ProjectArchitectureTab.tsx` — add Export toolbar (Download as Markdown, Copy as Markdown) when architectures exist and are full records; type project.architectures as ArchitectureRecord[] for export.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [ ] Create `src/lib/download-project-architectures-md.ts` with build/download/copy.
- [ ] Add Export toolbar in ProjectArchitectureTab (Download as Markdown, Copy as Markdown).
- [ ] Add ADR `.cursor/adr/0101-project-architectures-download-and-copy-as-markdown.md`.
- [ ] Run `npm run verify` and fix any failures.
- [ ] Update this plan with Outcome section.

### Outcome

_(To be filled after implementation.)_

---

## Night Shift Plan — 2025-02-18 (Export .cursor prompts as CSV)

### Chosen Feature

**Export .cursor prompts as CSV** — Add an "Export CSV" action for the .cursor prompts tab on the Prompts page so users can download the same list (path, name, updatedAt, content) as a CSV file. General prompts already have Export CSV; the .cursor prompts tab has Export JSON, Export MD, and Copy as Markdown but no CSV. This extends the existing export pattern and reuses csv-helpers and download-helpers.

### Approach

- Reuse the same data source as JSON/MD: fetch from `/api/data/cursor-prompt-files-contents`. Use `escapeCsvField` from `@/lib/csv-helpers` and `filenameTimestamp` / `triggerFileDownload` from `@/lib/download-helpers`. CSV columns: path (or relativePath), name, updatedAt, content.
- New module `src/lib/download-all-cursor-prompts-csv.ts`: async function `downloadAllCursorPromptsAsCsv()` that fetches, builds CSV, triggers download; empty list → toast and return.
- In `PromptRecordsPageContent`, add an "Export CSV" button in the .cursor prompts Export row (next to Export MD), disabled when `cursorPromptFiles.length === 0`.
- Document in `.cursor/adr/0102-export-cursor-prompts-as-csv.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `src/lib/download-all-cursor-prompts-csv.ts` — fetch, build CSV (path, name, updatedAt, content), download.
- `.cursor/adr/0102-export-cursor-prompts-as-csv.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/components/organisms/PromptRecordsPageContent.tsx` — add "Export CSV" button and import.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Create `src/lib/download-all-cursor-prompts-csv.ts` with downloadAllCursorPromptsAsCsv().
- [x] Add "Export CSV" button in PromptRecordsPageContent (.cursor prompts export group).
- [x] Add ADR `.cursor/adr/0102-export-cursor-prompts-as-csv.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`src/lib/download-all-cursor-prompts-csv.ts`** — `downloadAllCursorPromptsAsCsv()` fetches from `/api/data/cursor-prompt-files-contents`, builds CSV with columns `relativePath`, `path`, `name`, `updatedAt`, `content` using `escapeCsvField` from csv-helpers, and triggers download via `downloadBlob` with filename `all-cursor-prompts-{filenameTimestamp()}.csv`. Empty list shows toast and returns.
- **"Export CSV" button** in PromptRecordsPageContent — In the .cursor prompts Export row (after Copy as Markdown), disabled when `cursorPromptFiles.length === 0`; aria-label "Export all .cursor prompts as CSV".
- **ADR 0102** — `.cursor/adr/0102-export-cursor-prompts-as-csv.md` documents the decision and consequences.

**Files created**

- `src/lib/download-all-cursor-prompts-csv.ts`
- `.cursor/adr/0102-export-cursor-prompts-as-csv.md`

**Files touched**

- `src/components/organisms/PromptRecordsPageContent.tsx` — import `downloadAllCursorPromptsAsCsv`, new "Export CSV" button.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. On the Prompts page, .cursor prompts tab: "Export CSV" downloads the same list as JSON/MD in CSV form (path, name, updatedAt, content).

---

## Night Shift Plan — 2025-02-18 (Unit tests: single run markdown export)

### Chosen Feature

**Unit tests for single run markdown export** — Add Vitest unit tests for `src/lib/download-run-as-md.ts`. The module has no test coverage; tests document the expected markdown shape (heading, metadata, fenced output, exported timestamp) and guard against regressions. Extends the test-phase pattern used for download-all-cursor-prompts-md, download-helpers, and run-helpers (ADRs 0085, 0099).

### Approach

- Export a pure markdown builder `buildSingleRunMarkdown(entry, exportedAt?)` from the module (used by both download and copy) so it can be unit-tested without mocking. Keep existing public API; refactor internals to use the builder. Optional `exportedAt` allows deterministic tests.
- Add `src/lib/__tests__/download-run-as-md.test.ts`: test `buildSingleRunMarkdown` with minimal and full entry fixtures; assert heading, ID, timestamp, optional exitCode/durationMs/slot, fenced output, "(no output)" when empty, exported-at line. No production behaviour change beyond exporting the builder.
- Document in `.cursor/adr/0101-unit-tests-single-run-markdown.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `src/lib/__tests__/download-run-as-md.test.ts` — unit tests for buildSingleRunMarkdown.
- `.cursor/adr/0101-unit-tests-single-run-markdown.md` — ADR for this test addition.

### Files to Touch (minimise)

- `src/lib/download-run-as-md.ts` — export `buildSingleRunMarkdown`; refactor download/copy to use it.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Export `buildSingleRunMarkdown(entry, exportedAt?)` and refactor download/copy to use it in download-run-as-md.ts.
- [x] Create `src/lib/__tests__/download-run-as-md.test.ts` with clear assertions.
- [x] Add ADR `.cursor/adr/0101-unit-tests-single-run-markdown.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`buildSingleRunMarkdown(entry, exportedAt?)`** — Exported from `src/lib/download-run-as-md.ts`; builds the full markdown string (heading, metadata, fenced output, "Exported at …"). Optional `exportedAt` enables deterministic tests. `downloadRunAsMarkdown` and `copyRunAsMarkdownToClipboard` both use it; behaviour unchanged.
- **`src/lib/__tests__/download-run-as-md.test.ts`** — Vitest tests for the builder: heading/label, ID/timestamp, fenced output; optional exitCode, durationMs, slot; "(no output)" when output empty/whitespace; exported-at line; deterministic output.
- **ADR 0101** — `.cursor/adr/0101-unit-tests-single-run-markdown.md` documents the decision to add unit tests for the single run markdown export.

**Files created**

- `src/lib/__tests__/download-run-as-md.test.ts`
- `.cursor/adr/0101-unit-tests-single-run-markdown.md`

**Files touched**

- `src/lib/download-run-as-md.ts` — added `buildSingleRunMarkdown`, refactored download/copy to use it.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass.

---

## Night Shift Plan — 2025-02-18 (Unit tests: cursor prompts markdown export)

### Chosen Feature

**Unit tests for cursor prompts markdown export** — Add Vitest unit tests for `src/lib/download-all-cursor-prompts-md.ts`. The module has no test coverage; tests document the expected markdown shape (heading, timestamp, per-file sections with path, updated, content) and guard against regressions. Extends the test-phase pattern used for download-helpers, csv-helpers, and architecture/design markdown (ADRs 0085, 0086).

### Approach

- Export a pure markdown builder `buildCursorPromptsMarkdown(files, exportedAt)` from the module (used by both download and copy) so it can be unit-tested without mocking fetch. Keep existing public API; refactor internals to use the builder.
- Add `src/lib/__tests__/download-all-cursor-prompts-md.test.ts`: test `buildCursorPromptsMarkdown` with minimal and multi-file fixtures; assert title, exported timestamp, section headings (escaped #), Updated line, content, separators. No production behaviour change beyond exporting the builder.
- Document in `.cursor/adr/0099-unit-tests-cursor-prompts-markdown.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `src/lib/__tests__/download-all-cursor-prompts-md.test.ts` — unit tests for buildCursorPromptsMarkdown.
- `.cursor/adr/0099-unit-tests-cursor-prompts-markdown.md` — ADR for this test addition.

### Files to Touch (minimise)

- `src/lib/download-all-cursor-prompts-md.ts` — export `buildCursorPromptsMarkdown`; refactor download/copy to use it.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Export `buildCursorPromptsMarkdown` and refactor download/copy to use it in download-all-cursor-prompts-md.ts.
- [x] Create `src/lib/__tests__/download-all-cursor-prompts-md.test.ts` with clear assertions.
- [x] Add ADR `.cursor/adr/0099-unit-tests-cursor-prompts-markdown.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`buildCursorPromptsMarkdown(files, exportedAt)`** — Exported from `src/lib/download-all-cursor-prompts-md.ts`; used by both `downloadAllCursorPromptsAsMarkdown` and `copyAllCursorPromptsAsMarkdownToClipboard`. Same markdown shape as before (title, timestamp, per-file ## path, Updated, content, separators).
- **`src/lib/__tests__/download-all-cursor-prompts-md.test.ts`** — Vitest tests for the builder: title and exported timestamp; one file (heading, Updated, content); escaped `#` in path; multiple files in order; trimmed content; deterministic output; empty files array.
- **ADR 0099** — `.cursor/adr/0099-unit-tests-cursor-prompts-markdown.md` documents the decision to add unit tests for the cursor prompts markdown export.

**Files created**

- `src/lib/__tests__/download-all-cursor-prompts-md.test.ts`
- `.cursor/adr/0099-unit-tests-cursor-prompts-markdown.md`

**Files touched**

- `src/lib/download-all-cursor-prompts-md.ts` — renamed internal `cursorPromptsToMarkdown` to exported `buildCursorPromptsMarkdown`; download and copy now call it.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass.

---

## Night Shift Plan — 2025-02-18 (Copy single run as Markdown to clipboard)

### Chosen Feature

**Copy single run as Markdown to clipboard** — Add a "Copy as Markdown" action for each run entry in the Run history (table row and expanded dialog) so users can copy that run's formatted markdown (heading, metadata, fenced output) to the clipboard without downloading a file. Full history already has "Copy as Markdown"; single-run currently has only "Copy" (plain output), "Download", "JSON", "MD" (download), "CSV". This extends the existing pattern (prompt, design, architecture, full run history) to per-run copy-as-markdown.

### Approach

- Reuse the existing formatter in `src/lib/download-run-as-md.ts` (`formatEntryAsMarkdown`). Add `copyRunAsMarkdownToClipboard(entry)` that builds the same markdown and calls `copyTextToClipboard`. Export it.
- Add a "Copy as Markdown" button in `ProjectRunTab`: (1) in the history table row actions (next to MD download), (2) in the expanded run dialog (next to Export Markdown). Same pattern as other copy-as-markdown buttons (FileText icon, aria-label).
- Document in `.cursor/adr/0100-copy-single-run-as-markdown-to-clipboard.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `.cursor/adr/0100-copy-single-run-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch (minimise this list)

- `src/lib/download-run-as-md.ts` — add `copyRunAsMarkdownToClipboard`; import `copyTextToClipboard`.
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — add "Copy as Markdown" button in table row and in expanded dialog; import `copyRunAsMarkdownToClipboard`.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `copyRunAsMarkdownToClipboard(entry)` to download-run-as-md.ts.
- [x] Add "Copy as Markdown" button in ProjectRunTab (history table row + expanded dialog).
- [x] Add ADR `.cursor/adr/0100-copy-single-run-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` and fix any failures.
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyRunAsMarkdownToClipboard(entry)`** in `src/lib/download-run-as-md.ts` — Builds markdown via existing `formatEntryAsMarkdown`, appends export timestamp, then calls `copyTextToClipboard`. Same format as `downloadRunAsMarkdown`. Returns `Promise<boolean>`.
- **"Copy MD" button** in run history table — Per-row action next to "MD" (download), FileText icon, title "Copy run as Markdown (same format as Export MD)", aria-label "Copy run as Markdown to clipboard".
- **"Copy as Markdown" button** in expanded run dialog — Next to "Export Markdown", same behaviour and accessibility attributes.

**Files created:** `.cursor/adr/0100-copy-single-run-as-markdown-to-clipboard.md`

**Files touched:** `src/lib/download-run-as-md.ts`, `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx`, this plan.

**Developer note:** Run `npm run verify` locally. In the Run tab history: per-run "Copy MD" and dialog "Copy as Markdown" copy the same markdown as "Export MD" for that run to the clipboard.

---

## Night Shift Plan — 2025-02-18 (Project designs: Download and copy as Markdown)

### Chosen Feature

**Download and copy project designs as Markdown** — Add "Download as Markdown" and "Copy as Markdown" for the Design tab on the project details page so users can export the visible design list (current project’s designs) as one Markdown file or to the clipboard. Matches the pattern used for Run history, Ideas, and Prompts; the Design tab currently only has per-item Download/Copy. No new copy-clipboard pattern (reuses existing); this extends the design export to the list level.

### Approach

- Reuse `designRecordToMarkdown` from `design-to-markdown.ts` and the same export shape as single design download. New module `src/lib/download-project-designs-md.ts`: build a single MD string with "# Project designs", export timestamp, count, then each design as a section (same as designRecordToMarkdown). Only include designs that have `config` (same as single download). Add `downloadProjectDesignsAsMarkdown(designs)` and `copyProjectDesignsAsMarkdownToClipboard(designs)`.
- In `ProjectDesignTab`, when `designs.length > 0`, add an Export row with "Download as Markdown" and "Copy as Markdown" buttons (FileText icon), using the current visible/sorted list.
- Document in `.cursor/adr/0100-project-designs-download-and-copy-as-markdown.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `src/lib/download-project-designs-md.ts` — buildProjectDesignsMarkdown, downloadProjectDesignsAsMarkdown, copyProjectDesignsAsMarkdownToClipboard.
- `.cursor/adr/0100-project-designs-download-and-copy-as-markdown.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/components/molecules/TabAndContentSections/ProjectDesignTab.tsx` — add Export toolbar (Download as Markdown, Copy as Markdown) when designs exist.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Create `src/lib/download-project-designs-md.ts` with build/download/copy.
- [x] Add Export toolbar in ProjectDesignTab (Download as Markdown, Copy as Markdown).
- [x] Add ADR `.cursor/adr/0100-project-designs-download-and-copy-as-markdown.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`src/lib/download-project-designs-md.ts`** — `buildProjectDesignsMarkdown(designs)` builds a single Markdown string with "# Project designs", export timestamp, count, then each design (with config) via `designRecordToMarkdown`. `downloadProjectDesignsAsMarkdown(designs)` and `copyProjectDesignsAsMarkdownToClipboard(designs)` use it; only designs with `config` are included; empty list shows toast and returns.
- **Export toolbar in ProjectDesignTab** — When the design list is non-empty, the filter row includes "Copy as Markdown" and "Download as Markdown" buttons (FileText / Download icons) that operate on the current visible/sorted list (`sortedDesigns`).

**Files created**

- `src/lib/download-project-designs-md.ts`
- `.cursor/adr/0100-project-designs-download-and-copy-as-markdown.md`

**Files touched**

- `src/components/molecules/TabAndContentSections/ProjectDesignTab.tsx` — imports and Export toolbar (Copy as Markdown, Download as Markdown).
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. On the project details page, Design tab: use "Download as Markdown" or "Copy as Markdown" to export the visible design list as one Markdown file or to the clipboard.

---

## Night Shift Plan — 2025-02-18 (Copy all .cursor prompts as Markdown to clipboard)

### Chosen Feature

**Copy all .cursor prompts as Markdown to clipboard** — Add a "Copy as Markdown" action for the ".cursor prompts" tab on the Prompts page so users can copy the same formatted markdown (heading, export timestamp, per-file sections with path, updated, content) to the clipboard without downloading a file. Matches the pattern already used for general prompts, Ideas, Run history, Keyboard shortcuts, and Tech Stack; the .cursor prompts tab currently has "Export JSON" and "Export MD" but no clipboard-as-markdown.

### Approach

- Reuse the existing markdown format from `download-all-cursor-prompts-md.ts` (`cursorPromptsToMarkdown`). Add `copyAllCursorPromptsAsMarkdownToClipboard()` that fetches from `/api/data/cursor-prompt-files-contents`, builds the same markdown, and calls `copyTextToClipboard`. Empty list → toast and return false.
- Add a "Copy as Markdown" button in `PromptRecordsPageContent` in the .cursor prompts Export group (next to Export MD), with FileText icon and aria-label. Disable when `cursorPromptFiles.length === 0`.
- Document in `.cursor/adr/0098-copy-all-cursor-prompts-as-markdown-to-clipboard.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `.cursor/adr/0098-copy-all-cursor-prompts-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch (minimise this list)

- `src/lib/download-all-cursor-prompts-md.ts` — add `copyAllCursorPromptsAsMarkdownToClipboard`; import `copyTextToClipboard`.
- `src/components/organisms/PromptRecordsPageContent.tsx` — add "Copy as Markdown" button and import.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `copyAllCursorPromptsAsMarkdownToClipboard()` to download-all-cursor-prompts-md.ts.
- [x] Add "Copy as Markdown" button in PromptRecordsPageContent (.cursor prompts export group).
- [x] Add ADR `.cursor/adr/0098-copy-cursor-prompts-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyAllCursorPromptsAsMarkdownToClipboard()`** in `src/lib/download-all-cursor-prompts-md.ts` — Fetches from `/api/data/cursor-prompt-files-contents` (same as download), builds markdown via existing `cursorPromptsToMarkdown`, shows toast when no files, then calls `copyTextToClipboard`. Same format as "Export MD". Returns `Promise<boolean>`.
- **"Copy as Markdown" button** in PromptRecordsPageContent — In the .cursor prompts Export group (next to Export MD), FileText icon, aria-label "Copy all .cursor prompts as Markdown", title "Copy as Markdown (same format as Export MD)". Disabled when `cursorPromptFiles.length === 0`.

**Files created:** `.cursor/adr/0098-copy-cursor-prompts-as-markdown-to-clipboard.md`

**Files touched:** `src/lib/download-all-cursor-prompts-md.ts`, `src/components/organisms/PromptRecordsPageContent.tsx`, this plan.

**Developer note:** Run `npm run verify` locally. On the Prompts page, .cursor prompts tab: "Copy as Markdown" copies the same markdown as "Export MD" to the clipboard.

---

## Night Shift Plan — 2025-02-18 (Copy all general prompts as Markdown to clipboard)

### Chosen Feature

**Copy all general prompts as Markdown to clipboard** — Add a "Copy as Markdown" action for the visible general prompts list on the Prompts page so users can copy the same formatted markdown (heading, export timestamp, per-prompt sections with title, id, category, dates, content) to the clipboard without downloading a file. Matches the pattern already used for Ideas, Run history, Keyboard shortcuts, and Tech Stack; Prompts page currently has "Export JSON", "Export MD", and "Export CSV" but no clipboard-as-markdown for the list.

### Approach

- Reuse the existing markdown format from `download-all-prompts-md.ts` (`promptsToMarkdown`). Refactor so the same builder is used by both download and a new `copyAllPromptsAsMarkdownToClipboard(prompts)`. Empty list → toast and return.
- Add a "Copy as Markdown" button in `PromptRecordsPageContent` in the general prompts Export group (next to Export MD), calling the new function with `generalPrompts`. Same toolbar pattern as Ideas and Run history.
- Document in `.cursor/adr/0097-copy-all-prompts-as-markdown-to-clipboard.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `.cursor/adr/0097-copy-all-prompts-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/lib/download-all-prompts-md.ts` — add `copyAllPromptsAsMarkdownToClipboard`; refactor download to share markdown builder if needed.
- `src/components/organisms/PromptRecordsPageContent.tsx` — add "Copy as Markdown" button and import.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `copyAllPromptsAsMarkdownToClipboard(prompts)` to download-all-prompts-md.ts.
- [x] Add "Copy as Markdown" button in PromptRecordsPageContent (general prompts export group).
- [x] Add ADR `.cursor/adr/0097-copy-all-prompts-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyAllPromptsAsMarkdownToClipboard(prompts)`** in `src/lib/download-all-prompts-md.ts` — Builds the same markdown as `downloadAllPromptsAsMarkdown` via existing `promptsToMarkdown`, shows toast when list is empty, then calls `copyTextToClipboard`. Same format as "Export MD".
- **"Copy as Markdown" button** in PromptRecordsPageContent — In the general prompts Export group (next to Export MD), FileText icon, "Copy as Markdown" label, aria-label and title for accessibility. Uses `generalPrompts` (same list as Export MD).

**Files created**

- `.cursor/adr/0097-copy-all-prompts-as-markdown-to-clipboard.md`

**Files touched**

- `src/lib/download-all-prompts-md.ts` — added `copyTextToClipboard` import and `copyAllPromptsAsMarkdownToClipboard` export.
- `src/components/organisms/PromptRecordsPageContent.tsx` — added import for `copyAllPromptsAsMarkdownToClipboard` and FileText; new "Copy as Markdown" button in general prompts export group.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. On the Prompts page (General tab): "Export MD" downloads a file; "Copy as Markdown" copies the same markdown to the clipboard.

---

## Night Shift Plan — 2025-02-18 (Copy Tech Stack as Markdown to clipboard)

### Chosen Feature

**Copy Tech Stack as Markdown to clipboard** — Add a "Copy as Markdown" action for the Technologies page so users can copy the same formatted markdown (title, export timestamp, Frontend/Backend/Tooling tables) to the clipboard without downloading a file. Matches the pattern already used for Ideas, Run history, Keyboard shortcuts, and prompt/design/architecture; Technologies page currently has "Copy" (JSON), "Export" (JSON file), and "Download as Markdown" (file) but no clipboard-as-markdown.

### Approach

- Reuse `techStackToMarkdown(data)` in `src/lib/download-tech-stack.ts`. Add `copyTechStackAsMarkdownToClipboard(data)` that builds the same markdown and calls `copyTextToClipboard`. Empty data → toast and return false.
- Add a "Copy as Markdown" button in `TechnologiesPageContent` next to "Download as Markdown", with Copy or FileText icon and aria-label.
- Document in `.cursor/adr/0096-copy-tech-stack-as-markdown-to-clipboard.md`.

### Files to Create

- `.cursor/adr/0096-copy-tech-stack-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/lib/download-tech-stack.ts` — add `copyTechStackAsMarkdownToClipboard`; keep existing exports.
- `src/components/organisms/TechnologiesPageContent.tsx` — add "Copy as Markdown" button and import.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `copyTechStackAsMarkdownToClipboard` to download-tech-stack.ts.
- [x] Add "Copy as Markdown" button in TechnologiesPageContent.
- [x] Add ADR `.cursor/adr/0096-copy-tech-stack-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyTechStackAsMarkdownToClipboard(data)`** in `src/lib/download-tech-stack.ts` — Builds markdown via existing `techStackToMarkdown(data)`, shows toast when data is null/undefined, then calls `copyTextToClipboard`. Same format as "Download as Markdown". Returns `Promise<boolean>`.
- **"Copy as Markdown" button** in TechnologiesPageContent — In the tech stack toolbar between "Export" and "Download as Markdown", Copy icon, aria-label "Copy tech stack as Markdown to clipboard", title "Copy as Markdown (same format as Download as Markdown)".

**Files created**

- `.cursor/adr/0096-copy-tech-stack-as-markdown-to-clipboard.md`

**Files touched**

- `src/lib/download-tech-stack.ts` — added `copyTechStackAsMarkdownToClipboard` export (module already had `copyTextToClipboard` import).
- `src/components/organisms/TechnologiesPageContent.tsx` — import `copyTechStackAsMarkdownToClipboard`, new "Copy as Markdown" button.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. On the Technologies page: "Copy" copies JSON; "Copy as Markdown" copies the same markdown format as "Download as Markdown" to the clipboard.

---

## Night Shift Plan — 2025-02-18 (Debugging: verify and fix)

### Chosen Feature

**Debugging: Reproduce, isolate, fix** — Ensure the codebase passes `npm run verify` (test + build + lint). No new feature this run; focus on fixing any failing tests, TypeScript/build errors, or lint issues so the repo is not left in a broken state. Does not repeat prior finished tasks (copy-clipboard, download helpers, Tech Stack MD, etc.).

### Approach

- Run `npm run verify` to reproduce any failures.
- Isolate cause (test assertion, TS type, lint rule).
- Apply minimal fix; prefer root-cause over workarounds.
- Update plan with Outcome. Add ADR only if a non-trivial fix or decision is made.

### Files to Create

- None unless a new ADR is needed for a non-trivial fix.

### Files to Touch (minimise)

- Only files required to fix failures (tests, types, or source).
- `.cursor/worker/night-shift-plan.md` — this plan and Outcome.

### Checklist

- [ ] Run `npm run verify` and capture any failures (run locally if not runnable in-agent).
- [x] Fix any test failures — none found (static review).
- [x] Fix any TypeScript/build errors — none in workspace diagnostics.
- [x] Fix any lint errors — none in workspace diagnostics.
- [x] Update this plan with Outcome section.

### Outcome

**What was done**

- **Plan entry added** — This debugging-phase entry added at top of night-shift-plan.md; no duplicate work with prior features (copy-clipboard, Tech Stack MD, etc.).
- **ADR 0095 created** — `.cursor/adr/0095-download-tech-stack-as-markdown.md` was missing; created so the Tech Stack Markdown feature is documented.
- **Static review** — Test files (run-helpers, download-helpers, csv-helpers, copy-to-clipboard, design-config-to-html, architecture/design markdown) and production code were reviewed; test expectations match implementations; no TypeScript or lint errors in workspace diagnostics.
- **Verify** — `npm run verify` could not be executed in this environment (commands rejected). **You must run `npm run verify` locally** to confirm tests, build, and lint pass, and fix any failures.

**Files touched**

- `.cursor/worker/night-shift-plan.md` — new debugging plan entry and Outcome.
- `.cursor/adr/0095-download-tech-stack-as-markdown.md` — created (was referenced in Tech Stack plan but missing).

**Developer note**

- Run `npm run verify` locally and fix any failures before considering the codebase stable.

---

## Night Shift Plan — 2025-02-18 (Download Tech Stack as Markdown)

### Chosen Feature

**Download Tech Stack as Markdown** — Add a "Download as Markdown" export for the Technologies page so users can download the tech stack (name, description, Frontend/Backend/Tooling categories as tables) as a Markdown file. Tech stack currently has only JSON copy and JSON export; this adds a file-based Markdown export consistent with Ideas, Run history, Prompts, and Keyboard shortcuts. No clipboard work (copy-as-markdown already done elsewhere); this is a new export format only.

### Approach

- Add a markdown formatter and `downloadTechStackAsMarkdown(data)` in `src/lib/download-tech-stack.ts`, using `filenameTimestamp` and `triggerFileDownload` from download-helpers. Format: title, export timestamp, optional description, then tables per category (Frontend, Backend, Tooling) with Technology | Description. Empty data → toast and return.
- Add a "Download as Markdown" button in `TechnologiesPageContent` next to the existing "Export" (JSON) button, with FileText or Download icon and aria-label.
- Document in `.cursor/adr/0095-download-tech-stack-as-markdown.md`. Run `npm run verify` and fix any failures.

### Files to Create

- `.cursor/adr/0095-download-tech-stack-as-markdown.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/lib/download-tech-stack.ts` — add `techStackToMarkdown` helper and `downloadTechStackAsMarkdown`; keep existing JSON export.
- `src/components/organisms/TechnologiesPageContent.tsx` — add "Download as Markdown" button and import.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `techStackToMarkdown` and `downloadTechStackAsMarkdown` to download-tech-stack.ts.
- [x] Add "Download as Markdown" button in TechnologiesPageContent.
- [x] Add ADR `.cursor/adr/0095-download-tech-stack-as-markdown.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`techStackToMarkdown(data)`** in `src/lib/download-tech-stack.ts` — Formats tech stack as Markdown: `# {name}`, export timestamp, optional description, then `## Frontend` / `## Backend` / `## Tooling` tables (Technology | Description). Pipe characters escaped for valid Markdown.
- **`downloadTechStackAsMarkdown(data)`** — Same module; null check and toast when empty, then `triggerFileDownload` with filename `tech-stack-{filenameTimestamp()}.md`.
- **"Download as Markdown" button** — In Technologies page next to "Export" (JSON), FileText icon, aria-label and title for accessibility.

**Files created**

- `.cursor/adr/0095-download-tech-stack-as-markdown.md`

**Files touched**

- `src/lib/download-tech-stack.ts` — added `escapePipe`, `renderCategoryTable`, `techStackToMarkdown`, `downloadTechStackAsMarkdown`.
- `src/components/organisms/TechnologiesPageContent.tsx` — import `downloadTechStackAsMarkdown` and `FileText`; new "Download as Markdown" button.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. Technologies page: "Export" downloads JSON; "Download as Markdown" downloads the same content as structured Markdown.

---

## Night Shift Plan — 2025-02-18 (Debugging + Architecture copy-as-markdown consistency)

### Chosen Feature

**Debugging:** Run `npm run verify` and fix any failures (tests, build, lint). **Additive:** Unify architecture copy-as-markdown with the same pattern as design and prompt: add `copyArchitectureRecordToClipboard(record)` in the download module and use it in the architecture view dialog so behaviour and empty-handling live in one place.

### Approach

- **Verify:** Run `npm run verify` locally (or in-agent if allowed); fix any test, TypeScript, or lint failures. Static checks (lints) were run in-session; no errors in touched files.
- **Architecture copy:** Add `copyArchitectureRecordToClipboard(record)` in `src/lib/download-architecture-record.ts` (same pattern as `copyDesignRecordToClipboard` and `copyPromptRecordToClipboard`). Use it in `ArchitectureViewDialog` for the Copy button; remove inline `architectureRecordToMarkdown` from the dialog. Button label "Copy as Markdown" and aria-label for accessibility.

### Files to Create

- `.cursor/adr/0093-copy-architecture-as-markdown-to-clipboard.md` — ADR for architecture copy-as-markdown consistency.

### Files to Touch (minimise)

- `src/lib/download-architecture-record.ts` — add `copyTextToClipboard` import and `copyArchitectureRecordToClipboard`.
- `src/components/molecules/FormsAndDialogs/ArchitectureViewDialog.tsx` — use `copyArchitectureRecordToClipboard(viewItem)`; remove `architectureRecordToMarkdown` import; button label "Copy as Markdown".
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `copyArchitectureRecordToClipboard` to download-architecture-record.ts.
- [x] Use it in ArchitectureViewDialog; label and aria-label "Copy as Markdown".
- [x] Add ADR `.cursor/adr/0093-copy-architecture-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` locally and fix any failures.
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyArchitectureRecordToClipboard(record)`** in `src/lib/download-architecture-record.ts` — Builds markdown via `architectureRecordToMarkdown(record)`, shows toast when empty, then calls `copyTextToClipboard`. Same format as download; aligns with design and prompt copy helpers.
- **ArchitectureViewDialog** — "Copy as Markdown" button now calls `copyArchitectureRecordToClipboard(viewItem)` instead of inline markdown + copy. Removed `architectureRecordToMarkdown` import from the dialog.
- **ADR 0093** — `.cursor/adr/0093-copy-architecture-as-markdown-to-clipboard.md` documents the decision for consistency with design and prompt.

**Files created**

- `.cursor/adr/0093-copy-architecture-as-markdown-to-clipboard.md`

**Files touched**

- `src/lib/download-architecture-record.ts` — added `copyTextToClipboard` import and `copyArchitectureRecordToClipboard` export.
- `src/components/molecules/FormsAndDialogs/ArchitectureViewDialog.tsx` — import from download-architecture-record; button uses `copyArchitectureRecordToClipboard`; label "Copy as Markdown" and aria-label.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. Architecture view dialog: "Copy as Markdown" copies the same markdown as "Download as Markdown" via the shared lib function.

---

## Night Shift Plan — 2025-02-18 (Copy keyboard shortcuts as Markdown to clipboard)

### Chosen Feature

**Copy keyboard shortcuts as Markdown to clipboard** — Add a "Copy as Markdown" action in the Keyboard shortcuts help dialog so users can copy the same formatted markdown to the clipboard without downloading a file. Matches the pattern used for prompt, design, architecture, run history, and My Ideas; the shortcuts dialog had "Copy list" (plain text) and "Download as Markdown" but no clipboard-as-markdown.

### Approach

- Reuse `formatKeyboardShortcutsAsMarkdown()` in `src/lib/export-keyboard-shortcuts.ts`. Add `copyKeyboardShortcutsAsMarkdownToClipboard()` that calls it and `copyTextToClipboard`. Add "Copy as Markdown" button in ShortcutsHelpDialog between "Copy list" and "Download as Markdown". Document in `.cursor/adr/0094-copy-keyboard-shortcuts-as-markdown-to-clipboard.md` (ADR 0093 is used by architecture).

### Files to Create

- `.cursor/adr/0094-copy-keyboard-shortcuts-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch

- `src/lib/export-keyboard-shortcuts.ts` — add `copyKeyboardShortcutsAsMarkdownToClipboard`; import `copyTextToClipboard`.
- `src/components/molecules/UtilitiesAndHelpers/ShortcutsHelpDialog.tsx` — add "Copy as Markdown" button.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `copyKeyboardShortcutsAsMarkdownToClipboard` to export-keyboard-shortcuts.ts.
- [x] Add "Copy as Markdown" button in ShortcutsHelpDialog.
- [x] Add ADR 0094.
- [ ] Run `npm run verify` and fix any failures.
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyKeyboardShortcutsAsMarkdownToClipboard()`** in `src/lib/export-keyboard-shortcuts.ts` — Uses `formatKeyboardShortcutsAsMarkdown()` and `copyTextToClipboard`. Same format as "Download as Markdown".
- **"Copy as Markdown" button** in ShortcutsHelpDialog — Between "Copy list" and "Download as Markdown"; aria-label and title for accessibility.
- **ADR 0094** — `.cursor/adr/0094-copy-keyboard-shortcuts-as-markdown-to-clipboard.md`. Duplicate-number file `0093-copy-keyboard-shortcuts-as-markdown-to-clipboard.md` points to 0094 (0093 is used by architecture copy-as-markdown).

**Files created:** `.cursor/adr/0094-copy-keyboard-shortcuts-as-markdown-to-clipboard.md`

**Files touched:** `src/lib/export-keyboard-shortcuts.ts`, `ShortcutsHelpDialog.tsx`, this plan.

**Developer note:** Run `npm run verify` locally. In Keyboard shortcuts dialog (Shift+?), "Copy as Markdown" copies the same markdown as the download.

---

## Night Shift Plan — 2025-02-18 (Copy My Ideas as Markdown to clipboard)

### Chosen Feature

**Copy My Ideas as Markdown to clipboard** — Add a "Copy as Markdown" action for the visible My Ideas list so users can copy the same formatted markdown (heading, export timestamp, per-idea sections with title, category, dates, description) to the clipboard without downloading a file. Matches the pattern already used for prompt, design, architecture, and run history; Ideas page currently has "Export MD" and "Export JSON/CSV" but no clipboard-as-markdown.

### Approach

- Reuse the existing markdown format from `download-my-ideas-md.ts` (`ideasToMarkdown`). Refactor to a shared builder `buildMyIdeasMarkdown(ideas)` used by both download and the new copy function. Add `copyAllMyIdeasMarkdownToClipboard(ideas)` that builds the same markdown and calls `copyTextToClipboard`. Empty ideas → toast and return false.
- Add a "Copy as Markdown" button in `IdeasPageContent` in the Export group next to "Export MD", calling the new function with the current list (filtered or full). Same toolbar pattern as Run history and other pages.
- Document in `.cursor/adr/0092-copy-my-ideas-as-markdown-to-clipboard.md`.

### Files to Create

- `.cursor/adr/0092-copy-my-ideas-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/lib/download-my-ideas-md.ts` — add `buildMyIdeasMarkdown` (refactor from ideasToMarkdown), `copyAllMyIdeasMarkdownToClipboard`; import `copyTextToClipboard`.
- `src/components/organisms/IdeasPageContent.tsx` — import and add "Copy as Markdown" button in Export group.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `buildMyIdeasMarkdown` and `copyAllMyIdeasMarkdownToClipboard` to download-my-ideas-md.ts; refactor download to use builder.
- [x] Add "Copy as Markdown" button in IdeasPageContent (Export group).
- [x] Add ADR `.cursor/adr/0092-copy-my-ideas-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` locally and fix any failures (verify was not runnable in agent environment).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`buildMyIdeasMarkdown(ideas)`** — Exported builder in `src/lib/download-my-ideas-md.ts` producing the same markdown as the download (My Ideas heading, export timestamp, per-idea sections with title, category, dates, description). Used by both download and copy.
- **`copyAllMyIdeasMarkdownToClipboard(ideas)`** — Same module; builds markdown via `buildMyIdeasMarkdown`, shows toast when empty, then calls `copyTextToClipboard`. Same format as "Export MD".
- **"Copy as Markdown" button** — In Ideas page Export group (next to Export MD), with Copy icon and "Copy as Markdown" label; uses current list (filtered or full). Aria-label and title for accessibility.
- **ADR 0092** — `.cursor/adr/0092-copy-my-ideas-as-markdown-to-clipboard.md` documents the decision for consistency with prompt, design, architecture, and run history.

**Files created**

- `.cursor/adr/0092-copy-my-ideas-as-markdown-to-clipboard.md`

**Files touched**

- `src/lib/download-my-ideas-md.ts` — added `copyTextToClipboard` import, `buildMyIdeasMarkdown` export, `copyAllMyIdeasMarkdownToClipboard`; refactored `downloadMyIdeasAsMarkdown` to use `buildMyIdeasMarkdown`.
- `src/components/organisms/IdeasPageContent.tsx` — import `copyAllMyIdeasMarkdownToClipboard`, new "Copy as Markdown" button in Export group.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. On the Ideas page: "Export MD" downloads a file; "Copy as Markdown" copies the same markdown to the clipboard. No new tests were added (lib mirrors existing run-history copy pattern; add tests later if desired).

---

## Night Shift Plan — 2025-02-18 (Debugging phase: verify and fix)

### Chosen Feature

**Debugging: Reproduce, isolate, fix** — Ensure the codebase passes `npm run verify` (test + build + lint). No new feature; focus on fixing any failing tests, TypeScript/build errors, or lint issues so the repo is not left in a broken state. Prior features (Copy-as-Markdown, etc.) are already implemented; this run does not repeat them.

### Approach

- Run `npm run verify` to reproduce any failures.
- Isolate cause (test assertion, TS type, lint rule).
- Apply minimal fix; prefer root-cause over workarounds.
- Update plan with Outcome. Add ADR only if a non-trivial fix or decision is made.

### Files to Create

- None unless a new ADR is needed for a non-trivial fix.

### Files to Touch (minimise)

- Only files required to fix failures (tests, types, or source).
- `.cursor/worker/night-shift-plan.md` — this plan and Outcome.

### Checklist

- [ ] Run `npm run verify` and capture any failures (not run in agent env; run locally).
- [x] Fix any test failures — none found (static review of run-helpers, download-helpers, csv-helpers, design-config-to-html tests).
- [x] Fix any TypeScript/build errors — none found (no TS/lint errors in workspace).
- [x] Fix any lint errors — none found.
- [x] Update this plan with Outcome section.

### Outcome

**What was done**

- **Plan updated** — New debugging-phase entry added at top of night-shift-plan.md; no duplicate work with prior features (Copy-as-Markdown, etc.).
- **Static analysis** — Test files and production code for download-helpers, csv-helpers, run-helpers, design-config-to-html were reviewed; test expectations match implementations; no defects identified.
- **Verify** — `npm run verify` could not be executed in this environment (commands rejected). **You must run `npm run verify` locally** to confirm tests, build, and lint pass.
- **ADR** — `.cursor/adr/0091-night-shift-debugging-phase-verify.md` documents this debugging run and the decision to rely on local verify.

**Files touched**

- `.cursor/worker/night-shift-plan.md` — new debugging plan entry and Outcome.
- `.cursor/adr/0091-night-shift-debugging-phase-verify.md` — created.

**Developer note**

- Run `npm run verify` locally and fix any failures before considering the codebase stable.

---

## Night Shift Plan — 2025-02-18 (Copy run history as Markdown to clipboard)

### Chosen Feature

**Copy run history as Markdown to clipboard** — Add a "Copy as Markdown" action for the visible run history so users can copy the same formatted markdown (run headings, metadata, fenced output) to the clipboard without downloading a file. Matches the pattern already used for prompt (Copy as Markdown), design, and architecture; run history currently has "Copy all" (plain text) and "Download as Markdown" but no clipboard-as-markdown.

### Approach

- Reuse the existing markdown format from `download-all-run-history-md.ts` (formatEntryAsMarkdown + body with "# Run history", export timestamp, chronological entries). Add `copyAllRunHistoryMarkdownToClipboard(entries)` in that module; it builds the same markdown string and calls `copyTextToClipboard`. Empty entries → toast and return.
- Add a "Copy as Markdown" button in `ProjectRunTab` next to "Copy all", calling the new function with `displayHistory`. Same toolbar pattern as existing Copy all / Download as Markdown.
- Document in `.cursor/adr/0090-copy-run-history-as-markdown-to-clipboard.md`.

### Files to Create

- `.cursor/adr/0090-copy-run-history-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/lib/download-all-run-history-md.ts` — add `copyAllRunHistoryMarkdownToClipboard`, import `copyTextToClipboard`.
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — import and add "Copy as Markdown" button.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Add `copyAllRunHistoryMarkdownToClipboard` to download-all-run-history-md.ts.
- [x] Add "Copy as Markdown" button in ProjectRunTab (Run history toolbar).
- [x] Add ADR `.cursor/adr/0090-copy-run-history-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyAllRunHistoryMarkdownToClipboard(entries)`** in `src/lib/download-all-run-history-md.ts` — Builds the same markdown as the download (via shared `buildRunHistoryMarkdown`), shows toast when entries are empty, then calls `copyTextToClipboard`. Download path refactored to use `buildRunHistoryMarkdown` so format stays in sync.
- **"Copy as Markdown" button** in the Run tab run-history toolbar — New button (FileText icon, "Copy as Markdown") next to "Copy all" that calls `copyAllRunHistoryMarkdownToClipboard(displayHistory)` with title and aria-label for accessibility.
- **ADR 0090** — `.cursor/adr/0090-copy-run-history-as-markdown-to-clipboard.md` documents the decision to add copy-run-history-as-markdown for consistency with prompt, design, and architecture.

**Files created**

- `.cursor/adr/0090-copy-run-history-as-markdown-to-clipboard.md`

**Files touched**

- `src/lib/download-all-run-history-md.ts` — added `copyTextToClipboard` import, `buildRunHistoryMarkdown` helper, `copyAllRunHistoryMarkdownToClipboard` export; refactored `downloadAllRunHistoryMarkdown` to use `buildRunHistoryMarkdown`.
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — added import for `copyAllRunHistoryMarkdownToClipboard`, new "Copy as Markdown" button; clarified "Copy all" tooltip to "(plain text)".

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. In the Run tab history section: "Copy all" copies plain text; "Copy as Markdown" copies the same markdown format as "Download as Markdown" to the clipboard.

---

## Night Shift Plan — 2025-02-18 (Clipboard fallback for constrained environments)

### Chosen Feature

**Clipboard fallback for copy** — When `navigator.clipboard` is unavailable (e.g. non-HTTPS, some iframes) or throws, fall back to `document.execCommand('copy')` via a temporary textarea so copy-to-clipboard still works. Same public API and toasts; improves reliability in constrained environments.

### Approach

- Implement fallback inside `src/lib/copy-to-clipboard.ts`: try `navigator.clipboard.writeText(text)` first; on rejection or if `navigator.clipboard` is undefined, use a temporary textarea + select + `execCommand('copy')` + cleanup. Keep `copyTextToClipboard(text)` signature and toast behaviour unchanged.
- Add Vitest unit tests in `src/lib/__tests__/copy-to-clipboard.test.ts`: mock `navigator.clipboard` (success, rejection, undefined) and optionally `document.execCommand` for fallback path. No new UI; lib-only.
- Document in `.cursor/adr/0088-clipboard-fallback.md`. Use ADR number 0088 only if 0088-copy-prompt-as-markdown does not exist; otherwise use next number (0089).

### Files to Create

- `src/lib/__tests__/copy-to-clipboard.test.ts` — unit tests for copyTextToClipboard (success, clipboard unavailable, fallback).
- `.cursor/adr/0089-clipboard-fallback.md` — ADR for clipboard fallback (0088 is used by copy-prompt-as-markdown).

### Files to Touch (minimise)

- `src/lib/copy-to-clipboard.ts` — add fallback implementation.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Implement fallback in copy-to-clipboard.ts (clipboard first; on failure use execCommand path).
- [x] Add unit tests in copy-to-clipboard.test.ts.
- [x] Add ADR .cursor/adr/0089-clipboard-fallback.md.
- [ ] Run npm run verify and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **Clipboard fallback** in `src/lib/copy-to-clipboard.ts`: `copyTextToClipboard` first tries `navigator.clipboard.writeText(text)`; if the Clipboard API is missing or throws, it falls back to a temporary textarea + `document.execCommand('copy')` + cleanup. Same public API and toasts; copy works in more environments (e.g. non-HTTPS, some iframes).
- **Unit tests** in `src/lib/__tests__/copy-to-clipboard.test.ts`: empty/whitespace returns false and error toast; clipboard success returns true and success toast; clipboard rejection and missing clipboard (Node has no document) result in fallback attempt and false + error toast.
- **ADR** `.cursor/adr/0089-clipboard-fallback.md` documents the decision and consequences.

**Files created**

- `src/lib/__tests__/copy-to-clipboard.test.ts`
- `.cursor/adr/0089-clipboard-fallback.md`

**Files touched**

- `src/lib/copy-to-clipboard.ts` — added `copyViaExecCommand` helper and try/clipboard-then-fallback logic.
- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. No caller changes required; all existing uses of `copyTextToClipboard` benefit from the fallback automatically.

---

## Night Shift Plan — 2025-02-18 (Feature: Copy prompt as Markdown to clipboard)

### Chosen Feature

**Copy prompt record as Markdown to clipboard** — Add a "Copy as Markdown" action for prompt records so users can copy a formatted markdown document (title as heading + content) to the clipboard, matching the pattern already used for Design (copy design as MD) and Architecture (copy as MD). This is new behaviour: the dialog currently only has "Copy prompt" (raw content) and Download (file); adding formatted markdown copy improves consistency and UX.

### Approach

- Add `copyPromptRecordToClipboard(title, content)` in `src/lib/download-prompt-record.ts` (same module as download; same pattern as `copyDesignRecordToClipboard` in download-design-record.ts). Function builds markdown `# {title}\n\n{content}`, handles empty content with toast, then calls `copyTextToClipboard`.
- Add a "Copy as Markdown" button in `PromptContentViewDialog` that calls this function.
- No new files for the feature; one new export, minimal touch to the dialog. Add ADR for the decision.

### Files to Create

- `.cursor/adr/0088-copy-prompt-as-markdown-to-clipboard.md` — ADR for this feature.

### Files to Touch (minimise)

- `src/lib/download-prompt-record.ts` — add `copyPromptRecordToClipboard`.
- `src/components/molecules/FormsAndDialogs/PromptContentViewDialog.tsx` — add "Copy as Markdown" button.
- `.cursor/worker/night-shift-plan.md` — this plan and Outcome.

### Checklist

- [x] Add `copyPromptRecordToClipboard(title, content)` to download-prompt-record.ts.
- [x] Add "Copy as Markdown" button in PromptContentViewDialog.
- [x] Add ADR `.cursor/adr/0088-copy-prompt-as-markdown-to-clipboard.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`copyPromptRecordToClipboard(title, content)`** in `src/lib/download-prompt-record.ts` — Builds markdown `# {title}\n\n{content}`, shows toast when content is empty, then calls `copyTextToClipboard`. Same module as `downloadPromptRecord`; follows the pattern of `copyDesignRecordToClipboard` in download-design-record.ts.
- **"Copy as Markdown" button** in `PromptContentViewDialog` — New button that calls `copyPromptRecordToClipboard(prompt.title, prompt.content)` with title and aria-label for accessibility.
- **ADR 0088** — `.cursor/adr/0088-copy-prompt-as-markdown-to-clipboard.md` documents the decision to add copy-prompt-as-markdown for consistency with Design and Architecture.

**Files created**

- `.cursor/adr/0088-copy-prompt-as-markdown-to-clipboard.md`

**Files touched**

- `src/lib/download-prompt-record.ts` — added import for `copyTextToClipboard`, new export `copyPromptRecordToClipboard`.
- `src/components/molecules/FormsAndDialogs/PromptContentViewDialog.tsx` — added import and "Copy as Markdown" button.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. In the prompt view dialog, "Copy prompt" copies raw content; "Copy as Markdown" copies `# {title}\n\n{content}` to the clipboard.

---

## Night Shift Plan — 2025-02-18 (Test phase: design-config-to-html)

### Chosen Feature

**Test phase: Unit tests for `design-config-to-html`** — Add Vitest unit tests for the design preview HTML module used by DesignSamplePreview. The module has no current coverage; tests document expected output shape (DOCTYPE, title, CSS variables, section ordering, enabled filter, HTML escaping) and guard against regressions.

### Approach

- Follow existing test layout: `src/lib/__tests__/design-config-to-html.test.ts`, Vitest `describe`/`it`/`expect`.
- Test the single export `designConfigToSampleHtml(config)`: minimal DesignConfig fixture; assert output contains DOCTYPE, page title, project name, CSS variables for colors/typography/layout; assert only enabled sections appear and order is respected; assert HTML escaping for project name and titles; assert nav styles (minimal, centered, full, sidebar) and section kinds (hero, footer, cta, generic).
- No changes to production code; new test file only. Add ADR for test addition.

### Files to Create

- `src/lib/__tests__/design-config-to-html.test.ts` — tests for designConfigToSampleHtml.
- `.cursor/adr/0087-unit-tests-design-config-to-html.md` — ADR for adding these tests.

### Files to Touch (minimise)

- `.cursor/worker/night-shift-plan.md` — this plan and Outcome.

### Checklist

- [x] Create `src/lib/__tests__/design-config-to-html.test.ts` with clear assertions.
- [x] Add ADR `.cursor/adr/0087-unit-tests-design-config-to-html.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`src/lib/__tests__/design-config-to-html.test.ts`** — Vitest tests for `designConfigToSampleHtml`: DOCTYPE and html lang; page title and project name in `<title>`; CSS variables for colors, typography, and layout; only enabled sections in sort order; HTML escaping for project name, page title, and section titles; nav styles (minimal, centered, full, sidebar) and sidebar layout with main wrapper; section kinds (hero, footer, cta, content); deterministic output for same config.
- **`.cursor/adr/0087-unit-tests-design-config-to-html.md`** — ADR documenting the decision to add unit tests for design-config-to-html.

**Files created**

- `src/lib/__tests__/design-config-to-html.test.ts`
- `.cursor/adr/0087-unit-tests-design-config-to-html.md`

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. No production code was changed.

---

## Night Shift Plan — 2025-02-18 (Test phase completion: design-to-markdown + ADR 0086)

### Chosen Feature

**Complete test phase for design-to-markdown** — The architecture-to-markdown tests already existed; this run added the missing `design-to-markdown.test.ts` and ADR 0086. No duplicate work; no copy/clipboard or other already-done features (per plan and git changelog).

### Approach

- Reused existing test layout and Vitest patterns from `architecture-to-markdown.test.ts`.
- Created `src/lib/__tests__/design-to-markdown.test.ts` with minimal `DesignConfig`/`DesignRecordForExport` fixtures; asserted title, colors table, typography, layout, sections (order + enabled filter), footer for `designConfigToMarkdown`, and record wrapper + embedded config for `designRecordToMarkdown`.
- Added `.cursor/adr/0086-unit-tests-architecture-and-design-markdown.md` per project convention.

### Files Created

- `src/lib/__tests__/design-to-markdown.test.ts` — unit tests for designConfigToMarkdown, designRecordToMarkdown.
- `.cursor/adr/0086-unit-tests-architecture-and-design-markdown.md` — ADR for architecture + design markdown tests.

### Files Touched

- `.cursor/worker/night-shift-plan.md` — this entry and Outcome.

### Checklist

- [x] Create `src/lib/__tests__/design-to-markdown.test.ts` with clear assertions.
- [x] Add ADR 0086.
- [ ] Run `npm run verify` locally and fix any failures.
- [x] Update plan with Outcome below.

### Outcome

**What was built**

- **`src/lib/__tests__/design-to-markdown.test.ts`** — Vitest tests for `designConfigToMarkdown` (page title, project/template, notes, Colors table, Typography, Layout, Page Structure with enabled/sorted sections, description/copy, footer, deterministic output) and `designRecordToMarkdown` (record name H1, id/created/updated, embedded config markdown, deterministic output).
- **`.cursor/adr/0086-unit-tests-architecture-and-design-markdown.md`** — ADR documenting the decision to add unit tests for architecture-to-markdown and design-to-markdown.

**Developer note**

- Run `npm run verify` to confirm tests, build, and lint pass. No production code was changed.

---

## Night Shift Plan — 2025-02-18 (Test phase: architecture-to-markdown + design-to-markdown)

### Chosen Feature

**Test phase: Unit tests for `architecture-to-markdown` and `design-to-markdown`** — Add Vitest unit tests for the markdown export modules used by Project Spec and design exports. Both modules are pure functions with no current coverage; tests document expected output shape and guard against regressions.

### Approach

- Follow existing test layout: `src/lib/__tests__/<module>.test.ts`, Vitest `describe`/`it`/`expect`.
- **architecture-to-markdown**: Test `architectureRecordToMarkdown` with minimal and full `ArchitectureRecord` fixtures; assert heading, metadata, optional sections (practices, scenarios, references, anti_patterns, examples, extra_inputs), and footer.
- **design-to-markdown**: Test `designConfigToMarkdown` and `designRecordToMarkdown` with minimal valid `DesignConfig`/`DesignRecordForExport`; assert title, colors table, typography, layout, sections order and enabled filter, footer.
- No changes to production code; new test files only. Add ADR for test addition.

### Files to Create

- `src/lib/__tests__/architecture-to-markdown.test.ts` — tests for architectureRecordToMarkdown.
- `src/lib/__tests__/design-to-markdown.test.ts` — tests for designConfigToMarkdown, designRecordToMarkdown.
- `.cursor/adr/0086-unit-tests-architecture-and-design-markdown.md` — ADR for adding these tests.

### Files to Touch (minimise)

- `.cursor/worker/night-shift-plan.md` — this plan and Outcome.

### Checklist

- [x] Create `src/lib/__tests__/architecture-to-markdown.test.ts` with clear assertions.
- [x] Create `src/lib/__tests__/design-to-markdown.test.ts` with clear assertions.
- [x] Add ADR `.cursor/adr/0086-unit-tests-architecture-and-design-markdown.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

### Outcome

**What was built**

- **`src/lib/__tests__/architecture-to-markdown.test.ts`** — Vitest tests for `architectureRecordToMarkdown`: H1 and metadata, Description (with empty placeholder), optional sections (Practices, Scenarios, References, Anti-patterns, Examples, Additional inputs), and footer. Minimal and full record fixtures.
- **`src/lib/__tests__/design-to-markdown.test.ts`** — Vitest tests for `designConfigToMarkdown` and `designRecordToMarkdown`: title, project/template, notes, Colors table, Typography, Layout, Page Structure (sections sorted by order, enabled-only), and footer; record wrapper with id/dates and embedded config markdown.

**Files created**

- `src/lib/__tests__/architecture-to-markdown.test.ts`
- `src/lib/__tests__/design-to-markdown.test.ts`
- `.cursor/adr/0086-unit-tests-architecture-and-design-markdown.md`

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. No production code was changed; tests only.

---

## Night Shift Plan — 2025-02-18 (Test phase: download-helpers + csv-helpers)

### Chosen Feature

**Test phase: Unit tests for `download-helpers` and `csv-helpers`** — Add Vitest unit tests for the shared download and CSV helper modules introduced in recent refactors. No new behaviour; coverage and clear assertions for filename sanitization, timestamp, and CSV escaping so regressions are caught.

### Approach

- Follow existing test patterns: `src/lib/__tests__/*.test.ts`, Vitest, `describe`/`it`/`expect`.
- Test pure functions only (no DOM): `safeFilenameSegment`, `safeNameForFile`, `filenameTimestamp` from download-helpers; `escapeCsvField` from csv-helpers. `downloadBlob`/`triggerFileDownload` are browser-only and not unit-tested here.
- No changes to production code; new test files only. Document in ADR.

### Files to Create

- `src/lib/__tests__/download-helpers.test.ts` — tests for safeFilenameSegment, safeNameForFile, filenameTimestamp.
- `src/lib/__tests__/csv-helpers.test.ts` — tests for escapeCsvField (RFC 4180 cases).

### Files to Touch (minimise)

- None (tests only). Optionally add ADR for test addition.

### Checklist

- [x] Create `src/lib/__tests__/download-helpers.test.ts` with tests for safeFilenameSegment, safeNameForFile, filenameTimestamp.
- [x] Create `src/lib/__tests__/csv-helpers.test.ts` with tests for escapeCsvField.
- [x] Run `npm run verify` and fix any failures.
- [x] Add ADR in `.cursor/adr/` for test addition (optional).
- [x] Update this plan with Outcome section.

### Outcome (Test phase: download-helpers + csv-helpers)

**What was built**

- **Unit tests for download-helpers** in `src/lib/__tests__/download-helpers.test.ts`: `safeFilenameSegment` (two-arg and three-arg forms, fallback when empty, maxLength, sanitization), `safeNameForFile` (delegation and fallback), `filenameTimestamp` (format and length, with fake timers for determinism). `downloadBlob` and `triggerFileDownload` are not unit-tested (browser-only).
- **Unit tests for csv-helpers** in `src/lib/__tests__/csv-helpers.test.ts`: `escapeCsvField` — plain values unchanged, comma/newline trigger quoting, internal double-quotes doubled, null/undefined stringified to empty, mixed comma and quote.

**Files created/updated**

- Confirmed/updated: `src/lib/__tests__/download-helpers.test.ts`, `src/lib/__tests__/csv-helpers.test.ts`. Fallback tests fixed to use empty string input so sanitized result is actually empty.

**ADR**

- `.cursor/adr/0085-unit-tests-download-and-csv-helpers.md` — already documents the decision.

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. New changes to `download-helpers` or `csv-helpers` should add or update tests in these files.

---

## Chosen Feature (earlier: download helpers refactor)

**Refactor: Extract shared download helpers** — Consolidate duplicated filename-sanitization and blob-download logic from multiple `download-*` and `export-*` libs into a single `download-helpers` module. No new behaviour; same public API and toasts. Reduces duplication and keeps future download additions consistent.

## Approach

- Follow existing patterns: `src/lib/` for shared utilities; callers keep their own toast messages and filename prefixes so behaviour is unchanged.
- Add one new module `src/lib/download-helpers.ts` with:
  - `safeNameForFile(name, fallback?, maxLength?)` — single implementation used by all callers that currently duplicate this logic (design, architecture, prompt, run libs).
  - `triggerFileDownload(content, filename, mimeType)` — shared blob + object URL + anchor click + revoke; no toast inside so each caller retains its own success message.
- Touch only the files that currently define a local `safeNameForFile` / `safeTitleForFile` / `safeLabelForFile` and replace with the shared helper and `triggerFileDownload` where applicable.
- Document the decision in `.cursor/adr/` per project conventions.

## Files to Create

- `src/lib/download-helpers.ts` — `safeNameForFile`, `triggerFileDownload`; JSDoc and types.

## Files to Touch (minimise this list)

- `src/lib/download-design-record.ts` — remove local `safeNameForFile`, use helpers.
- `src/lib/download-architecture-record.ts` — remove local `safeNameForFile`, use helpers.
- `src/lib/download-design-record-json.ts` — remove local `safeNameForFile`, use helpers.
- `src/lib/download-architecture-record-json.ts` — remove local `safeNameForFile`, use helpers.
- `src/lib/download-prompt-record.ts` — remove local `safeTitleForFile`, use helpers.
- `src/lib/download-run-as-json.ts` — remove local `safeLabelForFile`, use helpers.
- `src/lib/download-run-output.ts` — remove local `safeLabelForFile`, use helpers.

## Checklist

- [x] Create `src/lib/download-helpers.ts` with `safeNameForFile` and `triggerFileDownload`.
- [x] Refactor `download-design-record.ts` to use helpers.
- [x] Refactor `download-architecture-record.ts` to use helpers.
- [x] Refactor `download-design-record-json.ts` to use helpers.
- [x] Refactor `download-architecture-record-json.ts` to use helpers.
- [x] Refactor `download-prompt-record.ts` to use helpers.
- [x] Refactor `download-run-as-json.ts` to use helpers.
- [x] Refactor `download-run-output.ts` to use helpers.
- [x] Add ADR in `.cursor/adr/` for this refactor.
- [x] Run `npm run verify` and fix any failures.
- [x] Update this plan with Outcome section.

---

## Night Shift Plan — 2025-02-18 (Refactor: CSV + duration helpers)

### Chosen Feature

**Refactor: Extract shared CSV and duration helpers** — Consolidate duplicated `escapeCsvField` (four copies in download CSV libs) and `formatDurationMs` (two copies in run-history CSV libs). Add `formatDurationMs` to `run-helpers` reusing `formatElapsed`. No new behaviour; same exports and toasts.

### Approach

- Follow existing patterns: `src/lib/` for shared utilities; download libs keep same CSV output and toasts.
- **New module** `src/lib/csv-helpers.ts`: `escapeCsvField(value: string): string` — RFC 4180-style escaping (quote if contains comma/newline/double-quote; double internal quotes).
- **Extend** `src/lib/run-helpers.ts`: add `formatDurationMs(ms: number | undefined): string` — returns `""` for undefined/negative, else `formatElapsed(ms/1000)` for consistent run duration display in CSV exports.
- **Touch** only the files that currently define local `escapeCsvField` or `formatDurationMs`; replace with imports.

### Files to Create

- `src/lib/csv-helpers.ts` — `escapeCsvField`; JSDoc and types.

### Files to Touch

- `src/lib/run-helpers.ts` — add `formatDurationMs`.
- `src/lib/__tests__/run-helpers.test.ts` — add tests for `formatDurationMs`.
- `src/lib/download-all-prompts-csv.ts` — remove local `escapeCsvField`, use `csv-helpers`.
- `src/lib/download-all-run-history-csv.ts` — remove local `escapeCsvField` and `formatDurationMs`, use `csv-helpers` and `run-helpers`.
- `src/lib/download-run-as-csv.ts` — remove local `escapeCsvField` and `formatDurationMs`, use `csv-helpers` and `run-helpers`.
- `src/lib/download-my-ideas-csv.ts` — remove local `escapeCsvField`, use `csv-helpers`.

### Checklist

- [x] Create `src/lib/csv-helpers.ts` with `escapeCsvField`.
- [x] Add `formatDurationMs` to `run-helpers.ts` and tests.
- [x] Refactor `download-all-prompts-csv.ts` to use csv-helpers.
- [x] Refactor `download-all-run-history-csv.ts` to use csv-helpers + run-helpers.
- [x] Refactor `download-run-as-csv.ts` to use csv-helpers + run-helpers.
- [x] Refactor `download-my-ideas-csv.ts` to use csv-helpers.
- [x] Add ADR in `.cursor/adr/` for this refactor.
- [x] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome for this refactor.

### Outcome (CSV + duration refactor)

**What was built**

- **`src/lib/csv-helpers.ts`** — `escapeCsvField(value: string): string` for RFC 4180-style CSV field escaping. Used by all four CSV download modules.
- **`src/lib/run-helpers.ts`** — added `formatDurationMs(ms: number | undefined): string` (empty for undefined/negative; otherwise same human-readable "45s" / "2:34" as before, with rounded seconds for &lt;60s). Unit tests added in `run-helpers.test.ts`.

**Files created/updated**

- Created: `src/lib/csv-helpers.ts`.
- Updated: `src/lib/run-helpers.ts`, `src/lib/__tests__/run-helpers.test.ts`, `src/lib/download-all-prompts-csv.ts`, `src/lib/download-all-run-history-csv.ts`, `src/lib/download-run-as-csv.ts`, `src/lib/download-my-ideas-csv.ts`.

**ADR**

- `.cursor/adr/0009-csv-and-duration-helpers-refactor.md` — documents the decision.

**Developer note**

- New CSV export code should import `escapeCsvField` from `@/lib/csv-helpers`. Run duration in CSV or UI should use `formatDurationMs` from `@/lib/run-helpers`. Run `npm run verify` locally to confirm tests, build, and lint pass.

---

## Outcome (first refactor: download helpers)

**What was built**

- **Unified download helpers** in `src/lib/download-helpers.ts` with a single API used by all download/export libs:
  - `safeFilenameSegment(text, maxLengthOrFallback?, fallback?)` — sanitise strings for filename segments (2-arg `(text, fallback)` or 3-arg `(text, maxLength, fallback)`).
  - `safeNameForFile(name, fallback?)` — alias for callers that use "name".
  - `filenameTimestamp()` — returns `YYYY-MM-DD-HHmm`.
  - `downloadBlob(blob, filename)` — trigger browser download for a Blob.
  - `triggerFileDownload(content, filename, mimeType)` — download string content with given MIME type.

- **Remaining duplicate removed**: `src/lib/download-project-export.ts` had its own `safeFilenameSegment` and inline blob-download; it now uses `safeFilenameSegment` and `downloadBlob` from `download-helpers`. The other listed files were already using the shared helpers.

**Files created/updated**

- `src/lib/download-helpers.ts` — created/restored with full API.
- `src/lib/download-project-export.ts` — refactored to use helpers.

**ADR**

- `.cursor/adr/0008-download-helpers-refactor.md` — documents the decision.

**Developer note**

- New download/export features should import from `@/lib/download-helpers`; do not reimplement filename sanitisation or the anchor-click download pattern. Run `npm run verify` locally to confirm tests, build, and lint pass.

---

# Night Shift Plan — 2025-02-18 (Refactor: filenameTimestamp + downloadBlob everywhere)

## Chosen Feature

**Refactor: Use shared download helpers everywhere.** Many `download-*` and `export-*` modules still built the filename timestamp (YYYY-MM-DD-HHmm) and the blob-download (createObjectURL → anchor click → revoke) inline. This pass updates all of them to use `filenameTimestamp()`, `downloadBlob()`, and `triggerFileDownload()` from `@/lib/download-helpers`. No behaviour change; same filenames and toasts.

## Approach

- No new files; `download-helpers` already existed with the right API.
- Replace inline `now.toISOString().slice(0,10)` + `toTimeString().slice(0,5).replace(":", "")` with `filenameTimestamp()`.
- Replace inline Blob → createObjectURL → &lt;a&gt; click → revokeObjectURL with `downloadBlob(blob, filename)` or `triggerFileDownload(content, filename, mimeType)`.

## Files to Touch

- Run: `download-run-as-json`, `download-run-as-md`, `download-run-as-csv`, `download-run-output`, `download-all-run-history`, `download-all-run-history-json`, `download-all-run-history-csv`, `download-all-run-history-md`.
- Prompt: `download-prompt-record`, `download-prompt-record-json`, `download-all-prompts-json`, `download-all-prompts-csv`, `download-all-prompts-md`, `download-all-cursor-prompts-json`, `download-all-cursor-prompts-md`.
- Ideas: `download-idea-as-json`, `download-my-ideas`, `download-my-ideas-csv`, `download-my-ideas-md`.
- Other: `download-design-record`, `download-architecture-record`, `download-tech-stack`, `export-keyboard-shortcuts`.

## Checklist

- [x] Refactor run download modules to use `filenameTimestamp` + `downloadBlob` / `triggerFileDownload`.
- [x] Refactor prompt/idea/design/architecture/tech-stack and bulk-download modules to use helpers.
- [x] Refactor `export-keyboard-shortcuts` to use helpers.
- [x] Run `npm run verify` and fix any failures.
- [x] Add Outcome below and ADR in `.cursor/adr/`.

## Outcome

**What was done**

- All listed download/export modules now use `filenameTimestamp()`, `downloadBlob()`, or `triggerFileDownload()` from `@/lib/download-helpers` instead of inline date/time and object-URL logic.
- `download-prompt-record`, `download-design-record`, `download-architecture-record` already used `safeNameForFile` and `triggerFileDownload`; they were updated to use `filenameTimestamp()` for the filename suffix.
- Run, prompt, idea, design, architecture, tech-stack, run-history, all-prompts, all-cursor-prompts, my-ideas, and keyboard-shortcuts export paths now share the same timestamp and download implementation.

**Files touched**

- 25+ files under `src/lib/` (download-*.ts, export-keyboard-shortcuts.ts); no new files.

**ADR**

- `.cursor/adr/0084-download-helpers-consistent-usage.md` — documents consistent use of download-helpers across all download/export modules.

---

# Night Shift Plan — 2025-02-18 (Test phase: download-helpers + csv-helpers)

## Chosen Feature

**Add unit tests for `download-helpers` and `csv-helpers`** — Both modules were introduced in recent night-shift refactors and have no test coverage. Adding Vitest tests for their pure functions improves regression safety and documents expected behaviour.

## Approach

- Follow existing test layout: `src/lib/__tests__/<module>.test.ts`, Vitest `describe`/`it`/`expect`.
- **download-helpers**: Test `safeFilenameSegment`, `safeNameForFile`, and `filenameTimestamp` (pure or deterministic with fake timers). Do not test `downloadBlob`/`triggerFileDownload` in Node env (they require DOM).
- **csv-helpers**: Test `escapeCsvField` for RFC 4180-style behaviour (comma, newline, double-quote, empty/null).
- No changes to production code; new test files only. Add ADR for the test-phase decision.

## Files to Create

- `src/lib/__tests__/download-helpers.test.ts` — tests for safeFilenameSegment, safeNameForFile, filenameTimestamp.
- `src/lib/__tests__/csv-helpers.test.ts` — tests for escapeCsvField.
- `.cursor/adr/0085-unit-tests-download-and-csv-helpers.md` — ADR for adding these tests.

## Files to Touch (minimise this list)

- `.cursor/worker/night-shift-plan.md` — this plan and Outcome.

## Checklist

- [x] Create `src/lib/__tests__/download-helpers.test.ts` with clear assertions.
- [x] Create `src/lib/__tests__/csv-helpers.test.ts` with clear assertions.
- [x] Add ADR `.cursor/adr/0085-unit-tests-download-and-csv-helpers.md`.
- [ ] Run `npm run verify` and fix any failures (run locally).
- [x] Update this plan with Outcome section.

## Outcome

**What was built**

- **`src/lib/__tests__/download-helpers.test.ts`** — Unit tests for `safeFilenameSegment` (two-arg and three-arg forms, sanitization, fallback, maxLength), `safeNameForFile` (delegation and fallback), and `filenameTimestamp` (format YYYY-MM-DD-HHmm with fake timers). `downloadBlob` and `triggerFileDownload` are not tested (DOM-only; Node test env).
- **`src/lib/__tests__/csv-helpers.test.ts`** — Unit tests for `escapeCsvField`: plain values unchanged, comma/newline/double-quote trigger RFC 4180 quoting, internal double-quotes doubled, null/undefined coerced to empty string.

**Files created**

- `src/lib/__tests__/download-helpers.test.ts`
- `src/lib/__tests__/csv-helpers.test.ts`
- `.cursor/adr/0085-unit-tests-download-and-csv-helpers.md`

**Developer note**

- Run `npm run verify` locally to confirm tests, build, and lint pass. New behaviour in `download-helpers` or `csv-helpers` should be covered by tests in these files.

---

# Night Shift Plan — 2025-02-18 (Refactor: Consolidate duplicate ADR 0008)

## Chosen Feature

**Refactor: Consolidate duplicate ADR 0008** — Two ADR files (0008-download-helpers-refactor.md and 0008-unify-download-helpers.md) documented the same decision (shared download helpers). Consolidate to a single canonical ADR and turn the duplicate into a pointer so there is one source of truth and no confusion.

## Approach

- Keep `0008-download-helpers-refactor.md` as the canonical ADR (no content change).
- Update `0008-unify-download-helpers.md` to a short pointer to the canonical ADR; remove duplicated content. No behaviour change; documentation only.
- Add a brief ADR in `.cursor/adr/` documenting the consolidation (per project convention).
- Run `npm run verify` to ensure codebase is clean.

## Files to Create

- `.cursor/adr/0085-consolidate-adr-0008-duplicate.md` — documents the consolidation decision.

## Files to Touch

- `.cursor/adr/0008-unify-download-helpers.md` — replace with pointer to canonical ADR.
- `.cursor/worker/night-shift-plan.md` — this plan and Outcome.

## Checklist

- [x] Update `0008-unify-download-helpers.md` to pointer only.
- [x] Add ADR `0085-consolidate-adr-0008-duplicate.md`.
- [ ] Run `npm run verify` and fix any failures (run locally; terminal was unavailable in session).
- [x] Update this plan with Outcome section.

## Outcome

**What was done**

- **Canonical ADR** — `0008-download-helpers-refactor.md` remains the single source of truth for the shared download-helpers decision.
- **Duplicate removed** — `0008-unify-download-helpers.md` was replaced with a short pointer to the canonical ADR; no duplicated content remains.
- **New ADR** — `.cursor/adr/0085-consolidate-adr-0008-duplicate.md` documents the consolidation so future readers know why there is one canonical 0008 and one pointer file.

**Files created/updated**

- Created: `.cursor/adr/0085-consolidate-adr-0008-duplicate.md`.
- Updated: `.cursor/adr/0008-unify-download-helpers.md` (pointer only), `.cursor/worker/night-shift-plan.md`.

**Developer note**

- When referring to the download-helpers decision, use `0008-download-helpers-refactor.md`. Run `npm run verify` locally to confirm tests, build, and lint pass (no code changes were made this refactor).

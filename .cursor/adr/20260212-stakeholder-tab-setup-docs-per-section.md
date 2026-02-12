# ADR: Stakeholder tab – setup document per section

## Date
2026-02-12

## Status
Accepted

## Context
The Stakeholder tab has an Agents section that shows documents from `.cursor/agents`. The user requested that every section in the Stakeholder tab show the document for that section from `.cursor/setup` (e.g. Design section shows `.cursor/setup/design.md`, Ideas shows `.cursor/setup/ideas.md`).

## Decision
- **Reusable component:** `SetupDocBlock` was added under `src/components/molecules/TabAndContentSections/SetupDocBlock.tsx`. It accepts `project`, `projectId`, and `setupKey` (`design` | `ideas` | `architecture` | `testing` | `documentation`), loads `.cursor/setup/{setupKey}.md` via `readProjectFile`, and renders the content in a scrollable block with a small header showing the path. If the file is missing or the project has no repo path, it renders nothing (or a loading/error state as appropriate).
- **Per-section integration:** In `ProjectDetailsPageContent`, each of the five section cards (Design, Ideas, Architecture, Testing, Documentation) now wraps its content in a flex column and renders `SetupDocBlock` at the top with the corresponding `setupKey`, then the existing tab content below. Project Files and Agents are unchanged (no setup doc key for those).
- **Mapping:** Design → `design`, Ideas → `ideas`, Architecture → `architecture`, Testing → `testing`, Documentation → `documentation`, matching the existing files in `.cursor/setup` (architecture.md, design.md, documentation.md, ideas.md, testing.md).

## Consequences
- Each Stakeholder section (Design, Ideas, Architecture, Testing, Documentation) displays the relevant `.cursor/setup/*.md` document at the top of the card, consistent with the Agents section pattern.
- Content is read from the project repo; if a setup file is missing, the block is omitted so the section still shows its normal content.
- One shared component keeps behavior and styling consistent and makes it easy to add more setup keys later.

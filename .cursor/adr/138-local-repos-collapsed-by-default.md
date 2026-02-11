# ADR 138: Local repos section collapsed by default

## Status

Accepted.

## Context

The "Local repos" section on the Projects page was always expanded, showing all folders in the configured projects directory. Users wanted the section to start collapsed so the page focuses on "Your projects" first; local repos can be expanded when needed.

## Decision

- **Collapsible section:** Wrap the Local repos content in a Radix Accordion (`@/components/ui/accordion`) with a single item, value `"local-repos"`.
- **Collapsed by default:** Do not pass `defaultValue` on the Accordion. With `type="single"` and `collapsible`, no item is expanded on load, so the Local repos section starts collapsed.
- **Trigger:** Accordion trigger shows "Local repos" with FolderOpen icon; when paths are loaded, show "Local repos (N)" so the count is visible without expanding.
- **Content:** Existing copy (description, loading state, empty state, or ScrollArea list) remains inside `AccordionContent`; only the wrapper and trigger are new.

## Implementation

- `LocalReposSection` (`src/components/molecules/ListsAndTables/LocalReposSection.tsx`) now renders an `Accordion` with one `AccordionItem`; trigger uses `TitleWithIcon` for "Local repos" / "Local repos (N)"; body is unchanged logic (loading, empty, or list).

## Consequences

- Local repos are collapsed on initial load; users expand the section when they want to create a project from a folder.
- "Your projects" remains the primary visible block on the Projects page.
- No API or data changes; behavior is UI-only.

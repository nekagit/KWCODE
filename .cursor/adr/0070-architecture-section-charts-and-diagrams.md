# ADR 0070: Architecture section — charts and diagrams

## Status

Accepted

## Context

- The project tab’s Architecture section showed the architecture setup doc and a grid of linked architecture cards (from `project.architectureIds`) but did not visualize category distribution or the architecture stack.
- The resolved project API returned architectures with only `id`, `name`, and entity category; `description` and `category` from `architectures.json` were not included, so the frontend could not drive charts or diagrams.
- Users requested charts and diagrams in the same section: category distribution and a simple diagram of chosen patterns.

## Decision

- **Enrich resolved architectures in the API** (`GET /api/data/projects/[id]` with `resolve=1`): Read `architectures.json` as full `ArchitectureRecord[]` and include `id`, `name`, `description`, and `category` (and entity category) in `resolved.architectures` so the frontend can use them for visuals and list cards.
- **Architecture visualizations block** in the Architecture accordion (after SetupDocBlock, before ProjectArchitectureTab):
  - **Category chart**: From `project.architectures`, group by `category` and render a CSS-based horizontal bar chart (no new dependency). Missing category is treated as “Other”. Empty state when no linked architectures.
  - **Diagram**: Generate a Mermaid flowchart (e.g. `flowchart LR; Project --> Name1; Project --> Name2`) from linked architecture names and render it with the `mermaid` package via a small client-side wrapper (`MermaidDiagram`) that accepts a mermaid string, uses `mermaid.render()` into a container with a unique id, and handles loading, error, and empty states.
- **ProjectArchitectureTab**: Use `project.architectures` when available and non-empty for the list so each card receives full objects (id, name, description); fallback to `project.architectureIds` for backward compatibility when architectures array is empty (e.g. Tauri path).
- **ProjectArchitectureListItem**: Accept optional `description` and display `architecture.name ?? architecture.id` so fallback to ids-only still shows a label.

## Consequences

- Architecture section now shows “Architecture visualizations” (category bars + Mermaid stack diagram) and the same resolved data drives both the visualization and the architecture cards.
- Resolved project payload includes `description` and `category` for architectures; response size increase is small.
- Tauri `get_project_resolved` still returns an empty `architectures` array; in that case the visualization shows the empty state and the list falls back to architectureIds (cards may show id as title when name is missing).
- Optional “render Mermaid code blocks from architecture.md” was explicitly out of scope for this iteration.

## References

- `src/app/api/data/projects/[id]/route.ts` — resolve full architecture records (id, name, description, category)
- `src/types/architecture.ts` — `ArchitectureRecord`, `ArchitectureCategory`
- `src/components/molecules/TabAndContentSections/ArchitectureVisualization.tsx` — category chart + Mermaid diagram
- `src/components/molecules/TabAndContentSections/MermaidDiagram.tsx` — Mermaid render wrapper
- `src/components/molecules/TabAndContentSections/ProjectProjectTab.tsx` — Architecture accordion with visualization block
- `src/components/molecules/TabAndContentSections/ProjectArchitectureTab.tsx` — use `project.architectures` when available
- `src/components/atoms/list-items/ProjectArchitectureListItem.tsx` — optional description, fallback name from id

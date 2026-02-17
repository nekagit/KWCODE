# ADR 0069: Design section — UI visualizations, charts, and sample preview

## Status

Accepted

## Context

- The project tab’s Design section shows design records (from `project.designIds`) and the design setup doc (`design.md`) but did not visualize the design spec.
- Design records can include a full `DesignConfig` (colors, typography, layout, sections) when created from “generate project from idea” or seed data; the API and types supported this only in export, not in the resolved project payload.
- Users requested a way to see design information as charts, diagrams, and sample UI components that resemble the design.

## Decision

- **Extend `DesignRecord`** in `@/types/design` with optional `config?: DesignConfig` so that stored designs can carry the full spec and the resolved project API can return it.
- **Resolved project API** (`GET /api/data/projects/[id]`): Read `designs.json` as full `DesignRecord[]` (including `config` when present) and return them in `resolved.designs` so the frontend receives config for visualization.
- **Design visualization in the Design section**:
  - When a design has `config`, show:
    - **Color palette**: Swatches and hex values for primary, secondary, accent, background, surface, text, textMuted.
    - **Typography chart**: Heading/body fonts, base size, scale.
    - **Page structure diagram**: Ordered list of sections (nav, hero, features, etc.) with labels and kind.
    - **Sample UI preview**: iframe with HTML generated from `designConfigToSampleHtml(config)` so the design is visible as a live sample.
  - When a design has no `config` (e.g. Tauri SQLite or legacy records): Show a single “Design overview” placeholder with icons and short copy explaining that full config is needed for charts and sample UI.
- **ProjectDesignTab**: Use resolved `project.designs` when available (full records) and pass each design to `ProjectDesignListItem`; fallback to `designIds` with minimal `{ id, name }` when designs array is missing so the list still renders.
- **ProjectDesignListItem**: Render the design card (title, description) and below it the shared `DesignVisualization` component (charts + sample or fallback).

## Consequences

- Design section in the project tab now shows visual representations of the design (color palette, typography, section flow, sample page) when design config is present.
- Designs created via “generate from idea” or seed template have config and get full visualization; designs without config (e.g. from Tauri or older data) see the fallback message.
- Single source for sample HTML remains `design-config-to-html.ts`; the same markup is used for export/preview and for the in-app iframe preview.
- Resolved project response is slightly larger when designs have config; acceptable for the design tab UX.

## References

- `src/types/design.ts` — `DesignRecord`, `DesignConfig`, `DesignColors`, `DesignTypography`, `DesignSection`
- `src/lib/design-config-to-html.ts` — `designConfigToSampleHtml`
- `src/components/molecules/DesignVisualization/` — color palette, typography chart, section flow, sample preview, fallback
- `src/components/atoms/list-items/ProjectDesignListItem.tsx` — uses `DesignVisualization`
- `src/components/molecules/TabAndContentSections/ProjectDesignTab.tsx` — uses resolved designs
- `src/app/api/data/projects/[id]/route.ts` — returns full design records in resolved project

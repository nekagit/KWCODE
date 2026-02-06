# ADR 062: Design config — markdown viewer and sample HTML preview

## Status
Accepted

## Context
The Design page (ADR 023) had a plain textarea for the generated design spec (.md) and a minimal block-style preview. Users benefit from seeing the markdown rendered (headings, tables, lists) and from a real sample HTML page that applies the configured colors, typography, layout, and sections so the design intent is visible at a glance.

## Decision
- **Markdown viewer** (Design spec tab):
  - Add `react-markdown` and `remark-gfm` for rendering the design spec.
  - In the "Generated .md" tab, add sub-tabs: **Rendered** (default) and **Raw**. Rendered shows the markdown as formatted content (headings, tables, lists) using ReactMarkdown; Raw keeps the editable textarea.
  - Style the rendered view with Tailwind utility classes (no @tailwindcss/typography dependency): headings, lists, tables, code blocks.
- **Sample HTML preview** (Preview tab):
  - Add `src/lib/design-config-to-html.ts` with `designConfigToSampleHtml(config)` that generates a full HTML document string from the current design config.
  - The HTML uses CSS variables for colors, typography, and layout; renders nav (minimal/centered/full/sidebar), hero, sections (features, CTA, footer, etc.) with sample copy; supports sidebar layout for dashboard/docs templates.
  - Replace the previous block preview with an **iframe** whose `srcDoc` is the generated HTML, so the preview is isolated and reflects the real page structure and styles.
- **Dependencies**: `react-markdown`, `remark-gfm` (added to package.json).

## Consequences
- Users can read the design spec as formatted markdown and still edit raw when needed.
- The Preview tab shows a realistic sample page (nav, hero, sections, footer) with configured theme, improving design validation without leaving the app.
- Single source for sample HTML generation; can be reused for export or documentation later if desired.

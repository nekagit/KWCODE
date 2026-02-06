# ADR 023: Design page — configurator and .md generation

## Status
Accepted

## Context
Need a dedicated page to configure and generate design specification files (.md) for web product pages (landing, contact, about, pricing, blog, dashboard, auth, docs, product). Users want templates, structure/outline, colors, typography, layout, live preview, and AI-assisted generation from natural language inputs.

## Decision
- Add a **Design** page at `/design` with:
  - **Template selector**: Page type (landing, contact, about, pricing, blog, dashboard, auth, docs, product, custom) with default section outlines.
  - **Configuration** (tabs: General | Style):
    - General: project name, page title, notes, sections list (enable/disable, order).
    - Style: colors (primary, secondary, accent, background, surface, text, textMuted) with color picker + hex input; typography (heading/body font, base size, scale); layout (max width, spacing, border radius, nav style).
  - **Preview**: Live block preview of sections using configured colors and typography.
  - **Generated .md**: Output from current config (design spec with Colors, Typography, Layout, Page structure). Actions: Generate, Copy, Download.
  - **AI Generate**: Text input to describe the design (e.g. "Dark theme contact page with orange CTA"); calls API to produce a full markdown design spec and optionally update config.
- **Types**: `src/types/design.ts` — `PageTemplateId`, `SectionKind`, `DesignSection`, `DesignColors`, `DesignTypography`, `DesignLayout`, `DesignConfig`, `PageTemplate`.
- **Data**: `src/data/design-templates.ts` — `PAGE_TEMPLATES`, `createDefaultDesignConfig()`.
- **Lib**: `src/lib/design-to-markdown.ts` — `designConfigToMarkdown(config)` producing the .md string.
- **API**: `POST /api/generate-design` — body: `{ description, templateId?, projectName? }`; uses OpenAI to generate a markdown design spec; returns `{ markdown }`. Requires `OPENAI_API_KEY`.
- **Navigation**: Add "Design" with Palette icon to main sidebar (between Ideas and AI Generate).

## Consequences
- Single place to define page design specs and export them as .md for handoff or implementation.
- Templates and structure are reusable; colors/typography/layout are centralized.
- AI generation allows quick iteration from natural language (e.g. "SaaS landing, blue accent").
- OPENAI_API_KEY required for AI design generation (same as existing generate-prompt / generate-tickets).

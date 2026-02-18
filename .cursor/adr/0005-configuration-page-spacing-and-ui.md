# ADR 0005: Configuration page spacing and UI

## Status

Accepted. Implemented 2025-02-18.

## Context

The Configuration page had inconsistent spacing (space-y-0 root with ad-hoc mb-3), no page-level container, and tight section dividers and button groups, making the layout feel cramped and misaligned with other app pages.

## Decision

- **Page layout**
  - Wrapped the Configuration page in the same container used on Ideas and other pages: `container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-12`. Breadcrumb, toolbar, and card now share consistent width and vertical rhythm.

- **Toolbar**
  - Replaced `mb-3 flex justify-end` with `flex flex-wrap items-center justify-end gap-3`. Refresh button uses `h-9 gap-2` and `size-4 shrink-0` icons for consistency with Ideas page controls; removed redundant `ml-2` on label.

- **Card content**
  - Increased vertical spacing between sections from `space-y-6` to `space-y-8`.
  - Section dividers: `pt-2 border-t border-border` → `pt-6 border-t border-border/60` for clearer separation.
  - "Data" label: added `font-medium` and `mb-3` for hierarchy; button group uses `gap-3` instead of `gap-2`.
  - Buttons: standardized to `h-9 gap-2` and `size-4 shrink-0` icons.
  - Version / API health row: `pt-4` → `pt-6 border-t border-border/60`, and `gap-4 sm:gap-6` for the flex row; version copy button label "Copy" → "Copy version" and `h-9 gap-2` for consistency.

## Consequences

- Configuration page aligns with Ideas and other pages (same container and padding).
- Sections are easier to scan; buttons and labels have consistent sizing and spacing.
- No API or component contract changes; only layout and spacing in ConfigurationPageContent.

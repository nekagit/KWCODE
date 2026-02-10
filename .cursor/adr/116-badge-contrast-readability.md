# ADR 116: Badge contrast and readability (white-on-white fix)

## Status

Accepted.

## Context

- Badges throughout the app (projects, ideas, architecture, testing, app-shell, etc.) use the shared `Badge` component from `@/components/ui/badge` with variants: default, secondary, destructive, outline.
- Users reported badges appearing as "white with white text" and unreadable. This can occur when:
  1. The **outline** variant had no background (transparent), so the badge showed the page/card background; if text color was inherited or not applied, it could match the background.
  2. The **critical CSS** in `layout.tsx` (used for Tauri webview and first paint) did not define `--secondary-foreground`. Badges using `text-secondary-foreground` could then have an invalid/computed color and inherit from the parent, leading to low contrast.

## Decision

- **Badge outline variant**
  - Give the outline variant an explicit background and border so it is never transparent: `border border-border bg-background text-foreground hover:bg-muted/50`. This ensures a visible surface and readable text in all themes.

- **Critical CSS**
  - Add `--secondary-foreground: 240 5.9% 10%;` to the `:root` block in the critical inline style in `src/app/layout.tsx`, so that `text-secondary-foreground` and `bg-secondary` are both defined before the full `globals.css` loads. This avoids badges (and any other component using secondary-foreground) from inheriting text color and appearing white-on-white on first paint or in edge cases.

- **No change to theme-driven secondary variant**
  - Keep the secondary variant using theme variables (`bg-secondary text-secondary-foreground`) so badges still follow the selected UI theme (ocean, forest, warm, etc.). All defined themes in `globals.css` already use contrasting secondary/secondary-foreground pairs.

## Consequences

- Badge text is readable in all variants; outline badges have a clear background and border.
- First-paint and Tauri webview no longer risk missing secondary-foreground for badges.
- Themeability of secondary badges is preserved.

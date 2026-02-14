# Design System — KWCode

**Version**: 1.0  
**Last Updated**: 2026-02-13  
**Author**: Design Systems Architect (AI)

---

## Current State Assessment

**Framework & styling**: Next.js 16 with Tailwind CSS. Styling is utility-first via Tailwind; semantic tokens are defined as CSS custom properties in `src/app/globals.css` (HSL, space-separated for Tailwind) and mapped in `tailwind.config.ts`. No CSS-in-JS.

**UI library**: shadcn/ui (New York style) with Radix UI primitives. Components live in `src/components/ui/` (Button, Card, Dialog, Tabs, Select, Badge, Input, Table, Accordion, etc.). Class composition uses `class-variance-authority` (cva), `tailwind-merge`, and `cn()` from `@/lib/utils`.

**Color system**: Mature. Full semantic token set in `:root` and `.dark` (background, foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, info, border, input, ring). Theme variants via `[data-theme="..."]` (light, dark, ocean, forest, warm, red) with dark overrides. `--radius: 1.5rem` globally. No ad-hoc hex in components; tokens used consistently.

**Component structure**: Atomic design (atoms, molecules, organisms) plus `shared` and `ui`. Molecules reference organism class catalogs (`getOrganismClasses`). Shared design scoped via `data-shared-ui` and `shared-design.css` (typography, shadows, card hover).

**Domain**: KWCode is a development workflow and prompts app (B2B/dev tool). Key interactions: Kanban (tickets, columns), data tables, forms/dialogs, sidebar navigation, theme selection, run/terminal UI. Users are technical (developers, teams). Dashboard, projects, tickets, prompts, testing, architecture, ideas, configuration.

**Gaps**: (1) Body uses `uppercase` globally—intentional brand but may need `normal-case` for long body copy. (2) Card uses `rounded-xl` in code while `--radius` is 1.5rem; align to one source. (3) No single type-scale document; shared-design.css has one scale, Tailwind default another—unify. (4) Z-index not centralized (dialog z-50, etc.). (5) Data-viz/Kanban column colors use raw Tailwind (amber, blue, emerald, violet) instead of semantic tokens—consider mapping to design tokens for theme coherence.

---

## 1. Design Philosophy & Principles

### Core Principles

1. **Clarity over decoration** — UI should communicate state and action first; visual flair supports, not obscures.
   - Example: Sidebar active state uses a clear left-border glow (`sidebar-nav-active`) and primary color, not decorative gradients.

2. **Progressive disclosure** — Show essential information first; details on demand (tabs, accordions, dialogs).
   - Example: Project details use tabs (Tickets, Features, Run, Documentation, etc.); Configuration uses theme selector and sections.

3. **Consistent density** — Keep information density predictable so users can scan quickly (tables, Kanban, lists).
   - Example: Data tables and Kanban cards use consistent padding (`p-4`, `gap-3`); CardHeader/CardContent use `p-8` and `space-y-1.5`.

4. **Token-first styling** — All color, radius, and shadow decisions go through design tokens so themes and dark mode stay consistent.
   - Example: Buttons, inputs, cards use `bg-primary`, `border-input`, `rounded-md`/`rounded-lg` (from `--radius`), never raw gray or hex.

5. **Accessible by default** — Focus rings, contrast, and semantics are built in (WCAG 2.1 AA target).
   - Example: Button and Input use `focus-visible:ring-1 focus-visible:ring-ring`; Dialog close has `sr-only` "Close" text; icons from Lucide with consistent size.

6. **Motion with purpose** — Animations are short and purposeful (feedback, enter/exit); respect `prefers-reduced-motion`.
   - Example: Dialog uses `animate-in`/`animate-out`, accordion uses `animate-accordion-down/up`; sidebar nav hover uses `translateX(2px)` and 150ms ease.

7. **One source of truth** — This document and `globals.css` + `tailwind.config.ts` define the system; components reference them, not one-off values.
   - Example: New UI should use `buttonVariants`, `badgeVariants`, and token-based classes; spacing from the scale below.

### Design Values

- **Consistency over flexibility**: The project favors a single, themeable system (tokens, shadcn/ui) so that light/dark/ocean/forest/warm/red all feel coherent. Custom one-off styles are avoided.
- **Speed over pixel precision**: Interactions feel responsive (fast transitions, clear loading states). Slight layout variations are acceptable if they keep implementation simple (e.g. resizable sidebar 160–400px).
- **Simplicity over power**: Primary surfaces are cards, lists, tables, and dialogs; no heavy custom illustrations or complex visuals. Glassmorphism and surface-card are used sparingly for elevation.
- **Accessibility over aesthetics**: Contrast and focus visibility are non-negotiable; we don’t sacrifice readability for a “lighter” look.

### Accessibility Commitment

- **WCAG level**: 2.1 AA minimum; AAA where easy (e.g. body text contrast).
- **Touch targets**: Minimum 44×44px for interactive elements (buttons, nav items). Icon button size `h-9 w-9` (36px) — increase to `h-11 w-11` for touch-heavy contexts if needed.
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text and UI components. Semantic tokens (e.g. `--foreground` on `--background`) are chosen to meet this.
- **Keyboard**: All actions available via keyboard; focus trapped in dialogs; focus order follows visual order. Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (or ring-1 where space is tight).

---

## 2. Color System

### A. Semantic Token Architecture (CSS Custom Properties)

Tokens are HSL values without `hsl()` in CSS (Tailwind adds it). Defined in `src/app/globals.css` for `:root`, `.dark`, and each `[data-theme="..."]`.

**Light (`:root` / `[data-theme="light"]`):**

```css
--background: 210 40% 98%;
--foreground: 222.2 47.4% 11.2%;
--sidebar: 210 40% 96.1%;
--card: 0 0% 100%;
--card-foreground: 222.2 47.4% 11.2%;
--popover: 0 0% 100%;
--popover-foreground: 222.2 47.4% 11.2%;
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--success: 142 71% 45%;
--success-foreground: 0 0% 100%;
--warning: 38 92% 50%;
--warning-foreground: 0 0% 100%;
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 47.4% 11.2%;
--radius: 1.5rem;
```

**Dark (`.dark` / `[data-theme="dark"]`):**

```css
--background: 222 47% 11%;
--foreground: 210 40% 98%;
--sidebar: 222 47% 10%;
--card: 217 33% 17%;
--card-foreground: 210 40% 98%;
--popover: 217 33% 17%;
--popover-foreground: 210 40% 98%;
--primary: 217 91% 60%;
--primary-foreground: 222 47% 11%;
--secondary: 215 25% 27%;
--secondary-foreground: 210 40% 98%;
--muted: 215 25% 27%;
--muted-foreground: 215 20% 65%;
--accent: 215 25% 27%;
--accent-foreground: 210 40% 98%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
--success: 142 70% 50%;
--success-foreground: 144 70% 5%;
--warning: 38 92% 50%;
--warning-foreground: 38 92% 5%;
--info: 217 91% 60%;
--info-foreground: 217 91% 5%;
--border: 215 25% 27%;
--input: 215 25% 27%;
--ring: 217 91% 60%;
--radius: 1.5rem;
```

Tailwind usage: `bg-background`, `text-foreground`, `bg-card`, `text-primary`, `border-border`, `ring-ring`, etc. Radius: `rounded-lg` = `var(--radius)`, `rounded-md` = `calc(var(--radius) - 2px)`, `rounded-sm` = `calc(var(--radius) - 4px)`.

### B. Theme Variants

| Theme   | Personality / use case |
|--------|--------------------------|
| light  | Default light; neutral slate, high contrast. |
| dark   | Default dark; blue primary, glassmorphism-style shadows. |
| ocean  | Blue accent, light blue-tinted background; calm, productive. |
| forest | Green accent, light green-tinted background; growth, nature. |
| warm   | Amber/orange accent, cream background; friendly, energy. |
| red    | Strong red background (e.g. alerts/demos); use sparingly. |

Theme switching: `applyUITheme(themeId)` in `src/data/ui-theme-templates.ts` sets `data-theme` on `document.documentElement` and syncs `dark` class for dark theme. Stored in `localStorage` key `app-ui-theme`. Dark overrides for ocean, forest, warm, red are in `globals.css` (e.g. `.dark[data-theme="ocean"]`).

### C. Data Visualization Palette

For charts, Kanban column tints, and status indicators use a consistent, distinguishable set. Prefer semantic tokens where possible; for Kanban columns the codebase uses:

- Backlog: amber — `bg-amber-500/[0.08] border-amber-500/20`
- In progress: blue — `bg-blue-500/[0.08] border-blue-500/20`
- Done: emerald — `bg-emerald-500/[0.08] border-emerald-500/20`
- Testing: violet — `bg-violet-500/[0.08] border-violet-500/20`

Recommended palette (8+ colors, colorblind-friendly):

| Role     | Light bg tint        | Border/line        |
|----------|----------------------|--------------------|
| 1        | hsl(38 92% 50% / 0.08)  | amber-500/20  |
| 2        | hsl(217 91% 60% / 0.08) | blue-500/20   |
| 3        | hsl(142 71% 45% / 0.08) | emerald-500/20 |
| 4        | hsl(262 83% 58% / 0.08) | violet-500/20  |
| 5        | hsl(25 95% 53% / 0.08)  | orange-500/20  |
| 6        | hsl(199 89% 48% / 0.08) | sky-500/20    |
| 7        | hsl(330 81% 60% / 0.08) | pink-500/20   |
| 8        | hsl(215 25% 27% / 0.15)  | slate (muted) |

Semantic mapping: green/success = done/success; red/destructive = error/blocked; amber = backlog/pending; blue = in progress/info; violet = testing/special.

### D. Contrast Requirements (Reference)

| Foreground       | Background   | Target | Notes        |
|------------------|-------------|--------|-------------|
| --foreground     | --background| AAA    | Body text   |
| --primary        | --background| AA     | Buttons     |
| --primary-foreground | --primary | AA     | Button text |
| --muted-foreground | --background | AA  | Secondary text |
| --destructive    | --background| AA     | Danger actions |

Validate with a contrast checker when changing token values.

### E. Color Usage Rules

- **Primary**: Main actions (e.g. Submit, Save). One primary CTA per section when possible.
- **Secondary / accent**: Secondary actions, nav hover, subtle backgrounds. Use `secondary` for alternate buttons, `accent` for hover states.
- **Destructive**: Delete, remove, irreversible actions. Prefer icon + label (e.g. Trash + "Delete").
- **Success / warning / info**: Status badges, toasts, inline messages. Don’t use red for success or green for errors.
- **Disabled**: `disabled:opacity-50`; ensure contrast stays ≥3:1 (adjust token or opacity if needed).
- **Links**: `text-primary` with `hover:underline` or underline-offset; don’t rely on color alone (underline or icon).
- **Muted**: Supporting text, labels, placeholders — `text-muted-foreground`.

---

## 3. Typography

### A. Font Stack

Primary (system UI; no custom font in layout):

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

Monospace (code, terminals):

```css
font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
  Consolas, 'Courier New', monospace;
```

Tailwind: `font-sans` (default), `font-mono` for code. Consider adding Geist or Inter via `next/font` if a branded typeface is desired.

### B. Type Scale

Align with Tailwind and shared-design.css. Use these as the canonical scale:

| Size | Font Size | Line Height | Letter Spacing | Weight | Usage |
|------|-----------|-------------|----------------|--------|-------|
| xs   | 12px      | 16px        | 0              | 400    | Captions, labels, table cells |
| sm   | 14px      | 20px        | 0              | 400    | Body small, secondary text |
| base | 16px      | 24px        | 0              | 400    | Primary body text |
| lg   | 18px      | 28px        | -0.01em        | 400    | Lead paragraph, emphasis |
| xl   | 20px      | 28px        | -0.01em        | 600    | Small headings |
| 2xl  | 24px      | 32px        | -0.02em        | 700    | Section headings |
| 3xl  | 30px      | 36px        | -0.02em        | 700    | Page headings |
| 4xl  | 36px      | 40px        | -0.03em        | 800    | Hero / landing |

Tailwind: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`; `leading-*`, `tracking-*`, `font-normal`/`font-medium`/`font-semibold`/`font-bold`.

**Note**: `body` in globals uses `uppercase`. Reserve for nav and short labels; use `normal-case` for paragraphs and long content to preserve readability.

### C. Heading Hierarchy

- **H1**: `text-3xl` (30px), `font-bold`, `tracking-tight` — Page title (e.g. "Dashboard", "Projects").
- **H2**: `text-2xl` (24px), `font-bold`, `tracking-tight` — Section (e.g. "Recent Projects", "Tickets").
- **H3**: `text-xl` (20px), `font-semibold` — Subsection (e.g. "Project Settings", "Run Configuration").
- **H4**: `text-lg` (18px), `font-semibold` — Card titles, small sections (e.g. "Advanced Options").

Use a single H1 per page; don’t skip levels (h1 → h2 → h3).

### D. Text Color Hierarchy

- **Primary**: Main content — `text-foreground`.
- **Secondary**: Supporting — `text-muted-foreground` or opacity ~0.8.
- **Tertiary**: Metadata, timestamps — `text-muted-foreground` or opacity ~0.6.
- **Placeholder**: Form hints — `placeholder:text-muted-foreground`.
- **Disabled**: — `text-muted-foreground/70` or `disabled:opacity-50` on control.
- **Link**: — `text-primary` + `hover:underline`.
- **Link hover**: — `hover:text-primary/90`.
- **Destructive**: — `text-destructive`.

### E. Typography Rules

- Max line length: 65–75 characters for long prose (e.g. `max-w-prose`).
- Paragraph spacing: ~1em between paragraphs.
- List spacing: ~0.5em between items.
- Inline code: `font-mono`, `bg-muted` (or similar), `px-1.5 py-0.5`, `rounded`.
- Code blocks: Use a syntax-highlighting theme that respects `--foreground`/`--background` and `--muted-foreground`.

---

## 4. Spacing & Layout

### A. Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| 0     | 0px   | No space |
| 0.5   | 2px   | Minimal (icon + text) |
| 1     | 4px   | Tight (chip padding, gap in nav) |
| 1.5   | 6px   | Compact (button py, small gaps) |
| 2     | 8px   | Default small (card inner, label–input) |
| 3     | 12px  | Comfortable (form field padding) |
| 4     | 16px  | Default medium (card padding, section padding) |
| 5     | 20px  | Relaxed |
| 6     | 24px  | Spacious (page padding mobile, content gap) |
| 8     | 32px  | Component gaps, section spacing |
| 10    | 40px  | Large (page padding desktop) |
| 12    | 48px  | Extra large (section spacing) |
| 16    | 64px  | Hero / large section |
| 20    | 80px  | Page section breaks |
| 24    | 96px  | Max (landing) |

Tailwind: `p-2`, `gap-4`, `space-y-6`, etc.

### B. Layout Grid

- **Container max width**: No global max; main content can be full width. Use `max-w-7xl` or `max-w-screen-xl` for centered content when desired.
- **Gutter**: `gap-4` or `gap-6` for grids.
- **Columns**: 12-column mental model; implement with Tailwind grid (e.g. `grid grid-cols-12 gap-4`).

### C. Component Spacing Rules

**Cards**

- Padding: `p-4` (16px) default; Card component uses `p-8` for CardHeader/CardContent — reserve for large cards.
- Gap between cards: `gap-4`.
- Card grid: `gap-4` or `gap-6`.

**Forms**

- Label → input: `space-y-2` or `gap-2`.
- Input → helper: `mt-1.5`.
- Field → field: `space-y-4`.
- Section → section: `space-y-8`.

**Sections**

- Section padding: `py-12` mobile, `py-16` desktop (or `px-6`/`px-10`).
- Section gap: `space-y-16`.
- Heading → content: `space-y-6` or `mb-6`.

**Navigation**

- Sidebar width: 192px default (resizable 160–400px), collapsed 52px (`app-shell.tsx`).
- Sidebar padding: `p-4`.
- Nav item: `px-2` or `px-3`, `py-2`; gap between icon and label `gap-2`.

### D. Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-toast: 1070;
--z-tooltip: 1080;
```

Current usage: Dialog overlay/content `z-50` (map to `--z-modal`). Standardize new work to this scale (e.g. Tailwind `z-[1050]` or extend theme).

### E. Responsive Breakpoints

Tailwind defaults:

```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

- **&lt; 640px**: Single column, full-width cards, sidebar as overlay or hidden.
- **640–1024px**: 2-column where useful, sidebar toggle.
- **1024–1536px**: Sidebar visible, multi-column content.
- **&gt; 1536px**: Max content width or extra margins if needed.

### F. Sidebar Layout Spec

- **Desktop (lg+)**: Fixed left; width 192px default, resizable 160–400px; collapse to 52px (icon-only). Storage key: `kwcode-sidebar-width`.
- **Tablet / mobile**: Sidebar can overlay with backdrop or hide; main content full width.
- **Resize**: Drag handle on right edge; cursor `col-resize` during drag.

---

## 5. Component Design Patterns

### A. Buttons

**Variants**: default (primary), destructive, success, warning, info, outline, secondary, ghost, link.

**Sizes**: `default` (h-9 px-4 py-2), `sm` (h-8 px-3 text-xs), `lg` (h-10 px-8), `icon` (h-9 w-9).

**States**: default, hover (e.g. `bg-primary/90`), active (optional scale), focus-visible (ring-1 ring-ring), disabled (opacity-50, pointer-events-none), loading (spinner + disabled).

**Tailwind (from `buttonVariants`):**

```tsx
const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";
const defaultVariant = "bg-primary text-primary-foreground shadow hover:bg-primary/90";
const outlineVariant = "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";
const ghostVariant = "hover:bg-accent hover:text-accent-foreground";
```

**Accessibility**: Use `<button>` or `asChild` with Radix Slot; icon-only buttons need `aria-label`.

### B. Inputs

**Types**: text, email, password, number, search; Textarea for multi-line.

**States**: default, focus (ring-1 ring-ring), error (border-destructive + error message), disabled (opacity-50, cursor-not-allowed).

**Anatomy**: `h-9`, `rounded-md`, `border border-input`, `px-3 py-1`, `text-base md:text-sm`, `placeholder:text-muted-foreground`, `shadow-sm`.

**Prefix/suffix**: Wrap in a container with `flex`, input `flex-1`; add `pl-9` or `pr-9` when using icon.

**Accessibility**: Associate with `<Label>` or `aria-label`; `aria-invalid` and `aria-describedby` for errors.

### C. Cards

**Default**: `rounded-xl border bg-card text-card-foreground shadow` (align `rounded-xl` with `var(--radius)` if standardizing).

**Hover**: Optional `hover:shadow-lg` or use `.surface-card:hover` (shared-design.css).

**Selected**: `ring-2 ring-ring ring-offset-2` or `border-primary`.

**Disabled**: `opacity-50 pointer-events-none`.

**Anatomy**: CardHeader `p-8`, CardContent `p-8 pt-0`, CardFooter `p-8 pt-0`; for compact cards use `p-4`.

### D. Badges / Pills

**Variants**: default (primary), secondary, destructive, outline. Optional success/warning/info if needed.

**Sizes**: `px-3 py-1 text-sm font-semibold`; sm: `text-xs px-2 py-0.5`; lg: `text-base px-4 py-1.5`.

**Style**: `rounded-lg border`; default uses `glasgmorphism` in codebase — use for floating contexts; use solid `bg-*` for inline badges.

**Accessibility**: Prefer text or icon+text; don’t rely on color alone for status.

### E. Dialogs / Modals / Sheets

**Overlay**: `bg-black/50`, `data-[state=open]:animate-in data-[state=closed]:animate-out`, fade.

**Content**: `max-w-[calc(100%-2rem)] sm:max-w-lg`, `rounded-lg`, `p-6`, `gap-4`, `border bg-background shadow-lg`, `duration-200`, zoom + slide animation.

**Close**: Absolute top-right, `rounded-sm opacity-70 hover:opacity-100`, `focus:ring-2 focus:ring-ring focus:ring-offset-2`, plus `sr-only` "Close".

**Accessibility**: Focus trap (Radix), `DialogTitle` and `DialogDescription` for screen readers, Esc to close.

### F. Tabs

**List**: `inline-flex h-11 items-center rounded-lg bg-muted p-2 text-muted-foreground gap-1`.

**Trigger**: `rounded-md px-5 py-2.5 text-sm font-medium`, `data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow`, `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

**Content**: `mt-4 pt-6 pb-6 px-2`.

**Accessibility**: Radix Tabs handles keyboard (arrows) and ARIA.

### G. Tables

**Header**: `border-b`, `font-medium` or `font-semibold`, background `bg-muted/50` optional.

**Row hover**: `hover:bg-muted/50`.

**Row striping**: Optional `even:bg-muted/30`.

**Cell padding**: `p-4` or `px-4 py-3`.

**Sticky header**: `sticky top-0 z-10 bg-background` (or bg-muted) and border-b.

### H. Kanban Columns

**Column**: `rounded-xl border p-4`, `min-h-[400px]`, column-specific bg/border (e.g. `bg-amber-500/[0.08] border-amber-500/20`).

**Card gap**: `gap-3`.

**Drag-over**: Distinct background or border (e.g. `ring-2 ring-primary/50`).

**Empty state**: Centered text, `text-muted-foreground`, dashed border, `py-12`.

### I. Toast / Notifications

**Library**: Sonner; position `top-center` in layout.

**Variants**: success, error, info, warning (Sonner `richColors`).

**Duration**: Default ~4s; persist for critical errors.

**Dismiss**: Built-in; ensure focus and aria live region.

### J. Dropdowns / Select

**Trigger**: `h-9`, `rounded-md border border-input`, `px-3 py-2`, `focus:ring-1 focus:ring-ring`.

**Menu**: `bg-popover text-popover-foreground`, shadow, border, `rounded-md`; item hover `bg-accent`; selected check icon.

**Accessibility**: Radix handles focus, arrows, Enter, Esc.

### K. Accordion / Collapsible

**Trigger**: `py-4`, `[&[data-state=open]>svg]:rotate-180` (chevron 180deg).

**Content**: `animate-accordion-down` / `animate-accordion-up`, `pb-4 pt-0`.

**Border**: `border-b` on item.

### L. Tooltips / Popovers

**Tooltip**: Inverted or card-like background, small padding, `text-sm`; max-width ~240px; arrow optional.

**Popover**: Same as dropdown menu (popover token, shadow, border).

**Offset**: 4–8px from trigger; avoid covering trigger.

**Accessibility**: `TooltipProvider`, focus triggers; ensure content is announced.

---

## 6. Iconography

### A. Icon Library

**Lucide React** (`lucide-react`). Alias in `components.json`: `"iconLibrary": "lucide"`.

### B. Icon Size Scale

| Size    | Pixels | Tailwind | Usage |
|---------|--------|-----------|-------|
| xs      | 12px   | h-3 w-3   | Inline text |
| sm      | 14px   | h-3.5 w-3.5 | Small buttons, badges |
| default | 16px   | h-4 w-4   | Standard UI (buttons, inputs) |
| md      | 18px   | h-[18px] w-[18px] | Emphasis |
| lg      | 20px   | h-5 w-5   | Section headers |
| xl      | 24px   | h-6 w-6   | Page headers, CTAs |
| 2xl     | 32px   | h-8 w-8   | Feature icons |
| 3xl     | 48px   | h-12 w-12 | Hero |

Button defaults: `[&_svg]:size-4`.

### C. Stroke Width

Lucide default 2px is used; keep default unless a “thin” set is introduced (1.5px) for dense UIs.

### D. Icon Usage Rules

- **Icon only**: Only for universal actions (e.g. close, menu, settings); always pair with `aria-label`.
- **Icon + label**: Preferred for primary and destructive actions (e.g. "Delete" + Trash2).
- **Position**: Leading for nav and primary actions; trailing for external link or “open”.
- **Color**: Inherit text color; use semantic colors for status (e.g. Check = success, AlertCircle = warning).

### E. Common Icons (Lucide names)

- Menu / close: `Menu`, `X`
- Actions: `Plus`, `Trash2`, `Pencil`, `Copy`, `Download`
- Nav: `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ArrowLeft`
- Status: `Check`, `AlertCircle`, `Info`, `XCircle`
- App: `LayoutDashboard`, `Folder`, `FileText`, `MessageSquare`, `Terminal`, `Settings`, `Play`, `TestTube2`, `Building2`, `Lightbulb`, `LayoutGrid`, `Moon`

---

## 7. Motion & Animation

### A. Easing

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

Tailwind: `ease-out`, `ease-in`, `ease-in-out`; custom in config if needed.

### B. Duration

```css
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

Tailwind: `duration-150`, `duration-200`, `duration-300`; config has `250`, `350`.

### C. Animation Patterns

- **Button press**: `active:scale-95` or `scale(0.98)` (shared-design).
- **Card hover**: `transition-shadow duration-200 hover:shadow-lg` or `.surface-card:hover`.
- **Dialog**: Overlay `fade-in`; content `zoom-in-95` + `slide-in-from-top-[48%]`, `duration-200`.
- **Sidebar nav**: `translateX(2px)` hover, 150ms ease; active indicator `sidebar-indicator-in` 200ms.
- **Accordion**: `animate-accordion-down` / `animate-accordion-up` (0.2s ease-out).
- **Toast**: `slide-in-from-right` or Sonner default.

### D. When to Animate

- **Do**: Hover (shadow, color, slight move), focus ring, mount/unmount (dialog, toast, dropdown), drag (lift/shadow), expand/collapse, loading (pulse/spin).
- **Don’t**: Text selection, scroll (unless intentional), layout shifts that cause CLS, long blocking animations (&gt; ~300ms for UI).

### E. Reduced Motion

Respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Tailwind: `motion-reduce:transition-none` etc. where available.

---

## 8. Dark Mode & Theme Strategy

### A. Theme System

- **Method**: CSS custom properties + `data-theme` on `<html>` + `.dark` class for dark.
- **Apply**: `applyUITheme(themeId)` sets `document.documentElement.setAttribute('data-theme', themeId)` and toggles `dark` for `themeId === 'dark'`.
- **Storage**: `localStorage.getItem('app-ui-theme')`; inline script in layout sets theme before paint to avoid flash.

### B. Dark Mode Adjustments

- **Background**: Dark but not pure black (e.g. 222 47% 11%).
- **Foreground**: Off-white (e.g. 210 40% 98%).
- **Shadows**: Softer; dark theme in globals uses `box-shadow` + `backdrop-filter` for glass effect.
- **Borders**: Lighter in dark (e.g. 215 25% 27%) for separation.
- **Images**: Optional overlay or reduced opacity if needed.

### C. Testing Checklist

- [ ] All text readable in light and dark (contrast).
- [ ] No hardcoded hex/gray; use tokens only.
- [ ] Hover/focus visible in both.
- [ ] Shadows/borders work in both.
- [ ] Icons and images adapt if needed.
- [ ] Loading states visible in both.

### D. Anti-Patterns

- Don’t use opacity alone to “darken” in dark mode (can shift hue).
- Don’t hardcode `#000` or `#fff`; use `--background` / `--foreground`.
- Do use HSL for tokens so lightness can be tuned per theme.
- Test with a colorblind simulator and high-contrast if offered.

---

## 9. Accessibility Guidelines

### A. WCAG 2.1 AA

- **Contrast**: 4.5:1 text, 3:1 UI.
- **Touch targets**: 44×44px minimum where possible.
- **Focus**: Visible focus indicator (ring) on all interactive elements.
- **Keyboard**: Full functionality via keyboard; trap focus in modals.
- **Labels**: All controls have visible or accessible labels; icon-only has `aria-label`.
- **Color**: Not the only indicator (use icon, text, or pattern as well).

### B. Focus Management

- **Ring**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (or ring-1 for compact components).
- **Trap**: Dialogs and drawers trap focus (Radix).
- **Order**: Tab order matches visual order; use `tabIndex` only when necessary.

### C. Semantic HTML

- `<button>` for actions; `<a>` for navigation; `<input>`/`<select>`/`<textarea>` for form fields.
- Headings in order (h1 → h2 → h3); one h1 per page.

### D. ARIA

- Icon-only button: `aria-label="Close"` (or equivalent).
- Input: `<Label>` or `aria-label`; errors: `aria-invalid` and `aria-describedby`.
- Live regions: `aria-live="polite"` or `role="status"` for toasts/notifications.
- Loading: `aria-label="Loading"` and `role="status"`.

### E. Keyboard

| Element   | Keys     | Behavior |
|----------|----------|----------|
| Button   | Enter, Space | Activate |
| Dialog   | Esc      | Close |
| Select/Dropdown | Arrow keys | Navigate; Enter select |
| Tabs     | Arrows   | Switch tab |
| Accordion | Enter, Space | Toggle |

---

## 10. Design Anti-Patterns (Avoid These)

1. **Inconsistent border radius**  
   ❌ Mix of `rounded-sm`, `rounded-lg`, `rounded-xl` with no rule.  
   ✅ Use `--radius` (e.g. `rounded-lg`) or a clear scale (sm/md/lg) everywhere.

2. **Random shadow depths**  
   ❌ Different shadows on similar cards with no hierarchy.  
   ✅ Define levels: `shadow` (cards), `shadow-lg` (modals), `shadow-sm` (hover).

3. **Orphan text sizes**  
   ❌ `text-[15px]`, `text-[17px]`.  
   ✅ Use type scale: `text-sm`, `text-base`, `text-lg`, etc.

4. **Unlabeled icon buttons**  
   ❌ `<button><Trash2 /></button>`.  
   ✅ `<button aria-label="Delete"><Trash2 /></button>`.

5. **Hardcoded colors**  
   ❌ `text-gray-700 dark:text-gray-300`.  
   ✅ `text-foreground` or `text-muted-foreground`.

6. **Unreadable disabled state**  
   ❌ Too low contrast.  
   ✅ Keep contrast ≥3:1; use opacity or muted token.

7. **Inconsistent spacing**  
   ❌ Random `p-3`, `p-4`, `p-5` for similar components.  
   ✅ One default (e.g. `p-4` for cards) and stick to the scale.

8. **Overuse of bold**  
   ❌ Everything bold.  
   ✅ Normal for body; semibold for headings; bold for strong emphasis only.

9. **Invisible focus**  
   ❌ `outline-none` with no ring.  
   ✅ Always `focus-visible:ring-2` (or ring-1) with `ring-ring`.

10. **Color-only status**  
    ❌ Green/red only.  
    ✅ Icon + color (e.g. Check + green, XCircle + red).

11. **Excessive animation**  
    ❌ Long transitions everywhere.  
    ✅ Short (100–200ms), purposeful motion; respect reduced motion.

12. **Ignoring the grid**  
    ❌ Random widths and alignment.  
    ✅ Align to grid and spacing scale; consistent container widths.

13. **Reinventing controls**  
    ❌ Custom checkbox/select from divs.  
    ✅ Native `<input type="checkbox">` or Radix/shadcn components.

14. **No loading states**  
    ❌ Button stays static after click.  
    ✅ Spinner or "Saving…" and disabled state.

15. **Desktop-only layout**  
    ❌ Broken on small screens.  
    ✅ Mobile-first; test at sm, md, lg.

---

## Appendix: Quick Reference

### Color Tokens (Tailwind)

| Token   | Usage |
|--------|--------|
| background, foreground | Page and text |
| card, card-foreground   | Cards, panels |
| primary, primary-foreground | Primary actions |
| secondary, accent       | Secondary actions, hovers |
| muted, muted-foreground | Subtle text, disabled |
| destructive, success, warning, info | Status and actions |
| border, input, ring      | Borders, inputs, focus |

### Type Scale

| Class     | Size | Use |
|-----------|------|-----|
| text-xs   | 12px | Captions |
| text-sm   | 14px | Secondary |
| text-base | 16px | Body |
| text-lg   | 18px | Lead |
| text-xl   | 20px | H3 |
| text-2xl  | 24px | H2 |
| text-3xl  | 30px | H1 |

### Spacing Scale

| Class | Value |
|-------|--------|
| 1  | 4px  |
| 2  | 8px  |
| 3  | 12px |
| 4  | 16px |
| 6  | 24px |
| 8  | 32px |
| 12 | 48px |

---

*This design system is a living document. Update it as the project evolves.*

# Design System — KWCode

**Version**: 1.0  
**Last Updated**: 2025-02-17  
**Author**: Design Systems Architect (AI)

---

## Current State Assessment

**Framework & styling**: Next.js 16 with React 18, Tailwind CSS 3.4, and CSS custom properties (HSL). No CSS-in-JS. Global styles in `src/app/globals.css` and shared design tokens in `src/components/shared/shared-design.css`.

**UI library**: shadcn/ui (new-york style) with Radix UI primitives. Components live in `src/components/ui` (Button, Card, Dialog, Accordion, Tabs, Table, Badge, Input, Select, etc.). Icons: Lucide React.

**Color system**: Full semantic token set in `:root` and `.dark` (HSL triplets without `hsl()` wrapper; Tailwind uses `hsl(var(--name))`). Tokens include background, foreground, card, primary, secondary, muted, accent, destructive, success, warning, info, border, input, ring. Theme variants: light, dark, ocean, forest, warm, red via `data-theme`. Radius token: `--radius: 1.5rem`.

**Component structure**: Atomic-style (atoms, molecules, organisms) plus `shared` and `ui`. Molecules reference `@/components/ui` and shared design (e.g. `data-shared-ui`, `glass-card`, `surface-card`).

**Domain**: KWCode is a B2B/developer desktop app (Tauri + Next) for development workflow and prompts—projects, ideas, planner, worker (Implement All), terminals, configuration. Target users: developers and technical teams. Key interactions: forms, Kanban/tickets, accordions, tabs, dialogs, toasts, terminal output.

**Gaps**: Card padding is inconsistent (e.g. `p-8` in CardHeader/CardContent vs. `p-4 md:p-6` in project tabs). Some `rounded-xl` vs. `rounded-lg` vs. `var(--radius)` mix. Typography uses Tailwind defaults plus shared-design scale; no single type-scale table documented. Z-index and spacing scales are implicit. Motion uses tailwindcss-animate and custom keyframes; reduced-motion not explicitly documented. Design anti-patterns and usage rules are not written down.

---

## 1. Design Philosophy & Principles

### Core Principles

1. **Clarity over decoration** — Every visual element should support understanding and task completion.
   - Example: Project details tabs use clear labels (Project, Planner, Worker, Control) and semantic colors for status (success/destructive/warning badges).

2. **Progressive disclosure** — Show essentials first; reveal complexity on demand.
   - Example: Accordions (Ideas doc, project tabs) keep sections collapsed by default; Run section and Worker terminal output expand when needed.

3. **Consistent density** — Balance information density with readability for long sessions.
   - Example: Sidebar nav uses resizable width (160–400px), default 192px; list items use consistent padding and `sidebar-nav-item` hover/active states.

4. **Semantic color, never color alone** — Status and meaning use color plus icon or text.
   - Example: Terminal status badges and destructive actions use Badge/Button variants with both color and label (e.g. "Failed", "Stop").

5. **Theme coherence** — All surfaces and text derive from semantic tokens so light/dark and named themes (ocean, forest, warm) stay consistent.
   - Example: `globals.css` defines full token sets per `data-theme`; components use `bg-card`, `text-muted-foreground`, etc.

6. **Accessible by default** — Focus rings, contrast, and keyboard flow are built in.
   - Example: Buttons and inputs use `focus-visible:ring-1 focus-visible:ring-ring`; Dialog close has `sr-only` "Close"; Toaster is `top-center` for visibility.

7. **Performance and reduced motion** — Animations are short and purposeful; respect `prefers-reduced-motion`.
   - Example: Dialog uses `duration-200` and zoom/slide; accordion uses `animate-accordion-down`; sidebar uses `transition-[width]` for resize.

### Design Values

- **Speed vs. Precision**: Favor speed of execution and clarity for developer workflows (quick actions, toasts, terminal feedback) while keeping data precise (forms, tickets, milestones).
- **Simplicity vs. Power**: Lean toward simplicity in the UI surface; power lives in worker/Implement All, configuration, and APIs rather than in dense controls.
- **Flexibility vs. Consistency**: Prefer consistency in components and tokens; flexibility in theme choice (light/dark/ocean/forest/warm/red) and sidebar width.
- **Tool-like vs. Consumer**: UI feels like a professional tool (dashboards, tables, forms, terminals) not a consumer app—clear hierarchy, minimal decoration.

### Accessibility Commitment

- **WCAG target**: 2.1 Level AA minimum; AAA where feasible for text contrast.
- **Touch targets**: Minimum 44×44px for interactive elements (buttons, nav items, tab triggers). Icon-only buttons use `h-9 w-9` (36px); ensure tap area or use larger hit area.
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text and UI components. Semantic tokens are chosen to meet these on their backgrounds.
- **Keyboard**: All actions reachable by keyboard; focus trapped in dialogs; visible focus ring (`ring-ring`, 1–2px) on focus-visible.

---

## 2. Color System

### A. Semantic Token Architecture (HSL)

Values are stored as space-separated H S% L% (no `hsl()`). Use in CSS as `hsl(var(--name))` or Tailwind as `bg-primary`, `text-muted-foreground`, etc.

**Light (`:root`):**

| Token | H S% L% | Notes |
|-------|---------|--------|
| --background | 210 40% 98% | Slate 50 |
| --foreground | 222.2 47.4% 11.2% | Slate 900 |
| --sidebar | 210 40% 96.1% | Slate 100 |
| --card | 0 0% 100% | White |
| --card-foreground | 222.2 47.4% 11.2% | Slate 900 |
| --popover | 0 0% 100% | White |
| --popover-foreground | 222.2 47.4% 11.2% | Slate 900 |
| --primary | 222.2 47.4% 11.2% | Slate 900 |
| --primary-foreground | 210 40% 98% | Slate 50 |
| --secondary | 210 40% 96.1% | Slate 100 |
| --secondary-foreground | 222.2 47.4% 11.2% | Slate 900 |
| --muted | 210 40% 96.1% | Slate 100 |
| --muted-foreground | 215.4 16.3% 46.9% | Slate 500 |
| --accent | 210 40% 96.1% | Slate 100 |
| --accent-foreground | 222.2 47.4% 11.2% | Slate 900 |
| --destructive | 0 84.2% 60.2% | Red |
| --destructive-foreground | 0 0% 98% | Near white |
| --success | 142 71% 45% | Green |
| --success-foreground | 0 0% 100% | White |
| --warning | 38 92% 50% | Amber |
| --warning-foreground | 0 0% 100% | White |
| --info | 217 91% 60% | Blue |
| --info-foreground | 0 0% 100% | White |
| --border | 214.3 31.8% 91.4% | Slate 200 |
| --input | 214.3 31.8% 91.4% | Slate 200 |
| --ring | 222.2 47.4% 11.2% | Slate 900 |
| --radius | 1.5rem | Global radius |

**Dark (`.dark`):**

| Token | H S% L% | Notes |
|-------|---------|--------|
| --background | 222 47% 11% | Slate 900 |
| --foreground | 210 40% 98% | Slate 50 |
| --sidebar | 222 47% 10% | Slightly darker |
| --card | 217 33% 17% | Slate 800 |
| --card-foreground | 210 40% 98% | Slate 50 |
| --popover | 217 33% 17% | Slate 800 |
| --primary | 217 91% 60% | Blue (accent in dark) |
| --primary-foreground | 222 47% 11% | Dark |
| --secondary | 215 25% 27% | Slate 700 |
| --muted | 215 25% 27% | Slate 700 |
| --muted-foreground | 215 20% 65% | Slate 400 |
| --accent | 215 25% 27% | Slate 700 |
| --destructive | 0 84.2% 60.2% | Same red |
| --border | 215 25% 27% | Slate 700 |
| --input | 215 25% 27% | Slate 700 |
| --ring | 217 91% 60% | Blue |

### B. Theme Variants

Applied via `data-theme` on `<html>` (and `.dark` for dark mode). Stored in `localStorage` and applied by `UIThemeProvider` script before paint.

| Theme | Personality | Use case |
|-------|-------------|----------|
| light | Neutral, high contrast | Default light |
| dark | Cool dark, blue primary | Default dark |
| ocean | Cool, blue-tinted | Calm, dev-focused |
| forest | Green-tinted | Natural, growth |
| warm | Amber/orange tint | Warm, energy |
| red | High-contrast red | Alert / demo |

Dark overrides for ocean, forest, warm, red reuse the same dark base (slate backgrounds) and override only primary/ring to match the theme hue.

### C. Data Visualization Palette

Use for charts, Kanban columns, status series (distinguishable and colorblind-safe where possible):

| Role | Token / Color | Usage |
|------|----------------|--------|
| 1 | `hsl(var(--primary))` | Primary series |
| 2 | `hsl(var(--info))` | Secondary / info |
| 3 | `hsl(var(--success))` | Success / done |
| 4 | `hsl(var(--warning))` | Warning / in progress |
| 5 | `hsl(var(--destructive))` | Error / blocked |
| 6 | `hsl(var(--muted-foreground))` | Neutral |
| 7 | `hsl(280 60% 50%)` | Extra series (purple) |
| 8 | `hsl(180 60% 45%)` | Extra series (teal) |

Semantic mapping: green = success/done, red = error/destructive, amber = warning/in-progress, blue = info/primary in dark.

### D. Contrast Requirements (Reference)

| Foreground | Background | Target | WCAG |
|------------|------------|--------|------|
| --foreground | --background | ≥ 7:1 (dark on light) | AAA |
| --primary | --background | ≥ 4.5:1 | AA |
| --muted-foreground | --background | ≥ 4.5:1 | AA |
| --primary-foreground | --primary | ≥ 4.5:1 | AA |
| --destructive-foreground | --destructive | ≥ 4.5:1 | AA |

### E. Color Usage Rules

- **Primary**: Main actions, active nav, key CTAs. In dark mode primary is blue for visibility.
- **Acccent**: Hover/secondary surfaces (e.g. `hover:bg-accent`).
- **Destructive**: Delete, stop, error states only. Use with label or icon.
- **Success/Warning/Info**: Status badges, toasts, alerts. Always pair with icon or text.
- **Disabled**: `disabled:opacity-50`; ensure contrast stays ≥ 3:1 where possible.
- **Links**: `text-primary` with `hover:underline` for link variant.
- Never use red for success or green for destructive; keep semantic meaning consistent.

---

## 3. Typography

### A. Font Stack

**Primary (sans):**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```
Tailwind default; no custom font in use. For a future brand font, prefer Inter or Geist Sans and add to `tailwind.config` and `layout.tsx`.

**Monospace (code):**
```css
font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, 'Cascadia Code',
  'Roboto Mono', Consolas, 'Courier New', monospace;
```
Use `font-mono` for code and terminal content.

### B. Type Scale

| Size | Font Size | Line Height | Letter Spacing | Weight | Usage |
|------|-----------|-------------|----------------|--------|--------|
| xs | 12px | 16px | 0.01em | 400 | Captions, labels, metadata |
| sm | 14px | 20px | 0 | 400 | Body small, secondary text |
| base | 16px | 24px | 0 | 400 | Primary body |
| lg | 18px | 28px | -0.01em | 400 | Large body |
| xl | 20px | 28px | -0.01em | 600 | Small headings |
| 2xl | 24px | 32px | -0.02em | 700 | Section headings |
| 3xl | 30px | 36px | -0.02em | 700 | Page headings |
| 4xl | 36px | 40px | -0.03em | 800 | Hero |

Tailwind: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`. Shared-design overrides in `[data-shared-ui]`: `--shared-font-size-base`, `--shared-font-size-3xl` for h1, etc.

### C. Heading Hierarchy

- **H1**: `text-2xl md:text-3xl font-bold tracking-tight` — Page title (e.g. project name on Project Details).
- **H2**: `text-2xl font-bold tracking-tight` — Section (e.g. "Recent Projects", "Dashboard").
- **H3**: `text-xl font-semibold` — Subsection (e.g. "Project Settings", tab content headers).
- **H4**: `text-lg font-semibold` — Card titles, small sections.

Do not skip levels (e.g. H1 → H3).

### D. Text Color Hierarchy

| Role | Token / Class | Usage |
|------|----------------|--------|
| Primary | `text-foreground` | Main content |
| Secondary | `text-muted-foreground` or opacity 70% | Supporting text |
| Tertiary | `text-muted-foreground` opacity 50% | Metadata, timestamps |
| Placeholder | `placeholder:text-muted-foreground` | Form hints |
| Disabled | `disabled:opacity-50` + muted | Non-interactive |
| Link | `text-primary` | Links |
| Link Hover | `hover:underline` | Link interaction |
| Destructive | `text-destructive` | Errors, danger |

### E. Typography Rules

- Max line length for long text: 65–75 characters (use `max-w-prose` or `max-w-2xl` where appropriate).
- Paragraph spacing: `space-y-4` or 1.5em between paragraphs.
- List spacing: `space-y-2` or 0.5em between items.
- Inline code: `font-mono`, `bg-muted` or `bg-muted/50`, `px-1.5 py-0.5`, `rounded` (e.g. `rounded-md`).
- Code blocks: Use syntax highlighting; background `bg-muted` or card surface; border `border-border`.

---

## 4. Spacing & Layout

### A. Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|--------|
| 0 | 0px | No space |
| 0.5 | 2px | Icon + text gap |
| 1 | 4px | Tight (chip padding) |
| 1.5 | 6px | Compact (button py) |
| 2 | 8px | Small (card inner) |
| 3 | 12px | Form field padding |
| 4 | 16px | Default card padding |
| 5 | 20px | Section padding |
| 6 | 24px | Page padding mobile |
| 8 | 32px | Component gaps |
| 10 | 40px | Page padding desktop |
| 12 | 48px | Section spacing |
| 16 | 64px | Large sections |
| 20 | 80px | Section breaks |
| 24 | 96px | Hero / landing |

Tailwind: `p-2`, `gap-4`, `space-y-6`, etc.

### B. Layout Grid

- **Container max width**: No global max; use `max-w-*` per page (e.g. `max-w-4xl` for dialogs, `max-w-2xl` for forms).
- **Gutter**: `gap-4` (16px) default; `gap-6` for sections.
- **Columns**: 12-column mental model; use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` etc. as needed.

### C. Component Spacing Rules

**Cards**
- Padding: `p-4` (16px) default; `p-6` or `p-8` for large cards (CardHeader/CardContent use `p-8` in ui/card; project tabs use `p-4 md:p-6`). Standardize on `p-4` for compact, `p-6` for content-heavy.
- Gap between cards: `gap-4`.
- Grid gap: `gap-4`.

**Forms**
- Label → Input: `space-y-2` (8px).
- Input → Helper: `space-y-1.5` (6px).
- Field → Field: `space-y-4` (16px).
- Section → Section: `space-y-8` (32px).

**Sections**
- Section padding: `py-8 md:py-12` or `p-6 md:p-8`.
- Section gap: `space-y-8` or `gap-8`.
- Heading → Content: `space-y-6` or `mb-6`.

**Navigation**
- Sidebar width: 160–400px, default 192px; collapsed 52px. Stored in `localStorage` (`kwcode-sidebar-width`).
- Sidebar padding: `p-4` (16px).
- Nav item: `px-3 py-2` or equivalent; gap between icon and label `gap-2`.

### D. Z-Index Scale

| Token | Value | Usage |
|-------|--------|--------|
| base | 0 | Document flow |
| dropdown | 50 | Dropdowns (Radix/shadcn use z-50) |
| sticky | 1020 | Sticky headers |
| fixed | 1030 | Fixed elements |
| modal-backdrop | 50 | Dialog overlay (z-50 in project) |
| modal | 50 | Dialog content |
| popover | 50 | Popovers |
| toast | 50+ | Sonner Toaster (top-center) |
| tooltip | 50+ | Tooltips |

Project uses Radix/shadcn default z-50 for overlay and content; no custom scale in Tailwind. Document for consistency: overlays and floating UI at 50; loading overlay at 9999.

### E. Responsive Breakpoints

Tailwind defaults:

| Breakpoint | Min width | Usage |
|------------|-----------|--------|
| sm | 640px | Mobile landscape, small tablets |
| md | 768px | Tablets |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Ultra-wide |

**Behavior:**
- **Mobile (< 640px)**: Single column, full-width cards, consider collapsed sidebar or overlay nav.
- **Tablet (640–1024px)**: 2-column grids where useful; sidebar can overlay.
- **Desktop (1024px+)**: Multi-column, sidebar visible, comfortable spacing.
- **Large (1280px+)**: Max content width or extra margins as needed.

### F. Sidebar Layout Spec

- **Desktop (lg+)**: Width 160–400px (default 192px), resizable; fixed left; collapse to 52px (icon-only).
- **Tablet (md)**: Same or overlay with backdrop when narrow.
- **Mobile**: Overlay or bottom nav; main content full width.

---

## 5. Component Design Patterns

### A. Buttons

**Variants**: default (primary), destructive, success, warning, info, outline, secondary, ghost, link.

**Sizes**: `default` (h-9 px-4 py-2), `sm` (h-8 px-3 text-xs), `lg` (h-10 px-8), `icon` (h-9 w-9).

**States**: default, hover (e.g. `hover:bg-primary/90`), active, focus-visible (ring-1 ring-ring), disabled (opacity-50, pointer-events-none), loading (use spinner + disabled or loading prop).

**Tailwind (from button.tsx):**
```tsx
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
```
Variant classes: `bg-primary text-primary-foreground shadow hover:bg-primary/90`, etc.

**Accessibility**: Use `<button>` or `asChild` with Slot; icon-only buttons need `aria-label`. Focus ring on focus-visible only.

---

### B. Inputs

**Base (from input.tsx):**
```tsx
"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
```

**States**: default, focus (ring), error (border-destructive + error message), disabled. Prefix/suffix: wrap in relative container and position with `pl-10` or `pr-10`.

**Accessibility**: Associate with `<Label>` or `aria-label`; `aria-invalid` and `aria-describedby` for errors.

---

### C. Cards

**Default**: `rounded-xl border bg-card text-card-foreground shadow`. CardHeader: `p-8`, space-y-1.5. CardTitle: `font-semibold leading-none tracking-tight`. CardDescription: `text-sm text-muted-foreground`. CardContent: `p-8 pt-0`. CardFooter: `flex items-center p-8 pt-0`.

**Optional**: `surface-card` for subtle elevation; `glass-card` or `glasgmorphism` for glass effect (backdrop blur + border). Hover: `surface-card:hover` increases shadow and border.

**Selected**: Use `ring-2 ring-ring` or `border-primary` when applicable.

---

### D. Badges / Pills

**Variants**: default (primary), secondary, destructive, outline. Uses `badgeVariants` with `rounded-lg border px-3 py-1 text-sm font-semibold` and `glasgmorphism`. Add success/warning/info via custom classes if needed (e.g. `bg-success text-success-foreground`).

**Sizes**: Default; for sm use `text-xs px-2 py-0.5`. Dot variant: small circle + label using semantic colors.

---

### E. Dialogs / Modals

**Overlay**: `bg-black/50`, `data-[state=open]:animate-in data-[state=closed]:animate-out`, fade. **Content**: `max-w-[calc(100%-2rem)] sm:max-w-lg`, `rounded-lg`, `p-6`, `gap-4`, `shadow-lg`, `duration-200`, zoom + slide animation. Close: absolute right-4 top-4, `rounded-sm opacity-70 hover:opacity-100`, with `sr-only` "Close".

**Sizes**: sm (max-w-sm), md (max-w-lg default), lg (max-w-2xl), xl (max-w-4xl), full (max-w-[95vw] w-full h-[90vh] for special cases like project views).

**Accessibility**: Focus trap (Radix); Esc to close; focus restore on close.

---

### F. Tabs

**TabsList**: `inline-flex h-11 items-center justify-center rounded-lg bg-muted p-2 text-muted-foreground gap-1`. **TabsTrigger**: `rounded-md px-5 py-2.5 text-sm font-medium`, `data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow`. **TabsContent**: `mt-4 pt-6 pb-6 px-2`.

Active indicator: background + shadow (pill style). No underline in default; can override with custom class for underline style.

---

### G. Tables

**Header**: `[&_tr]:border-b`. **Body**: `[&_tr:last-child]:border-0`. **Row**: `border-b transition-colors hover:bg-muted/50`. **Footer**: `border-t bg-muted/50 font-medium`. Cell padding: use `px-4 py-3` or table cell classes. Sticky header: `sticky top-0 bg-background z-10` on `thead`.

---

### H. Kanban Columns

Column: bordered container, rounded (e.g. `rounded-xl`), background card or muted. Header: font-semibold, padding. Card gap: `gap-2` or `gap-3`. Drag-over: `bg-primary/5 border-primary/50` or similar. Empty state: centered text, muted, optional icon.

---

### I. Toast / Notifications

**Library**: Sonner. **Position**: `top-center` (layout.tsx). **Options**: `richColors` for success/error/etc. Use `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`, `toast()` for default. Duration: default (e.g. 4s); persist for critical errors. Dismiss: built-in close.

---

### J. Dropdowns / Select

**Trigger**: Button or custom trigger; same height as button (h-9). **Menu**: Radix DropdownMenu; background popover, shadow, border, rounded-md. **Item**: `px-2 py-1.5` or default Radix padding; hover `bg-accent`; selected indicator (checkmark or background). **Select**: Radix Select; same token-based styling; chevron for open state.

---

### K. Accordion / Collapsible

**Item**: `border-b`. **Trigger**: `flex flex-1 items-center justify-between py-4 text-sm font-medium`, `hover:underline`, `[&[data-state=open]>svg]:rotate-180`. **Chevron**: `ChevronDown`, `h-4 w-4`, `transition-transform duration-200`. **Content**: `overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down`; inner div `pb-4 pt-0`. Limit nesting depth (e.g. one level of nested accordions).

---

### L. Tooltips / Popovers

**Tooltip**: Radix TooltipProvider; content uses theme background (popover/card), border, shadow, rounded. **Popover**: Same tokens; arrow optional. Max width: e.g. `max-w-xs` or `max-w-sm`. Offset: default Radix; ensure not clipped. Prefer tooltip for short labels; popover for rich content.

---

## 6. Iconography

### A. Library

**Lucide React** (components.json: `"iconLibrary": "lucide"`). Use named imports: `import { ChevronDown, XIcon, Trash2 } from "lucide-react"`.

### B. Icon Size Scale

| Size | Pixels | Usage |
|------|--------|--------|
| xs | 12px | Inline text |
| sm | 14px | Small buttons, badges |
| default | 16px | Standard UI (button `[&_svg]:size-4`) |
| md | 18px | Emphasis |
| lg | 20px | Section headers |
| xl | 24px | Page headers, CTAs |
| 2xl | 32px | Feature icons |
| 3xl | 48px | Hero |

Tailwind: `h-4 w-4` (16px), `h-5 w-5` (20px), etc.

### C. Stroke Width

Lucide default 2px; use as-is. For dense UIs consider `strokeWidth={1.5}`; for emphasis `strokeWidth={2.5}`.

### D. Icon Usage Rules

- Icon alone: Only for universal actions (e.g. close, menu, search) and only with `aria-label`.
- Icon + label: Preferred for primary and destructive actions.
- Position: Leading for nav and primary actions; trailing for external links or "open" indicators.
- Color: Inherit (`currentColor`) by default; use semantic colors for status (e.g. `text-destructive`, `text-success`).

### E. Common Icons

- Menu / Close: `Menu`, `X` or `XIcon`
- Actions: `Plus`, `Trash2`, `Pencil`, `Copy`, `Download`
- Navigation: `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ArrowLeft`
- Status: `Check`, `AlertCircle`, `Info`, `XCircle`
- Files: `File`, `FileText`, `Folder`, `Image`

---

## 7. Motion & Animation

### A. Easing

Tailwind and Radix use default ease. For custom:
- Standard: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- Spring: `cubic-bezier(0.34, 1.56, 0.64, 1)` for light bounce

### B. Duration

- Instant: 0ms (no animation)
- Fast: 100–150ms (hover feedback)
- Normal: 200ms (dialog, accordion — `duration-200`, `0.2s ease-out`)
- Slow: 300–350ms (sidebar width, larger transitions)

Tailwind: `transition-colors`, `duration-200`; keyframes `accordion-down` 0.2s ease-out, `fade-in` 0.3s, `slide-in-right` 0.3s.

### C. Animation Patterns

- **Button press**: `active:scale-95` or shared-design `scale(0.98)`.
- **Card hover**: `transition-shadow duration-normal hover:shadow-lg` or `surface-card:hover`.
- **Dialog**: Overlay `fade-in`; content `zoom-in-95` + `slide-in-from-top-[48%]`, `duration-200`.
- **Sidebar resize**: `transition-[width]` on sidebar container.
- **Toast**: Sonner default slide-in.
- **Accordion**: `animate-accordion-down` / `animate-accordion-up` (height + overflow).

### D. When to Animate

- Do: Hover (shadow, color, slight scale), focus ring, mount/unmount (dialogs, toasts), collapse/expand, loading (pulse, spin).
- Don’t: Layout shifts that cause CLS, long blocking animations (> 300ms for critical path), unnecessary decoration.

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

Add to globals.css if not already present; tailwindcss-animate may respect it for some utilities.

---

## 8. Dark Mode & Theme Strategy

### A. Architecture

- **Detection**: `darkMode: ["class"]` in Tailwind; theme from `localStorage` and applied before paint via inline script in `layout.tsx`.
- **Apply**: `document.documentElement.setAttribute("data-theme", theme)` and for dark `document.documentElement.classList.add("dark")` (or remove for light). Named themes (ocean, forest, warm, red) set `data-theme`; dark mode also adds `.dark` and uses dark overrides from globals.css.
- **Storage**: `localStorage.getItem("app-ui-theme")`; values: light, dark, ocean, forest, warm, red.

### B. Dark Mode Adjustments

- Background: Dark slate (222 47% 11%), not pure black.
- Foreground: Off-white (210 40% 98%).
- Shadows: Reduced or replaced with subtle borders/inset in dark.
- Borders: Lighter in dark (slate 700) for visibility.
- Primary: Switches to blue (217 91% 60%) in dark for contrast.

### C. Testing Checklist

- [ ] All text readable in light and dark (contrast).
- [ ] No hardcoded hex/rgb; use tokens only.
- [ ] Hover/focus states visible in both.
- [ ] Shadows/borders appropriate in both (or border-only in dark).
- [ ] Icons and images adapt (no pure white/black where inappropriate).
- [ ] Loading states visible in both.

### D. Anti-Patterns

- Don’t use opacity alone to “darken” in dark mode (can break hue).
- Don’t hardcode `#fff` or `#000`; use `--background` and `--foreground`.
- Do use HSL and semantic tokens; test with color-blind simulators if needed.

---

## 9. Accessibility Guidelines

### A. WCAG 2.1 AA

- Contrast: 4.5:1 text, 3:1 UI components.
- Touch targets: 44×44px minimum (or equivalent tap area).
- Focus: Visible focus indicator (ring 1–2px) on all interactive elements.
- Keyboard: All functionality available via keyboard; logical tab order.
- Labels: Interactive elements have accessible names (label or aria-label).
- Not color alone: Use icon, text, or pattern in addition to color.

### B. Focus

- **Ring**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (or ring-1 where dense). Use `focus-ring` utility class where defined.
- **Trap**: Dialogs and drawers trap focus (Radix handles this).
- **Order**: Tab order follows visual order; avoid positive `tabIndex` unless necessary.

### C. Semantic HTML

- Use `<button>` for actions, `<a>` for navigation, `<input>` for form fields.
- Headings in order (h1 → h2 → h3); no skipping.
- Use `<label>` with `htmlFor` or `aria-label` on inputs.

### D. ARIA

- Icon-only buttons: `aria-label="Close"`, `aria-label="Delete item"`, etc.
- Inputs: `<label>` or `aria-label`; errors: `aria-invalid` and `aria-describedby`.
- Live regions: `aria-live="polite"` or `role="status"` for toasts/updates.
- Loading: `aria-label="Loading"` and `role="status"` on spinners.

### E. Keyboard

| Element | Keys | Behavior |
|---------|------|----------|
| Button | Enter, Space | Activate |
| Dialog | Esc | Close |
| Dropdown/Select | Arrow keys, Enter | Navigate and select |
| Tabs | Arrow keys | Switch tab |
| Accordion | Enter, Space | Toggle (Radix) |

---

## 10. Design Anti-Patterns

1. **Inconsistent border radius**  
   ❌ Mix of `rounded-sm`, `rounded-lg`, `rounded-xl` without hierarchy.  
   ✅ Use `--radius` (1.5rem) or scale: sm (calc(var(--radius)-4px)), md (calc(var(--radius)-2px)), lg (var(--radius)); cards/dialogs `rounded-lg` or `rounded-xl` consistently.

2. **Random shadow depths**  
   ❌ Different shadows on similar cards with no logic.  
   ✅ Levels: `shadow` for cards, `shadow-lg` for modals, `shadow-sm` for hover lift; use `surface-card` / `surface-elevated` tokens.

3. **Orphan text sizes**  
   ❌ `text-[15px]`, `text-[17px]` scattered.  
   ✅ Use type scale: `text-sm`, `text-base`, `text-lg`, `text-xl`.

4. **Unlabeled icon buttons**  
   ❌ `<button><Trash2 /></button>`.  
   ✅ `<button aria-label="Delete item"><Trash2 /></button>` or icon + visible label.

5. **Hardcoded colors**  
   ❌ `text-gray-700 dark:text-gray-300`, `bg-white`.  
   ✅ `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`.

6. **Unreadable disabled state**  
   ❌ Very low contrast disabled text.  
   ✅ `disabled:opacity-50` with base contrast ≥ 4.5:1 so 50% still ≥ 3:1; or use muted color with sufficient contrast.

7. **Inconsistent spacing**  
   ❌ `p-3`, `p-4`, `p-5` on similar cards.  
   ✅ One default (e.g. `p-4` or `p-6`) per component type; document in spacing rules.

8. **Overuse of bold**  
   ❌ Everything bold.  
   ✅ Normal body; semibold headings; bold only for strong emphasis.

9. **Invisible focus**  
   ❌ `outline-none` without replacement.  
   ✅ Always `focus-visible:ring-1` or `focus-visible:ring-2` with `ring-ring`.

10. **Color-only status**  
    ❌ Green/red text only.  
    ✅ Icon + color (e.g. Check + success, XCircle + destructive).

11. **Excessive animation**  
    ❌ Long or distracting motion everywhere.  
    ✅ 100–200ms where it helps feedback; respect reduced motion.

12. **Ignoring the grid**  
    ❌ Random widths and alignment.  
    ✅ Use grid, max-widths, and spacing scale consistently.

13. **Reinventing components**  
    ❌ Custom checkbox/select from divs.  
    ✅ Use native `<input type="checkbox">` or Radix/shadcn primitives.

14. **No loading states**  
    ❌ Button or list hangs with no feedback.  
    ✅ Spinner, disabled state, or “Saving…” / “Loading…” text.

15. **Desktop-only layout**  
    ❌ Broken on small screens.  
    ✅ Mobile-first; test at sm, md, lg; collapse or overlay nav on small.

---

## Appendix: Quick Reference

### Color Tokens (Tailwind)

| Token | Light | Dark |
|-------|--------|------|
| background | Slate 50 | Slate 900 |
| foreground | Slate 900 | Slate 50 |
| primary | Slate 900 | Blue |
| muted-foreground | Slate 500 | Slate 400 |
| border | Slate 200 | Slate 700 |
| destructive | Red | Red |

Use: `bg-background`, `text-foreground`, `bg-primary text-primary-foreground`, `border-border`, `text-muted-foreground`, `bg-destructive text-destructive-foreground`, etc.

### Type Scale (Tailwind)

| Class | Size | Use |
|-------|------|-----|
| text-xs | 12px | Captions |
| text-sm | 14px | Secondary |
| text-base | 16px | Body |
| text-lg | 18px | Lead |
| text-xl | 20px | H4 |
| text-2xl | 24px | H3 |
| text-3xl | 30px | H2 |
| text-4xl | 36px | H1 |

### Spacing Scale (Tailwind)

| Class | Value |
|-------|--------|
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 6 | 24px |
| 8 | 32px |
| 12 | 48px |

---

*This design system is a living document. Update it as the project evolves.*

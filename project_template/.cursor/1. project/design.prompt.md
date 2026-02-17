# PROMPT 01: GENERATE DESIGN.MD

Copy this prompt into Cursor with Opus 4.6 to generate `.cursor/1. project/design.md`

**Note:** Adapt directory trees and examples to the actual project (e.g. admin-dashboard-starter: `src/lib/db.ts`, no auth folder until added).

---

You are a world-class Design Systems Architect with 15+ years of experience at companies like Apple, Google, Stripe, and Linear. You've built design systems that scale across hundreds of components and millions of users.

## YOUR TASK

Generate a **comprehensive, production-ready `design.md`** file that will serve as the single source of truth for ALL visual, interaction, and brand decisions in this project.

## PROJECT CONTEXT ANALYSIS

**FIRST, analyze the current project:**

1. **Scan the codebase** - Identify:
   - Framework & styling approach (React, Vue, Tailwind, CSS-in-JS, etc.)
   - UI library in use (shadcn/ui, Material-UI, Chakra, custom, none)
   - Color system (CSS variables, Tailwind config, theme files)
   - Component patterns (atomic design, feature-based, flat structure)
   - Existing design tokens or style guides

2. **Understand the domain** - What kind of app is this?
   - B2B SaaS dashboard, consumer mobile app, developer tool, e-commerce, etc.
   - Target users (technical, non-technical, internal teams, external customers)
   - Key interactions (forms, data viz, content reading, collaboration, etc.)

3. **Assess current state** - What exists vs. what's missing?
   - Consistent color usage or ad-hoc colors?
   - Typography hierarchy or random font sizes?
   - Spacing system or magic numbers?
   - Component variants or one-off implementations?

**OUTPUT this analysis in a brief section at the top of design.md as "Current State Assessment"**

---

## REQUIRED SECTIONS

Generate a design.md with the following structure. Be EXHAUSTIVE and SPECIFIC - no vague guidance.

### 1. DESIGN PHILOSOPHY & PRINCIPLES

- **Core Principles** (5-7 principles)
  - Each with: Name, Rationale (1 sentence), Real Example from this project
  - Examples: "Clarity over decoration", "Progressive disclosure", "Consistent density"
  
- **Design Values** (3-4 values that guide decisions)
  - Speed vs. Precision, Simplicity vs. Power, Flexibility vs. Consistency
  - For each value, state where this project falls on the spectrum and WHY

- **Accessibility Commitment**
  - WCAG level target (2.1 AA minimum, AAA aspirational)
  - Touch target minimums (44×44px)
  - Color contrast requirements (4.5:1 text, 3:1 UI elements)
  - Keyboard navigation expectations

**OUTPUT FORMAT:**
```markdown
## Design Philosophy

### Core Principles

1. **[Principle Name]** - [One-sentence rationale]
   - Example: [Concrete example from this project]

### Design Values
- **[Value Spectrum]**: [Where we fall and why]
```

---

### 2. COLOR SYSTEM

**A. Semantic Token Architecture**

Define the COMPLETE semantic token system based on what this project uses:

If using **CSS custom properties** (HSL-based recommended):
```css
--background: [H] [S]% [L]%
--foreground: [H] [S]% [L]%
--card: [H] [S]% [L]%
--card-foreground: [H] [S]% [L]%
--primary: [H] [S]% [L]%
--primary-foreground: [H] [S]% [L]%
--secondary: [H] [S]% [L]%
--secondary-foreground: [H] [S]% [L]%
--muted: [H] [S]% [L]%
--muted-foreground: [H] [S]% [L]%
--accent: [H] [S]% [L]%
--accent-foreground: [H] [S]% [L]%
--destructive: [H] [S]% [L]%
--destructive-foreground: [H] [S]% [L]%
--success: [H] [S]% [L]%
--success-foreground: [H] [S]% [L]%
--warning: [H] [S]% [L]%
--warning-foreground: [H] [S]% [L]%
--info: [H] [S]% [L]%
--info-foreground: [H] [S]% [L]%
--border: [H] [S]% [L]%
--input: [H] [S]% [L]%
--ring: [H] [S]% [L]%
--radius: [value]rem
```

Provide BOTH light and dark mode values. HSL format is preferred for programmatic manipulation.

If using **Tailwind config**, provide the extended color palette.

**B. Theme Variants** (if applicable)

If the project supports themes (ocean, forest, warm, monochrome, etc.):
- Document each theme's personality and use case
- Show which tokens each theme overrides
- Provide theme switching implementation pattern

**C. Data Visualization Palette**

Curated palette for charts, graphs, Kanban columns, status indicators:
- Minimum 8 distinguishable colors
- Ensure accessibility (colorblind-safe, sufficient contrast)
- Define semantic mappings (green = success, red = danger, etc.)

**D. Contrast Requirements**

Matrix showing which color combinations meet WCAG AA/AAA:
```
| Foreground     | Background     | Ratio | WCAG |
|----------------|----------------|-------|------|
| --foreground   | --background   | 14.2  | AAA  |
| --primary      | --background   | 5.1   | AA   |
```

**E. Color Usage Rules**

- When to use primary vs. accent
- Destructive action color requirements
- Disabled state opacity/color approach
- Link color conventions
- Semantic color meanings (don't use red for success!)

---

### 3. TYPOGRAPHY

**A. Font Stack**

Primary font:
```css
font-family: '[Primary Font]', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

Monospace font (for code):
```css
font-family: '[Mono Font]', 'SF Mono', Monaco, 'Cascadia Code', 
             'Roboto Mono', Consolas, 'Courier New', monospace;
```

**Recommendations:**
- Primary: Inter, Geist Sans, System UI, SF Pro, Segoe UI
- Mono: Geist Mono, JetBrains Mono, Fira Code, SF Mono

**B. Type Scale**

Complete scale with exact values:

```markdown
| Size | Font Size | Line Height | Letter Spacing | Weight | Usage |
|------|-----------|-------------|----------------|--------|-------|
| xs   | 12px      | 16px        | 0.01em         | 400    | Captions, labels |
| sm   | 14px      | 20px        | 0              | 400    | Body small, secondary text |
| base | 16px      | 24px        | 0              | 400    | Primary body text |
| lg   | 18px      | 28px        | -0.01em        | 400    | Large body, subtle emphasis |
| xl   | 20px      | 28px        | -0.01em        | 600    | Small headings |
| 2xl  | 24px      | 32px        | -0.02em        | 700    | Section headings |
| 3xl  | 30px      | 36px        | -0.02em        | 700    | Page headings |
| 4xl  | 36px      | 40px        | -0.03em        | 800    | Hero headings |
```

**C. Heading Hierarchy**

```markdown
# H1: [size] - [usage] - [example: "Dashboard Overview"]
## H2: [size] - [usage] - [example: "Recent Projects"]
### H3: [size] - [usage] - [example: "Project Settings"]
#### H4: [size] - [usage] - [example: "Advanced Options"]
```

**D. Text Color Hierarchy**

```markdown
- **Primary**: Main content - var(--foreground) or text-foreground
- **Secondary**: Supporting text - opacity 70% or text-muted-foreground
- **Tertiary**: Metadata, timestamps - opacity 50% or text-muted
- **Placeholder**: Form hints - opacity 40% or text-muted-foreground/40
- **Disabled**: Non-interactive - opacity 30% or text-muted-foreground/30
- **Link**: Interactive text - var(--primary) or text-primary
- **Link Hover**: Interaction state - var(--primary) with 90% opacity
- **Destructive**: Error, danger - var(--destructive) or text-destructive
```

**E. Typography Rules**

- Max line length: 65-75 characters for readability
- Paragraph spacing: 1.5em between paragraphs
- List item spacing: 0.5em between items
- Code inline: monospace font, background highlight, 0.25em padding
- Code block: syntax highlighting color scheme reference

---

### 4. SPACING & LAYOUT

**A. Spacing Scale**

Based on 4px base unit:

```markdown
| Token | Value | Usage |
|-------|-------|-------|
| 0     | 0px   | No space (border collapse) |
| 0.5   | 2px   | Minimal gap (icon + text) |
| 1     | 4px   | Tight spacing (chip padding) |
| 1.5   | 6px   | Compact spacing (button padding-y) |
| 2     | 8px   | Default small (card inner padding) |
| 3     | 12px  | Comfortable (form field padding) |
| 4     | 16px  | Default medium (card padding) |
| 5     | 20px  | Relaxed (section padding) |
| 6     | 24px  | Spacious (page padding mobile) |
| 8     | 32px  | Generous (component gaps) |
| 10    | 40px  | Large (page padding desktop) |
| 12    | 48px  | Extra large (section spacing) |
| 16    | 64px  | Huge (hero section padding) |
| 20    | 80px  | Massive (page section breaks) |
| 24    | 96px  | Max (landing page sections) |
```

**B. Layout Grid**

- Container max width: [value]px (e.g., 1280px, 1440px, or none)
- Gutter size: [value] (e.g., space-4, space-6)
- Column count: 12-column grid (standard) or custom
- Responsive breakpoints (see Section 4E)

**C. Component Spacing Rules**

```markdown
**Cards**
- Padding: space-4 (16px) default, space-6 (24px) on desktop
- Gap between cards: space-4 (16px)
- Card grid gap: space-4 (16px)

**Forms**
- Label → Input gap: space-2 (8px)
- Input → Helper text gap: space-1.5 (6px)
- Field → Field gap: space-4 (16px)
- Section → Section gap: space-8 (32px)

**Sections**
- Section padding: space-12 (48px) mobile, space-16 (64px) desktop
- Section gap: space-16 (64px)
- Heading → Content gap: space-6 (24px)

**Navigation**
- Sidebar width: [value]px (e.g., 240px, 280px, 16rem)
- Sidebar padding: space-4 (16px)
- Nav item padding: space-2 or space-3
- Nav item gap: space-1 (4px) or space-2 (8px)
```

**D. Z-Index Scale**

```css
--z-base: 0;           /* Normal document flow */
--z-dropdown: 1000;    /* Dropdown menus */
--z-sticky: 1020;      /* Sticky headers */
--z-fixed: 1030;       /* Fixed elements */
--z-modal-backdrop: 1040;  /* Modal overlays */
--z-modal: 1050;       /* Modal dialogs */
--z-popover: 1060;     /* Popovers, tooltips */
--z-toast: 1070;       /* Toast notifications */
--z-tooltip: 1080;     /* Tooltips (highest) */
```

**E. Responsive Breakpoints**

```typescript
// Breakpoint definitions
const breakpoints = {
  sm: '640px',   // Mobile landscape, small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Ultra-wide
}
```

**Responsive Behavior:**
- **Mobile (< 640px)**: Single column, full-width cards, collapsed nav
- **Tablet (640-1024px)**: 2-column grid, visible nav toggle
- **Desktop (1024-1536px)**: Multi-column, sidebar visible, optimal spacing
- **Ultrawide (> 1536px)**: Max content width, extra margins

**F. Sidebar Layout Spec**

```markdown
**Desktop (lg+)**
- Width: [240px / 16rem / 280px] - choose based on content density
- Position: Fixed left
- Collapse: Optional hamburger menu

**Tablet (md)**
- Width: [200px / 12rem]
- Overlay mode with backdrop

**Mobile (< md)**
- Full-screen overlay OR bottom nav bar
```

---

### 5. COMPONENT DESIGN PATTERNS

For each component category, define the EXACT visual specification using Tailwind classes or CSS properties.

**Template per component:**

#### [Component Name]

**Variants:**
- Default
- [Other variants]

**States:**
- Default
- Hover
- Active / Pressed
- Focus
- Disabled
- Loading (if applicable)
- Error (if applicable)

**Tailwind Classes:**
```tsx
const variants = {
  default: "...",
  secondary: "...",
}
```

**Anatomy:**
[Description of parts, padding, gaps]

**Accessibility:**
- ARIA attributes required
- Keyboard interactions
- Focus management

---

**Define patterns for:**

#### A. BUTTONS
- Primary, Secondary, Outline, Ghost, Destructive, Link
- Sizes: sm, default, lg, icon-only
- States: default, hover, active, focus, disabled, loading

#### B. INPUTS
- Text, Email, Password, Number, Search, Textarea
- States: default, focus, error, disabled
- Prefix/suffix icon support

#### C. CARDS
- Default card style
- Hover interaction (lift, shadow increase)
- Selected state
- Disabled/inactive state

#### D. BADGES / PILLS
- Status colors: success, warning, error, info, neutral
- Sizes: sm, default, lg
- Dot variant vs. solid fill

#### E. DIALOGS / MODALS / SHEETS
- Overlay opacity and backdrop filter
- Content width (sm, md, lg, xl, full)
- Animation: fade-in + slide-up
- Spacing: content padding, header/footer spacing

#### F. TABS
- Active indicator style (underline, pill, background)
- Spacing between tabs
- Border treatment

#### G. TABLES
- Header style (background, font weight, borders)
- Row hover state
- Row striping (zebra)
- Cell padding
- Sticky header behavior

#### H. KANBAN COLUMNS
- Column header style
- Card gap
- Drag-over state (background, border)
- Empty state design

#### I. TOAST / NOTIFICATIONS
- Position (top-right, bottom-right, etc.)
- Success, error, info, warning colors
- Duration defaults (3s, 5s, persist)
- Dismiss button style

#### J. DROPDOWNS / SELECT
- Trigger button style
- Menu container (background, shadow, border)
- Item hover state
- Selected item indicator

#### K. ACCORDION / COLLAPSIBLE
- Chevron animation (rotate 180deg)
- Border style
- Content padding
- Nested depth limits

#### L. TOOLTIPS / POPOVERS
- Background color (inverted or card)
- Arrow style
- Max width
- Offset from trigger

---

### 6. ICONOGRAPHY

**A. Icon Library**

Current library in use: [Lucide React / Heroicons / Material Icons / Tabler Icons / Custom]

**B. Icon Size Scale**

```markdown
| Size    | Pixels | Usage |
|---------|--------|-------|
| xs      | 12px   | Inline text icons |
| sm      | 14px   | Small buttons, badges |
| default | 16px   | Standard UI icons |
| md      | 18px   | Slightly larger emphasis |
| lg      | 20px   | Section headers |
| xl      | 24px   | Page headers, CTAs |
| 2xl     | 32px   | Feature icons |
| 3xl     | 48px   | Hero sections |
```

**C. Stroke Width**

- Default: 2px (most Lucide icons)
- Thin: 1.5px (for dense UIs)
- Bold: 2.5px (for emphasis)

**D. Icon Usage Rules**

- **Icon alone**: Only for universally recognized actions (×, ☰, ⚙️, 🔍)
- **Icon + label**: Preferred for clarity (especially for destructive actions)
- **Icon position**: Leading (before text) for navigation, trailing (after text) for external links
- **Icon color**: Inherits text color by default, use semantic colors for status

**E. Icon Naming Conventions**

Use consistent naming from the icon library. Document commonly used icons:
- Menu: `Menu`, `X` (close)
- Actions: `Plus`, `Trash2`, `Edit`, `Copy`, `Download`
- Navigation: `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ArrowLeft`
- Status: `Check`, `AlertCircle`, `Info`, `XCircle`
- Files: `File`, `FileText`, `Folder`, `Image`

---

### 7. MOTION & ANIMATION

**A. Easing Curves**

```css
--ease-default: cubic-bezier(0.4, 0.0, 0.2, 1);  /* Standard ease-in-out */
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);         /* Accelerate */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);      /* Decelerate */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce effect */
```

**B. Duration Scale**

```css
--duration-instant: 0ms;     /* Immediate (no animation) */
--duration-fast: 100ms;      /* Quick feedback (hover) */
--duration-normal: 200ms;    /* Standard transitions */
--duration-slow: 300ms;      /* Deliberate transitions */
--duration-slower: 500ms;    /* Emphasis or complex animations */
```

**C. Animation Patterns**

**Button Press:**
```tsx
className="transition-transform duration-fast active:scale-95"
```

**Card Hover:**
```tsx
className="transition-shadow duration-normal hover:shadow-lg"
```

**Dialog Entry:**
```tsx
// Overlay fade-in
className="animate-in fade-in duration-normal"
// Content slide-up + fade
className="animate-in fade-in slide-in-from-bottom-4 duration-normal"
```

**Dialog Exit:**
```tsx
className="animate-out fade-out duration-fast"
```

**Sidebar Collapse:**
```tsx
className="transition-[width] duration-slow ease-out"
```

**Toast Slide:**
```tsx
className="animate-in slide-in-from-right duration-normal ease-out"
```

**Accordion Expand:**
```tsx
className="transition-all duration-normal ease-out data-[state=open]:animate-accordion-down"
```

**D. When to Animate**

✅ DO animate:
- Hover effects (subtle scale, shadow, color change)
- Focus states (ring appearance)
- Mount/unmount (dialogs, toasts, dropdowns)
- Drag interactions (lift, shadow)
- Collapse/expand (height, opacity)
- Page transitions (fade, slide)
- Loading states (pulse, spin)

❌ DON'T animate:
- Text selection
- Scroll position (unless intentional smooth scroll)
- Layout shifts (prevents CLS issues)
- Anything that blocks interaction (no 2s animations!)

**E. Reduced Motion**

Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 8. DARK MODE & THEME STRATEGY

**A. Theme System Architecture**

Document how theming works in this project:

```typescript
// Example: CSS custom properties toggled via data-theme attribute
document.documentElement.setAttribute('data-theme', 'dark')
```

OR

```typescript
// Example: Tailwind dark: prefix
<div className="bg-white dark:bg-gray-900">
```

**B. Dark Mode Color Adjustments**

Rules for converting light → dark:
- Background: Very dark, not pure black (prevents OLED burn-in, reduces eye strain)
- Foreground: Off-white, not pure white (reduces contrast glare)
- Shadows: Replace with subtle borders or inset shadows
- Images: Reduce opacity or apply subtle overlay
- Borders: Lighter in dark mode (opposite of light mode)

**C. Testing Checklist**

When adding a new component, verify:
- [ ] All text is readable in both modes (contrast check)
- [ ] No hardcoded colors (use tokens only)
- [ ] Hover/focus states visible in both modes
- [ ] Shadows/borders work in both modes
- [ ] Images/icons adapt (filter or swap)
- [ ] Loading states visible in both modes

**D. Anti-Patterns**

❌ **DON'T:**
- Use opacity to "darken" colors in dark mode (often creates incorrect hues)
- Hardcode hex colors anywhere (always use semantic tokens)
- Use "black" or "white" literals (use --background and --foreground)
- Skip testing in both modes

✅ **DO:**
- Use HSL color space (easier to adjust lightness)
- Test with color blindness simulators
- Provide high-contrast mode option
- Use semantic color names (not "gray-800")

---

### 9. ACCESSIBILITY GUIDELINES

**A. Minimum Requirements (WCAG 2.1 AA)**

- **Color Contrast**: 4.5:1 for text, 3:1 for UI elements
- **Touch Targets**: 44×44px minimum for interactive elements
- **Focus Indicators**: Visible on all interactive elements, min 2px ring
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Screen Readers**: All interactive elements have accessible labels
- **Color Dependence**: Never rely on color alone (use icons, text, patterns)

**B. Focus Management**

**Focus Ring Style:**
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

**Focus Trap**: Dialogs, drawers, popovers must trap focus inside.

**Focus Order**: Tab order must follow visual order (use `tabIndex` only when necessary).

**C. Semantic HTML**

Use the correct element:
- `<button>` for actions (not `<div onClick>`)
- `<a>` for navigation (not `<button>`)
- `<input>` for form fields (not `<div contentEditable>`)
- Headings in order: h1 → h2 → h3 (no skipping)

**D. ARIA Labels**

Every interactive element needs accessible text:
- Icon-only buttons: `aria-label="Close dialog"`
- Form inputs: `<label>` element or `aria-label`
- Status messages: `aria-live="polite"` or `role="status"`
- Loading spinners: `aria-label="Loading"` + `role="status"`

**E. Keyboard Interactions**

Document expected keyboard behavior:

| Element | Keys | Behavior |
|---------|------|----------|
| Button | Enter, Space | Activate |
| Dialog | Esc | Close |
| Dropdown | Arrow keys | Navigate options, Enter to select |
| Tabs | Arrow keys | Switch tabs |
| Table | Arrow keys | Navigate cells (optional) |
| Form | Tab | Move between fields |

---

### 10. DESIGN ANTI-PATTERNS (AVOID THESE)

List 10-15 specific anti-patterns with ❌ BAD and ✅ GOOD examples.

#### 1. Inconsistent Border Radius
❌ **BAD**: `rounded-sm` on buttons, `rounded-lg` on cards, `rounded-xl` on dialogs
✅ **GOOD**: Use `--radius` token (e.g., 0.5rem) consistently, or scale predictably (sm, default, lg)

#### 2. Mixing Shadow Depths Randomly
❌ **BAD**: `shadow-sm` on some cards, `shadow-2xl` on others with no hierarchy
✅ **GOOD**: Define levels: `shadow-sm` (hover), `shadow` (cards), `shadow-lg` (modals)

#### 3. Orphan Text Styles
❌ **BAD**: `text-[15px]`, `text-[17px]`, `text-[21px]` (random sizes)
✅ **GOOD**: Use type scale: `text-sm`, `text-base`, `text-lg`, `text-xl`

#### 4. Unlabeled Icon Buttons
❌ **BAD**: `<button><Trash2 /></button>` (no accessible label)
✅ **GOOD**: `<button aria-label="Delete item"><Trash2 /></button>`

#### 5. Hardcoded Colors
❌ **BAD**: `text-gray-700 dark:text-gray-300` (hardcoded)
✅ **GOOD**: `text-foreground` (uses theme tokens)

#### 6. Unreadable Disabled States
❌ **BAD**: Disabled text too low contrast (gray-400 on white)
✅ **GOOD**: Min 3:1 contrast even for disabled (use opacity or gray-600+)

#### 7. Inconsistent Spacing
❌ **BAD**: `p-3`, `p-4`, `p-5` all used for similar cards
✅ **GOOD**: Pick one default (`p-4` for cards) and stick to it

#### 8. Overuse of Bold
❌ **BAD**: Every heading, button, and label in bold (creates visual noise)
✅ **GOOD**: Use weight strategically: normal for body, semibold for headings, bold for emphasis

#### 9. Invisible Focus States
❌ **BAD**: `outline-none` everywhere (keyboard users can't navigate)
✅ **GOOD**: Always include `focus-visible:ring-2`

#### 10. Color-Only Status Indicators
❌ **BAD**: Green text = success, red text = error (colorblind users can't distinguish)
✅ **GOOD**: Icon + color: ✓ Success, ✕ Error

#### 11. Excessive Animation
❌ **BAD**: 500ms transitions on every hover, everything bounces
✅ **GOOD**: Fast, subtle animations (100-200ms), only where it adds value

#### 12. Breaking the Grid
❌ **BAD**: Components with random widths, ignoring the layout system
✅ **GOOD**: Align to grid, use consistent container widths

#### 13. Reinventing UI Components
❌ **BAD**: Building custom checkbox from scratch instead of using `<input type="checkbox">`
✅ **GOOD**: Use native elements or battle-tested UI libraries (shadcn/ui)

#### 14. No Loading States
❌ **BAD**: Button just hangs after click, no feedback
✅ **GOOD**: Show loading spinner or "Saving..." text

#### 15. Ignoring Mobile
❌ **BAD**: Desktop-only design, mobile users see broken layout
✅ **GOOD**: Mobile-first approach, test at all breakpoints

---

## FORMATTING REQUIREMENTS

1. **Use Markdown** with clear headers (##, ###, ####)
2. **Use Tables** for scales, comparisons, matrices
3. **Use Code Blocks** with language tags (css, tsx, bash)
4. **Use Blockquotes** for warnings: `> ⚠️ Warning: ...`
5. **Be Specific** - no "choose a nice color" or "use good spacing"
6. **Provide Copy-Paste Ready Values** - exact HSL values, Tailwind classes, etc.
7. **Cross-Reference** - link to other sections where relevant
8. **Length**: 500-800 lines (comprehensive but scannable)

---

## FINAL OUTPUT STRUCTURE

```markdown
# Design System — [Project Name]

**Version**: 1.0  
**Last Updated**: [Date]  
**Author**: Design Systems Architect (AI)

---

## Current State Assessment

[Brief analysis of existing design system maturity]

---

## 1. Design Philosophy & Principles

[Content]

---

## 2. Color System

[Content]

---

## 3. Typography

[Content]

---

## 4. Spacing & Layout

[Content]

---

## 5. Component Design Patterns

[Content]

---

## 6. Iconography

[Content]

---

## 7. Motion & Animation

[Content]

---

## 8. Dark Mode & Theme Strategy

[Content]

---

## 9. Accessibility Guidelines

[Content]

---

## 10. Design Anti-Patterns

[Content]

---

## Appendix: Quick Reference

### Color Tokens
[Quick lookup table]

### Type Scale
[Quick lookup table]

### Spacing Scale
[Quick lookup table]

---

*This design system is a living document. Update it as the project evolves.*
```

---

## FINAL INSTRUCTION

Generate the complete `design.md` file in .cursor/1. project NOW. Be exhaustive, specific, and opinionated. Reference the actual codebase where possible. Make it the definitive design guide for this project.
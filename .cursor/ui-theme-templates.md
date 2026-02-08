# UI theme templates – colors, accents, background

Use these templates to change the app’s colors, accents, and background in one place. The app uses **HSL** values (Hue, Saturation%, Lightness%) in CSS variables; Tailwind wraps them as `hsl(var(--name))`.

**Unified schema:** Every theme uses the same set of CSS variables. The app applies one set per theme via `[data-theme="…"]` in `globals.css` and the TypeScript type `UIThemeVariables` in `src/data/ui-theme-templates.ts`. Each theme defines all tokens below (including `success`, `warning`, `info` and their foregrounds) so button and text colors stay consistent across themes.

---

## Where to edit

| File | What to change |
|------|----------------|
| **`src/app/globals.css`** | Main theme: replace the `:root` and `.dark` blocks with a template below. |
| **`src/app/layout.tsx`** | Critical inline CSS (same variables) and fallbacks: `html` style, `body` style, `#root-loading` background/color. Sync with your chosen theme. |
| **`src/components/root-loading-overlay.tsx`** | Inline fallback `style={{ background: "…", color: "…" }}` – set to your background and foreground hex (or remove and rely on CSS). |

**Tip:** Keep `globals.css` as the single source of truth; then copy the same HSL values (or equivalent hex) into `layout.tsx` and the loading overlay so the first paint and loading screen match.

---

## Variable reference (what each token does)

| Variable | Usage | Tailwind classes |
|----------|--------|-------------------|
| `--background` | Page and main surface background | `bg-background` |
| `--foreground` | Main text on background | `text-foreground` |
| `--card` | Cards, panels, elevated surfaces | `bg-card`, `text-card-foreground` |
| `--card-foreground` | Text on cards | |
| `--popover` | Popovers, dropdowns | `bg-popover` |
| `--popover-foreground` | Text in popovers | |
| `--primary` | Primary buttons, links, focus | `bg-primary`, `text-primary-foreground` |
| `--primary-foreground` | Text on primary | |
| `--secondary` | Secondary buttons, subtle surfaces | `bg-secondary`, `text-secondary-foreground` |
| `--secondary-foreground` | Text on secondary | |
| `--muted` | Muted backgrounds (e.g. disabled, subtle) | `bg-muted`, `text-muted-foreground` |
| `--muted-foreground` | Muted text, placeholders | |
| `--accent` | Hover states, selected items, accents | `bg-accent`, `text-accent-foreground` |
| `--accent-foreground` | Text on accent | |
| `--destructive` | Delete/danger actions | `bg-destructive`, `text-destructive-foreground` |
| `--destructive-foreground` | Text on destructive | |
| `--success` | Success buttons, positive states | `bg-success`, `text-success-foreground` |
| `--success-foreground` | Text on success | |
| `--warning` | Warning buttons, caution | `bg-warning`, `text-warning-foreground` |
| `--warning-foreground` | Text on warning | |
| `--info` | Info buttons, neutral emphasis | `bg-info`, `text-info-foreground` |
| `--info-foreground` | Text on info | |
| `--border` | Borders | `border-border` |
| `--input` | Input borders/backgrounds | `border-input` |
| `--ring` | Focus rings | `ring-ring` |
| `--radius` | Border radius (e.g. `0.5rem`) | `rounded-lg` etc. |

Format: **`H S% L%`** (no `hsl()` – Tailwind adds it). Example: `0 0% 100%` = white, `240 10% 3.9%` = dark slate.

### Button variants (unified across themes)

| Variant | Use | Tailwind / component |
|--------|-----|----------------------|
| default | Primary action | `variant="default"` → primary |
| destructive | Danger, delete | `variant="destructive"` |
| success | Confirm, done, positive | `variant="success"` |
| warning | Caution, review | `variant="warning"` |
| info | Neutral emphasis, info | `variant="info"` |
| outline | Secondary actions | `variant="outline"` |
| secondary | Subtle buttons | `variant="secondary"` |
| ghost | Icon / low emphasis | `variant="ghost"` |
| link | Text link style | `variant="link"` |

Text colors: `text-destructive`, `text-success`, `text-warning`, `text-info`, `text-primary`, `text-muted-foreground`, etc.

---

## Template 1: Light default (current)

**`src/app/globals.css`** – `:root` and `.dark`:

```css
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
```

**Fallbacks (layout / loading):** background `#fafafa`, text `#171717`.

---

## Template 2: Dark default

```css
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 5%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 5%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
  }
```

**Fallbacks:** background `#0a0a0f`, text `#fafafa`.

---

## Template 3: Ocean (blue accent, light bg)

```css
  :root {
    --background: 210 20% 98%;
    --foreground: 220 20% 12%;
    --card: 0 0% 100%;
    --card-foreground: 220 20% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 20% 12%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 30% 92%;
    --secondary-foreground: 220 20% 20%;
    --muted: 210 25% 93%;
    --muted-foreground: 220 15% 45%;
    --accent: 217 70% 92%;
    --accent-foreground: 217 91% 40%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 25% 88%;
    --input: 214 25% 88%;
    --ring: 217 91% 60%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 14%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 14%;
    --popover-foreground: 210 40% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217 33% 22%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 22%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 50% 25%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 217 33% 22%;
    --input: 217 33% 22%;
    --ring: 217 91% 60%;
  }
```

**Fallbacks (light):** background `#f0f4f9`, text `#1a2332`.

---

## Template 4: Forest (green accent, light bg)

```css
  :root {
    --background: 140 25% 98%;
    --foreground: 140 20% 12%;
    --card: 0 0% 100%;
    --card-foreground: 140 20% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 140 20% 12%;
    --primary: 142 71% 45%;
    --primary-foreground: 0 0% 100%;
    --secondary: 140 25% 92%;
    --secondary-foreground: 140 20% 20%;
    --muted: 140 20% 93%;
    --muted-foreground: 140 15% 45%;
    --accent: 142 55% 90%;
    --accent-foreground: 142 71% 35%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 140 20% 88%;
    --input: 140 20% 88%;
    --ring: 142 71% 45%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 140 30% 8%;
    --foreground: 140 25% 95%;
    --card: 140 30% 11%;
    --card-foreground: 140 25% 95%;
    --popover: 140 30% 11%;
    --popover-foreground: 140 25% 95%;
    --primary: 142 71% 45%;
    --primary-foreground: 0 0% 100%;
    --secondary: 142 25% 18%;
    --secondary-foreground: 140 25% 95%;
    --muted: 142 25% 18%;
    --muted-foreground: 140 15% 60%;
    --accent: 142 40% 22%;
    --accent-foreground: 140 25% 95%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 142 25% 18%;
    --input: 142 25% 18%;
    --ring: 142 71% 45%;
  }
```

**Fallbacks (light):** background `#f2f8f4`, text `#1a2620`.

---

## Template 5: Warm (amber accent, cream bg)

```css
  :root {
    --background: 40 33% 98%;
    --foreground: 25 25% 12%;
    --card: 0 0% 100%;
    --card-foreground: 25 25% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 25 25% 12%;
    --primary: 25 95% 53%;
    --primary-foreground: 0 0% 100%;
    --secondary: 38 30% 92%;
    --secondary-foreground: 25 25% 20%;
    --muted: 38 25% 93%;
    --muted-foreground: 25 15% 45%;
    --accent: 38 70% 90%;
    --accent-foreground: 25 95% 40%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 35 25% 88%;
    --input: 35 25% 88%;
    --ring: 25 95% 53%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 25 25% 8%;
    --foreground: 40 20% 95%;
    --card: 25 25% 11%;
    --card-foreground: 40 20% 95%;
    --popover: 25 25% 11%;
    --popover-foreground: 40 20% 95%;
    --primary: 25 95% 53%;
    --primary-foreground: 0 0% 100%;
    --secondary: 25 30% 18%;
    --secondary-foreground: 40 20% 95%;
    --muted: 25 30% 18%;
    --muted-foreground: 35 15% 60%;
    --accent: 25 50% 22%;
    --accent-foreground: 40 20% 95%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 25 30% 18%;
    --input: 25 30% 18%;
    --ring: 25 95% 53%;
  }
```

**Fallbacks (light):** background `#faf8f5`, text `#1f1b17`.

---

## Template 6: Red background (strong)

```css
  :root {
    --background: 0 100% 50%;
    --foreground: 0 0% 100%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 0 0% 100%;
    --primary-foreground: 0 100% 40%;
    --secondary: 0 80% 60%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 70% 55%;
    --muted-foreground: 0 0% 95%;
    --accent: 0 90% 55%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 60% 65%;
    --input: 0 60% 65%;
    --ring: 0 0% 100%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 50% 15%;
    --foreground: 0 0% 98%;
    --card: 0 40% 18%;
    --card-foreground: 0 0% 98%;
    --popover: 0 40% 18%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 60% 25%;
    --secondary: 0 30% 25%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 30% 25%;
    --muted-foreground: 0 10% 70%;
    --accent: 0 40% 28%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 30% 25%;
    --input: 0 30% 25%;
    --ring: 0 0% 83%;
  }
```

**Fallbacks:** background `red` or `#ef4444`, text `#fff`.

---

## Sync with layout and loading overlay

After pasting a template into **`src/app/globals.css`**:

1. **`src/app/layout.tsx`**
   - Update the `<style>` block so `:root` variables match the same theme (or remove the duplicate block and rely on `globals.css` loading first).
   - Set `html` and `body` inline styles to your chosen background and text color (hex or CSS value).
   - Set `#root-loading` `background` and `color` to the same values.

2. **`src/components/root-loading-overlay.tsx`**
   - Set the div `style={{ background: "…", color: "…" }}` to the same background and text color so the loading screen matches.

Example for Template 1 (light):  
`background: "#fafafa"`, `color: "#171717"`.

Example for Template 6 (red):  
`background: "red"`, `color: "#fff"`.

---

## HSL quick reference

- **H** (hue): 0 = red, 120 = green, 240 = blue, 30 = orange, 280 = purple.
- **S** (saturation): 0% = gray, 100% = full color.
- **L** (lightness): 0% = black, 50% = mid, 100% = white.

Convert hex → HSL with any online tool, then use `H S% L%` (e.g. `217 91% 60%`) in the variables.

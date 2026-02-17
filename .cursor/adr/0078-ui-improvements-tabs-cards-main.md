# ADR 0078: UI improvements — tabs, main area, cards, buttons

## Status

Accepted

## Context

Follow-up to ADR 0077. Further polish was requested to improve perceived quality and consistency of the UI without changing behavior.

## Decision

- **Tabs (ui/tabs.tsx)**: TabsContent gets `data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200` so tab switches have a short fade-in (tailwindcss-animate).
- **App shell**: Main content area uses `bg-background/98` and a subtle left edge shadow `shadow-[inset_1px_0_0_0_hsl(var(--border)/0.3)]` for separation from the sidebar.
- **Buttons (ui/button.tsx)**: Primary variant and base get `hover:shadow-md` for clearer hover feedback.
- **ProjectControlTab**: Entry cards and ScrollArea/Accordion use `surface-card`, `rounded-xl`, `border-border/50`. Error state uses `border-destructive/40` and `shadow-sm`.
- **ProjectRunTab**: Section cards (Queue, Asking, Fast dev, Debugging, Terminal Output, Other in progress) use `surface-card` and `border-border/50` instead of `bg-card/50` or `bg-card/60` + `backdrop-blur-sm` for consistent elevation and hover.

## Consequences

- Tab content feels smoother on switch; main area has clearer visual separation; cards have consistent elevation and hover; primary buttons read better on hover.
- No API or data changes; CSS and Tailwind class updates only.

## References

- `src/components/ui/tabs.tsx` — TabsContent animation
- `src/components/app-shell.tsx` — main area
- `src/components/ui/button.tsx` — hover shadow
- `src/components/molecules/TabAndContentSections/ProjectControlTab.tsx` — surface-card, error styling
- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — surface-card on sections
- `src/app/globals.css` — `.surface-card` definition

# ADR: Global padding increase – tabs, cards, and main content

## Status
Accepted

## Context
User feedback requested “much more padding everywhere” – tabs, cards, and general layout – to improve breathing room and readability across the app.

## Decision
Increase padding consistently across UI primitives and layout:

1. **Base UI – Tabs (`src/components/ui/tabs.tsx`)**
   - **TabsList**: `p-1` → `p-2`, add `gap-1`, `h-9` → `h-11`.
   - **TabsTrigger**: `px-3 py-1` → `px-5 py-2.5`.
   - **TabsContent**: add `mt-4 pt-6 pb-6 px-2` (and keep `mt-2` → `mt-4`).

2. **Base UI – Card (`src/components/ui/card.tsx`)**
   - **CardHeader**, **CardContent**, **CardFooter**: `p-6` → `p-8` (and `pt-0` where applicable).

3. **App shell**
   - **Main content**: `p-4 md:p-6` → `p-6 md:p-8 lg:p-10`.

4. **Organism Tailwind classes (`tailwind-organisms.json`)**
   - **HomePageContent**: all tab content classes (4–11) get `pt-6 pb-6 px-4` in addition to existing spacing.
   - **ProjectDetailsPageContent**: TabsList (6) gets `gap-2 p-2`; tab content (13–15) gets `pt-6 pb-6 px-4`; CardContent (16–18) gets `pt-8 pb-8 px-6`.
   - **TestingPageContent**: TabsList (3) gets `gap-3 p-2`; tab content (12–15) gets `pt-6 pb-6 px-4`.
   - **TicketBoard**: column (0) gets `p-3`; header (1) `px-4 py-3`; scroll area (4) `p-4`; cards container (5) `space-y-3`.
   - **ProjectsListPageContent**: list container (3) `p-2` → `p-4`.

5. **Molecules – ThreeTabLayout**
   - Tab content classes: `mt-6` → `mt-6 pt-6 pb-6 px-4`.

6. **Shared classes (`shared-classes.json`)**
   - **Card**: root `p-8` → `p-10`; header `pb-4` → `pb-5`; footer `pt-5` → `pt-6`.
   - **Accordion**: itemButton `px-6 py-4` → `px-8 py-5`; itemContent `px-6 pb-5 pt-1` → `px-8 pb-6 pt-2`.
   - **Tabs** (shared): tabButtonBase `py-4 px-1` → `py-5 px-3`.
   - **ListItemCard**: card `p-6` → `p-8`; header `mb-3` → `mb-4`.

## Consequences
- Tabs, cards, and main content have more consistent, generous padding.
- Layout remains responsive; breakpoint-based main padding (`md:p-8`, `lg:p-10`) scales up on larger screens.
- All changes are additive (extra padding) or simple value bumps; no structural changes.

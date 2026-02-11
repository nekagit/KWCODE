# ADR 20260211: Sidebar "LS" – Loading Screen page with go-back

## Status
Accepted

## Context
Users wanted a way to view the branded loading screen (moon and stars) on demand and leave it via a back control, without relying on the initial app boot sequence.

## Decision

### Sidebar
- Add a new bottom navigation item **"LS"** (Loading Screen) in the sidebar, in the same section as Log · Run · Configuration.
- Use the Moon icon from lucide-react; link target `/loading-screen`.
- Section label updated to include "LS": "Log · Run · Configuration · LS".

### Loading Screen page
- New route: **`/loading-screen`**.
- Page reuses the same visuals as the root loading overlay: dark background, rain effect, cursor glow, star field, moon graphic, and kwcode branding.
- A **go-back** control is placed at the **top left**: circular button with arrow-left icon, linking to `/` (Dashboard). High z-index so it stays clickable above effects.

### Implementation
- `SidebarNavigation.tsx`: extend `bottomNavItems` with `{ href: "/loading-screen", label: "LS", icon: Moon }`.
- New `LoadingScreenPageContent.tsx`: client component that composes `RainEffect`, `CursorLightGlow`, `StarField`, `MoonGraphic`, `KwcodeBranding` and the back `Link`.
- New `src/app/loading-screen/page.tsx` that renders `LoadingScreenPageContent`.

## Consequences
- Users can open "LS" from the sidebar to see the moon-and-stars loading screen anytime and return to the app via the top-left back arrow.
- No change to the initial root loading overlay behavior.

# ADR 130: Loading overlay – mouse interaction, flying stars, moon

## Status

Accepted.

## Context

The root loading overlay (kwcode branded, raindrops) should feel more engaging: the user’s cursor should appear to interact with the raindrops, and the scene should include flying stars and a moon for a cohesive night-sky atmosphere.

## Decision

- **Mouse interaction with raindrops**  
  Track mouse position on the overlay and render a cursor-following radial gradient (soft blue/white glow). Raindrops are not moved; they are visually “lit” when the glow passes over them, giving the impression of interaction without changing the existing CSS rain animation.

- **Flying stars**  
  Add a fixed number of small star elements with deterministic positions and delays (scatter from index to avoid hydration mismatch). Each star animates across the viewport using CSS custom properties `--star-dx` and `--star-dy` (vw/vh) and a single `kwcode-star-fly` keyframe (fade in, travel, fade out). Stars use a subtle box-shadow for a soft “flash” look.

- **Moon**  
  Add a “Moon” component: a circle positioned in the upper-right (e.g. `top: 12%`, `right: 14%`) with a warm off-white fill and a small darker circle for a simple crater. Use layered box-shadows for a soft glow so it reads as the moon in the same night scene as the rain and stars.

## Implementation

- `RootLoadingOverlay`: `onMouseMove` / `onMouseLeave` to maintain `{ x, y }` in state (or off-screen when leave). Pass `(x, y)` to `CursorGlow`.
- `CursorGlow`: single div with `radial-gradient` centered at `(x, y)` px, pointer-events-none.
- `FlyingStars`: array of stars with scatter-derived `left/top`, `duration`, `delay`, `--star-dx`, `--star-dy`; animation `kwcode-star-fly`.
- `Moon`: absolutely positioned div with rounded-full disc and crater sub-element, glow via box-shadow.
- New keyframes in `globals.css`: `kwcode-star-fly` using `var(--star-dx)`, `var(--star-dy)` for translate.

## Consequences

- Loading screen is more interactive and visually rich; first paint remains deterministic (scatter-based) for hydration.
- Slight extra work on mousemove (state update) only while the overlay is visible; no ongoing cost after fade-out.

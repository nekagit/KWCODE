# ADR 134: Glasmorphism Design, Default Dark Theme, and Typography Updates

## Status
Proposed

## Context
The existing UI design uses a standard Tailwind CSS theme with light/dark modes and several color presets. The user has requested a significant design overhaul to implement a "glasgmorphism" style, with large capital fonts and rounded elements, and to set the dark theme as the default.

## Decision
1.  **Glasmorphism Implementation:**
    *   **Blur and Translucency:** Introduce `backdrop-filter: blur(8px);` and `background-color` with `rgba` opacity values (e.g., `/ 0.7` for `--background`, `/ 0.5` for `--card`, `--popover`, `--secondary`, `--muted`, `--accent`) to create the frosted glass effect.
    *   **Rounded Elements:** Increase the `--radius` CSS variable from `0.5rem` to `1.5rem` to make all elements using this variable more rounded.
    *   **Shadows:** Add more prominent `box-shadow` to elements to enhance the glasmorphism depth effect.
    *   **Utility Class:** Create a new utility class `.glasgmorphism` in `globals.css` that bundles the `backdrop-filter`, `background-color`, `border`, `box-shadow`, and `border-radius` for easy application to components.

2.  **Default Dark Theme:**
    *   Modify the inline `<script>` in `src/app/layout.tsx` that reads `localStorage` for the `app-ui-theme`. If no theme is found or if the stored theme is invalid, default to `"dark"`. This ensures the application always starts in dark mode by default unless a user explicitly selects another theme.

3.  **Big Capital Fonts:**
    *   Apply `text-transform: uppercase;` to the `body` element in `globals.css` to ensure all text is capitalized by default.
    *   Adjust font sizes for key UI elements (e.g., `h1` and `p` in `AppShell`) to be larger, contributing to the "big capital fonts" aesthetic.

4.  **Component Updates:**
    *   Apply the `.glasgmorphism` class to relevant UI components such as `PopoverContent` and `aside` in `src/components/app-shell.tsx`.
    *   Update `src/components/ui/badge.tsx` to use the `glasgmorphism` class, `rounded-lg`, and `text-sm` for consistency.

5.  **Theme Template Consistency:**
    *   Update the `UI_THEME_TEMPLATES` in `src/data/ui-theme-templates.ts` to reflect the new `radius` for all themes, the translucent background values for the dark theme, and updated descriptions that mention the glasmorphism effects and rounded elements.

## Consequences
*   The application will have a distinct glasmorphism aesthetic with rounded elements and large capitalized text.
*   The default theme will be dark, enhancing the visual impact of the glasmorphism effects.
*   Existing UI components will adopt the new styling, potentially requiring minor adjustments for optimal appearance.
*   The overall user experience will be visually refreshed and aligned with the requested design.
*   A new `.glasgmorphism` utility class will be available for consistent application of the effect across components.
*   The styling changes might affect readability if not properly tested, especially for very long texts, but the focus on "big capital fonts" suggests a more minimalistic and impactful textual presentation.


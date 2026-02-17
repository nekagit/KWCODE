# ADR 0051: View Running Project modal — iframe height and fallback message

## Context

Users reported that the "View Running Project" button opens the modal but the website/app running on localhost is not visible inside it. Two causes were identified:

1. **Layout**: The iframe used `flex-1` in a flex column without a height-definite parent, so in some browsers the iframe received no effective height and rendered with zero or minimal visible area.
2. **Mixed content**: When the app is served over HTTPS (e.g. Cursor’s host or a deployed app), embedding `http://localhost` in an iframe can be blocked by the browser, leaving the iframe blank with no explanation.

## Decision

- **Explicit iframe height**: Wrap the iframe in a `flex-1 min-h-0` container and give the iframe `h-full` plus an inline `height: 100%` so it gets a definite height from the flex layout and fills the modal content area.
- **Overflow**: Add `overflow-hidden` on the dialog content and the iframe wrapper so the iframe does not spill and the flex chain correctly computes height.
- **Shrink-0**: Apply `shrink-0` to the header, "Open in new tab" link, and the new hint so they do not shrink and the remaining space goes to the iframe wrapper.
- **Fallback message**: Add a short hint: "If the app does not load below (e.g. when this page is on HTTPS), use 'Open in new tab' above." so users know why the iframe may be blank and what to do.

## Files changed

- `src/components/organisms/ProjectDetailsPageContent.tsx`: View Running Project modal — wrapper div for iframe with `flex-1 min-h-0`, iframe with `h-full` and `style={{ height: "100%" }}`, overflow and shrink-0 tweaks, and fallback message.

## References

- ADR 0024: View Running Project and run port in project details
- ADR 0032: Run port visible without repo path

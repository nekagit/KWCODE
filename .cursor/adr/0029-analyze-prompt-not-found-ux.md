# ADR 0029: Analyze “prompt not found” error UX

## Status

Accepted

## Context

- When a user clicks **Analyze** on the Project page (or runs the analyze queue), the app calls `POST /api/analyze-project-doc` with a `promptPath` (e.g. `.cursor/1. project/project.prompt.md`).
- If that prompt file does not exist in the project repo (e.g. the project was never **Initialized**), the API returns 400 with a generic error and hint. Users reported seeing: “PROMPT NOT FOUND AT .CURSOR/1. PROJECT/PROJECT.PROMPT.MD RUN INITIALIZE ON THIS PROJECT TO COPY .CURSOR PROMPTS FROM THE TEMPLATE, OR ADD THE PROMPT FILE MANUALLY.”
- The fix is to run **Initialize** on the project so `.cursor` (and thus the prompt files) is copied from `.cursor_template`. The error message did not make the next step obvious, and the toast did not surface the hint clearly.

## Decision

- **API:** When the prompt file is missing, return a structured response with `code: "PROMPT_NOT_FOUND"` in addition to `error` and `hint`, so the client can show a dedicated UX.
- **Client:** In `api-projects.ts`, when the analyze API returns 400 and `code === "PROMPT_NOT_FOUND"`, attach that `code` to the thrown `Error` so callers can detect it.
- **Project tab:** When the single-doc **Analyze** button fails with `PROMPT_NOT_FOUND`, show a short toast title (“Prompt file missing”) and a clear description: “Click Initialize (above) to copy .cursor prompts from the template, then try Analyze again.” (longer duration).
- **Analyze all:** When the bulk **Analyze all** flow fails and the error is prompt-not-found (by `code` or message content), show the same descriptive toast so users know to run Initialize first.

## Consequences

- Users who hit “prompt not found” get a clear, actionable message and know to use the **Initialize** button on the project page before re-running Analyze.
- No change to the Initialize flow itself; it continues to copy the full `.cursor_template` into the project’s `.cursor` folder.
- ADR documents the UX improvement for AI and future maintainers.

## References

- `src/app/api/analyze-project-doc/route.ts` — 400 response includes `code: "PROMPT_NOT_FOUND"`
- `src/lib/api-projects.ts` — `analyzeProjectDoc` and `getAnalyzePromptOnly` attach `err.code` when applicable
- `src/components/molecules/TabAndContentSections/ProjectProjectTab.tsx` — Analyze button catch shows prompt-not-found toast
- `src/components/organisms/ProjectDetailsPageContent.tsx` — Analyze all catch shows prompt-not-found toast

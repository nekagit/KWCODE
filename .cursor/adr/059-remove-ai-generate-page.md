# ADR 059: Remove AI Generate page (tab)

## Status

Accepted.

## Context

The dashboard had a dedicated “AI Generate” tab that provided a full-page AI ticket generator (description, file uploads, options, generate with OpenAI). The same capability is available on the **Tickets** tab via the “AI generate from project” section, which uses the same state and API. The separate AI Generate tab added navigation and UI duplication.

## Decision

- **Remove the AI Generate tab**
  - Remove `"ai-generate"` from `VALID_TABS` on the main dashboard page.
  - Remove the entire `TabsContent value="ai-generate"` block (AI Ticket Generator card with description, options, file slots, generate button, and generated tickets list).
- **Remove AI Generate from navigation**
  - Remove the “AI Generate” nav item (link `/?tab=ai-generate`, Sparkles icon) from the main sidebar in `app-shell.tsx`. Remove the unused `Sparkles` import from the shell.
- **Dashboard quick actions**
  - Remove the “AI Generate tickets” button from the dashboard quick actions card (the one that navigated to the ai-generate tab).
- **Keep Tickets-tab AI generate**
  - The “AI generate from project” section on the Tickets tab remains. It continues to use the same state (`aiGeneratedTickets`, `aiOptions`, `generateAiTickets`, etc.) and “Generated tickets” block; no behavioral change for ticket generation from a project.

## Consequences

- The AI Generate tab and nav entry are gone; `/?tab=ai-generate` falls back to dashboard.
- Users generate AI tickets only from the Tickets tab (“AI generate from project”) or from project-based flows; the standalone description + file-upload flow is no longer available unless re-added elsewhere.
- Sidebar is shorter; dashboard quick actions no longer include a link to the removed tab.

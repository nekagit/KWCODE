# ADR 0051: Worker tab — Fast development section

## Status

Accepted.

## Context

Users wanted a quick way to type a command or task in the Worker tab and immediately run the terminal agent with that instruction, without pasting logs (Debugging) or using the full Implement All flow. A single input + button that sends the agent right away supports fast iteration.

## Decision

- **New section: Fast development**  
  Added between Command Center and Debugging in the Worker tab (`ProjectRunTab.tsx`). It has:
  - A single-line text input (placeholder: e.g. "Add a dark mode toggle to the header").
  - A **Run agent** button that sends the current text to the terminal agent via `runTempTicket(projectPath, fullPrompt, label)`.
  - Enter key submits (same as clicking the button).
  - On success, the input is cleared and a toast points the user to the terminal below.

- **Prompt**  
  User text is wrapped with a short prefix: `"Do the following in this project. Be concise and execute.\n\n" + userInput`. No project file is read; the prompt is inline for speed.

- **Run label**  
  Label is `"Fast dev: " + (first 40 chars of user input, or full text if shorter)` so the run appears in the Terminal Output section with a readable title.

- **Terminal slots**  
  `isImplementAllRun` in `run-helpers.ts` was extended to include runs whose label starts with `"Fast dev:"`, so these runs are shown in the Worker terminal slots (same as Debug and Implement All runs). They already get `slot: 1` from `runTempTicket`.

## Consequences

- Users can type a short command/task and run the agent immediately; output appears in the first terminal column.
- Reuses existing `runTempTicket` and `script/worker/run_terminal_agent.sh`; no new Tauri command or script.
- Fast development section uses a distinct style (violet accent) from Debugging (amber) and Command Center.

## References

- `src/components/molecules/TabAndContentSections/ProjectRunTab.tsx` — `WorkerFastDevelopmentSection`, `FAST_DEV_PROMPT_PREFIX`
- `src/lib/run-helpers.ts` — `isImplementAllRun` now includes `r.label.startsWith("Fast dev:")`

# ADR 002: Round 7+ Composer focus and toggle delays

## Status

Accepted.

## Context

After several rounds of `run_prompts_all_projects.sh`, Composer panels stopped reopening: Cmd+I closed the panel but the second Cmd+I did not reopen it, or the wrong Cursor window received the keystrokes. This was observed from round 7 onward when multiple Cursor windows were open and the frontmost window was not always the one just opened for the current project.

## Decision

1. **Explicit window focus**  
   Before sending Cmd+I (Composer toggle) and paste/Enter, the script now brings the correct Cursor window to front. A new helper `focus_cursor_window_for_project(project_path)` uses AppleScript and System Events to find the Cursor window whose title contains the project folder name (basename) and set its index to 1 so it is frontmost. This is called at the start of `run_agent_prompt_in_front` so keystrokes always target the intended project window.

2. **Round-aware toggle delay**  
   From round 7 onward, the Composer toggle delay is set to 5.0 seconds (instead of the per-project 2.0–3.5 s used in earlier rounds). This gives the UI time to respond when many windows are open and avoids the panel failing to reopen.

3. **Passing project path and round**  
   `run_agent_prompt_in_front` now takes project index, project path, and round number. The project path is used for window focus; the round number is used to select the longer toggle delay when `round >= 7`.

## Consequences

- Composer should reliably reopen in the correct project window even after many rounds.
- Round 7+ runs are slightly slower per project due to the 5.0 s toggle delay; this is an acceptable trade-off for stability.
- Automation remains macOS-only (AppleScript / System Events). Project folder names in window titles are assumed to match the basename of the project path; unusual characters in names may require future escaping in AppleScript.

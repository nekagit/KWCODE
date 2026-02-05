# ADR 003: Find Composer input instead of double Cmd+I toggle

## Status

Accepted.

## Context

The script previously opened Composer by sending Cmd+I twice (close-then-open) so the panel was guaranteed open. This caused issues: first window sometimes didn't paste, third window sometimes didn't reopen. The user requested to stop toggling and instead check if the Composer sidebar panel is already visible (e.g. input with placeholder "Plan, @ for context, / for commands" or "Add a follow-up"), focus that input, and paste into it.

## Decision

1. **Find-and-focus Composer input**  
   A new function `focus_composer_input()` uses AppleScript and System Events (accessibility) to:
   - Activate Cursor and search the front window's UI hierarchy for a text field/area whose description or value contains "Plan", "follow-up", "follow up", or "Add a follow".
   - If found: perform action "AXPress" on that element to focus it, then return success.
   - If not found: send Cmd+I once to open Composer, wait 3 seconds, then search again and focus the input if found.
   - Return success if the input was focused, failure otherwise.

2. **No double Cmd+I**  
   `run_agent_prompt_in_front()` no longer sends Cmd+I twice. It brings the correct Cursor window to front, then calls `focus_composer_input()`. If that fails, it falls back to sending Cmd+I once, waiting 3s, then pasting (relying on Cursor to focus the input).

3. **Paste and Enter unchanged**  
   After the input is focused (or after fallback Cmd+I), the script pastes (Cmd+V) and submits (Enter) as before.

## Consequences

- Composer is not closed and reopened; we only open it with Cmd+I when the panel is not already visible.
- Reliability depends on Cursor exposing the Composer input in the accessibility tree with recognizable description/value (e.g. "Plan, @..." or "Add a follow-up"). If Cursor changes labels or structure, the script may need to match different strings.
- First and third project issues (no paste, panel not reopening) should be avoided because we no longer toggle the panel closed.

# Night Shift — Debugging phase

Focus on **debugging**: reproduce, isolate, and fix the issue. Add minimal logging if needed; verify the fix.

## Steps

1. **Reproduce** — Reproduce the problem from the issue description, logs, or user steps. Confirm you can see the failure or incorrect behaviour.
2. **Isolate** — Narrow down the cause to a component, function, or config. Use logs or tests to isolate; prefer root-cause fixes over workarounds.
3. **Minimal fix** — Apply the smallest change that fixes the issue. Add logging only where it helps diagnosis and can be removed or guarded later.
4. **Verify** — Run tests and/or build (e.g. `npm run verify`). Ensure the fix does not introduce regressions. Do not leave the codebase in a broken state.

## Rules

- Prefer root-cause fixes over workarounds.
- After any fix, run the project's test/build command and fix any new failures.
- Consult `.cursor/8. worker/night-shift.prompt.md` for the main night shift workflow; this file adds the debugging focus.

*Edit `.cursor/8. worker/debugging.prompt.md` to adapt the debugging-phase prompt.*

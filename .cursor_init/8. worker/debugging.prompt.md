# Night Shift — Debugging phase

Focus on **debugging**: reproduce, isolate, and fix the issue. Add minimal logging if needed; verify the fix.

- Reproduce the problem (from issue description, logs, or user steps).
- Isolate the cause (narrow down to a component, function, or config).
- Apply a minimal fix and verify (run tests, manual check, or regression test).
- Prefer root-cause fixes over workarounds; add logging only where it helps diagnosis and can be removed or guarded later.
- Consult `.cursor/8. worker/night-shift.prompt.md` for the main night shift workflow; this file adds the debugging focus.

*Edit `.cursor/8. worker/debugging.prompt.md` to adapt the debugging-phase prompt.*

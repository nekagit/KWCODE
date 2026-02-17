# ADR 0116: Document Night shift and config path in .cursor/README.md

## Status

Accepted.

## Context

Night shift mode (run without a ticket) is configured via `.cursor/8. worker/night-shift.md` and is referenced in the Quality checks section. The main Cursor usage doc (`.cursor/README.md`) did not explain what Night shift is or where to edit its behaviour, so contributors or agents might not find the config file or understand how to customize it.

## Decision

- In **Use agents**, add a bullet: **Night shift** — when running without a ticket, the app loads `.cursor/8. worker/night-shift.md`; edit that file to change what night-shift agents do (e.g. pick TODOs, improve tests, small docs fixes).
- In **Structure**, extend the 8. worker row to mention `night-shift.md` (no-ticket runs).
- In **Paths the app expects**, add `.cursor/8. worker/night-shift.md` so it is not removed during cleanup or template changes.

## Consequences

- One place in the Cursor docs that explains Night shift and the path to edit it.
- Aligns README with night-shift instructions and ADR 0083 (worker night shift) without duplicating full instructions.

## References

- `.cursor/README.md` — Use agents, Structure table, Paths the app expects
- `.cursor/adr/0083-worker-night-shift.md` — night shift behaviour
- `.cursor/8. worker/night-shift.md` — night shift prompt

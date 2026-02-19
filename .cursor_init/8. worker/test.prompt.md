# Night Shift — Test phase

Focus on **testing**: add or extend tests (unit/integration) for the chosen feature. Ensure coverage and clear assertions.

## Steps

1. **Identify the feature under test** — Know which behaviour or module you are testing. Check the ticket or night-shift context for scope.
2. **Choose framework and convention** — Use the project's test framework and conventions (see `.cursor/1. project/testing.md` if present). Match existing test file layout and naming.
3. **Write or extend tests** — Add tests for new or under-tested behaviour. Extend existing test files or create new ones as appropriate. Prefer clear, readable assertions; avoid testing implementation details.
4. **Run the suite** — Run the project test command (e.g. `npm run verify` or the project's test script). All tests must pass. Fix any failures before considering this phase done.

## Rules

- Ensure coverage for the chosen feature; avoid leaving obvious gaps.
- Do not skip the run step — verification is required.
- Consult `.cursor/8. worker/night-shift.prompt.md` for the main night shift workflow; this file adds the test focus.

*Edit `.cursor/8. worker/test.prompt.md` to adapt the test-phase prompt.*

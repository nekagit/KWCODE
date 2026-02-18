# ADR 0263: Dashboard Run history card — Download and Copy stats as JSON

## Status

Accepted.

## Context

The Run tab History toolbar and the command palette (⌘K) already offer "Download run history stats as JSON" and "Copy run history stats as JSON". The Dashboard Run history card (`RunHistoryStatsCard`) shows aggregate stats and has only a "Copy summary" (plain text) button. Users on the Dashboard had no one-click way to get the same structured stats export without opening the Run tab or command palette.

## Decision

- In **RunHistoryStatsCard.tsx**, add two buttons alongside the existing "Copy summary" button:
  - **"Download stats as JSON"** — calls `downloadRunHistoryStatsAsJson(entries)` from `@/lib/download-run-history-stats-json`.
  - **"Copy stats as JSON"** — calls `copyRunHistoryStatsAsJsonToClipboard(entries)` from the same lib.
- Use the card’s **entries** prop (same run history as the rest of the app) so the exported stats match the in-memory run history.
- Both new buttons are disabled when `entries.length === 0`. Use the same styling as "Copy summary" (outline, sm, FileJson icon). Layout: flex row with gap so all three buttons sit in one row and wrap on small screens.

## Consequences

- Users can export run history stats as JSON from the Dashboard overview without leaving the page or opening the command palette.
- Same payload and behaviour as Run tab and command palette (single lib, consistent UX).
- Single touch to RunHistoryStatsCard; no new lib (reuses download-run-history-stats-json).

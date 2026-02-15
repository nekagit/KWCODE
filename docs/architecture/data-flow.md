# Data flow

Request flow: UI → API / Tauri invoke → DB or file I/O → response.

- **KWCode:** Client uses `invoke()` (Tauri) or `fetch('/api/...')` (browser). Data in SQLite and JSON/md under `data/` and `.cursor/`.

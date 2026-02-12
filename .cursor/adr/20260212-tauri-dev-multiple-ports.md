## ADR: Run Tauri dev on separate Next.js port

### Status
Accepted

### Context
We want to run the standard web app dev server and the Tauri desktop dev server simultaneously without fighting for the same Next.js port. Previously:
- `npm run dev` started `next dev` on port 4000.
- Tauri dev (`npm run tauri` → `tauri dev`) also expected the frontend on port 4000 via `src-tauri/tauri.conf.json` and the `script/wait-dev-server.mjs` helper, so both environments shared the same port.

This made it harder to:
- Keep a clean browser-only dev session while also running the desktop app.
- Restart or tweak one environment without impacting the other.

### Decision
Run the Tauri dev frontend on **port 4001** while keeping the normal web dev server on **port 4000**.

Concretely:
- Keep `npm run dev` as-is on port 4000 for the browser.
- Add a dedicated Next.js dev script for Tauri on port 4001.
- Configure Tauri `devUrl` to `http://127.0.0.1:4001/`.
- Update `script/wait-dev-server.mjs` so the Tauri helper starts the 4001 dev server instead of the default web one, using a dedicated npm script.

### Consequences
- We can run `npm run dev` and `npm run tauri` at the same time without port conflicts.
- Tauri dev uses its own dedicated Next.js instance, which can be restarted independently.
- Any future scripts/tools that depend on the Tauri dev URL should reference the Tauri config (`tauri.conf.json`) rather than assuming port 4000.

### Implementation notes
- New script in `package.json`:
  - `"dev:tauri:next": "next dev -p 4001 -H 127.0.0.1 --webpack"`.
- `src-tauri/tauri.conf.json`:
  - `build.devUrl` set to `http://127.0.0.1:4001/`.
- `script/wait-dev-server.mjs`:
  - Still prefers `TAURI_DEV_PORT` / `TAURI_DEV_URL` from Tauri, but spawns `npm run dev:tauri:next` when it needs to start a dev server (overridable via `TAURI_DEV_NPM_SCRIPT`).
 - `public/tauri-load.html`:
   - Redirects to `http://127.0.0.1:4001/` so the loading screen and Tauri devUrl stay in sync.


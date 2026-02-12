## ADR: Run Tauri dev on separate Next.js port

### Status
Superseded (we reverted to port 4000)

### Context
We want to run the standard web app dev server and the Tauri desktop dev server simultaneously without fighting for the same Next.js port. Previously:
- `npm run dev` started `next dev` on port 4000.
- Tauri dev (`npm run tauri` → `tauri dev`) also expected the frontend on port 4000 via `src-tauri/tauri.conf.json` and the `script/wait-dev-server.mjs` helper, so both environments shared the same port.

This made it harder to:
- Keep a clean browser-only dev session while also running the desktop app.
- Restart or tweak one environment without impacting the other.

### Decision
This ADR originally proposed running the Tauri dev frontend on **port 4001** while keeping the normal web dev server on **port 4000**.
After experimentation we decided to revert and keep both browser and Tauri dev on **port 4000** for simplicity, so this decision is no longer active.

### Consequences
- Tauri dev and browser dev now both assume port **4000** for the Next.js dev server.
- We rely on the original, simpler flow: `script/wait-dev-server.mjs` starts `npm run dev` on port 4000 when needed, and `tauri.conf.json` and `public/tauri-load.html` both point at `http://127.0.0.1:4000/`.

### Notes
- This ADR is kept for historical context only; do not follow it for current configuration.


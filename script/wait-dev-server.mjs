#!/usr/bin/env node
/**
 * Starts the Next.js dev server and exits only when it is ready.
 * Used as Tauri's beforeDevCommand so the window opens after the app is available.
 */
import { spawn } from "child_process";

const port = process.env.TAURI_DEV_PORT || "4000";
const url = `http://127.0.0.1:${port}`;
const maxWaitMs = 90_000;
const pollMs = 500;

function check() {
  return fetch(url, { method: "GET", signal: AbortSignal.timeout(3000) })
    .then((r) => r.status === 200)
    .catch(() => false);
}

async function waitReady() {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  return false;
}

const dev = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
  detached: true,
  env: { ...process.env, FORCE_COLOR: "1" },
});
dev.unref();

const ready = await waitReady();
if (!ready) {
  console.error("Timed out waiting for dev server at", url);
  process.exit(1);
}
process.exit(0);

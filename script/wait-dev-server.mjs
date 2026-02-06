#!/usr/bin/env node
/**
 * Starts the Next.js dev server and exits only when it is ready.
 * Used as Tauri's beforeDevCommand so the window opens after the app is available.
 * Waits until the root returns 200 and at least one _next/static chunk is served (avoids 404s for main-app.js etc).
 */
import { spawn } from "child_process";

const port = process.env.TAURI_DEV_PORT || "4000";
const baseUrl = `http://127.0.0.1:${port}`;
// Wait for the app root (same as devUrl in tauri.conf.json)
const devUrl = process.env.TAURI_DEV_URL || `${baseUrl}/`;
const maxWaitMs = 90_000;
const pollMs = 500;
// Extra delay after first 200 so Next.js has time to compile (avoids white screen)
const readyDelayMs = 3000;
// Max time to wait for a chunk URL to return 200 (Next compiles on first request)
const chunkReadyMaxMs = 60_000;
const chunkPollMs = 800;

function check(urlToCheck) {
  return fetch(urlToCheck, { method: "GET", signal: AbortSignal.timeout(3000) })
    .then((r) => r.status === 200)
    .catch(() => false);
}

async function waitReady() {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    if (await check(devUrl)) return true;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  return false;
}

/** Get first script src that looks like a Next.js chunk (_next/static). */
function findChunkUrl(html) {
  const m1 = html.match(/<script[^>]+src=["']([^"']*_next\/static[^"']+)["']/);
  if (m1) return m1[1];
  const m2 = html.match(/src=["']([^"']*_next\/static[^"']+)["'][^>]*>/);
  return m2 ? m2[1] : null;
}

/** Resolve relative chunk URL against dev origin. */
function resolveChunkUrl(src) {
  if (src.startsWith("http")) return src;
  const base = new URL(devUrl);
  return new URL(src, base).href;
}

/** Wait until a known chunk URL returns 200 so we know Next has compiled. */
async function waitForChunk() {
  const deadline = Date.now() + chunkReadyMaxMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(devUrl, { method: "GET", signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, chunkPollMs));
        continue;
      }
      const html = await res.text();
      const src = findChunkUrl(html);
      if (!src) {
        await new Promise((r) => setTimeout(r, chunkPollMs));
        continue;
      }
      const chunkUrl = resolveChunkUrl(src);
      const chunkRes = await fetch(chunkUrl, { method: "GET", signal: AbortSignal.timeout(5000) });
      if (chunkRes.ok) {
        return true;
      }
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, chunkPollMs));
  }
  return false;
}

// If something is already serving on the port (e.g. previous npm run dev), reuse it
const alreadyUp = await check(devUrl);
if (!alreadyUp) {
  const dev = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
    detached: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  dev.unref();
}

const ready = await waitReady();
if (!ready) {
  console.error("Timed out waiting for dev server at", devUrl);
  process.exit(1);
}
console.log("Dev server ready, waiting", readyDelayMs, "ms for Next.js to compile…");
await new Promise((r) => setTimeout(r, readyDelayMs));

console.log("Checking that app chunks are served…");
const chunkReady = await waitForChunk();
if (!chunkReady) {
  console.warn("Warning: could not confirm chunk availability; Tauri may open with 404s. Try running 'npm run dev' first, then 'tauri dev'.");
}
process.exit(0);

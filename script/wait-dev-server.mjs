#!/usr/bin/env node
/**
 * Starts the Next.js dev server and exits only when it is ready.
 * Used as Tauri's beforeDevCommand so the window opens after the app is available.
 * Waits until the root returns 200 and at least one _next/static chunk is served (avoids 404s for main-app.js etc).
 */
import { spawn } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

const port = process.env.TAURI_DEV_PORT || "4000";
const baseUrl = `http://127.0.0.1:${port}`;
// Wait for the app root (same as devUrl in tauri.conf.json)
const devUrl = process.env.TAURI_DEV_URL || `${baseUrl}/`;
const maxWaitMs = 90_000;
const pollMs = 500;
// Extra delay after first 200 so Next.js has time to compile (avoids white screen)
const readyDelayMs = 2000;
// Max time to wait for a chunk URL to return 200 (Next compiles on first request)
const chunkReadyMaxMs = 90_000;
const chunkPollMs = 1000;
// First request can trigger compilation; use longer timeout so we don't abort too early
const fetchTimeoutMs = 30_000;

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

/** Get first script src that looks like a Next.js chunk (_next/static or _next/webpack). */
function findChunkUrl(html) {
  const nextScriptMatch = html.match(/<script[^>]+src=[\"\']([^\"\']*\/_next\/[^\"\']+)[\"\']/);
  if (nextScriptMatch) {
    console.log("Found potential Next.js chunk URL:", nextScriptMatch[1]);
    return nextScriptMatch[1];
  }
  return null;
}

/** Get all script srcs that look like Next.js chunks; prefer one that looks like app/layout. */
function findAllChunkUrls(html) {
  const re = /<script[^>]+src=[\"\']([^\"\']*\/_next\/[^\"\']+)[\"\']/g;
  const urls = [];
  let m;
  while ((m = re.exec(html)) !== null) urls.push(m[1]);
  return urls;
}

/** Find a chunk URL that likely refers to app/layout (reduces "Loading chunk app/layout failed" in Tauri). */
function findAppLayoutChunkUrl(html) {
  const urls = findAllChunkUrls(html);
  const layoutLike = urls.find((u) => /app[\\/]layout|layout\.js/i.test(u));
  return layoutLike || null;
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
      console.log("Fetching devUrl: ", devUrl);
      const res = await fetch(devUrl, { method: "GET", signal: AbortSignal.timeout(fetchTimeoutMs) });
      console.log("DevUrl response status: ", res.status);
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, chunkPollMs));
        continue;
      }
      const html = await res.text();
      const src = findChunkUrl(html);
      if (!src) {
        console.log("No chunk URL found in HTML. Retrying...");
        await new Promise((r) => setTimeout(r, chunkPollMs));
        continue;
      }
      const chunkUrl = resolveChunkUrl(src);
      console.log("Checking chunk URL: ", chunkUrl);
      const chunkRes = await fetch(chunkUrl, { method: "GET", signal: AbortSignal.timeout(fetchTimeoutMs) });
      console.log("Chunk URL response status: ", chunkRes.status);
      if (chunkRes.ok) {
        console.log("Chunk URL is ready!");
        return true;
      }
    } catch (error) {
      console.log("Error while waiting for chunk: ", error.message);
    }
    await new Promise((r) => setTimeout(r, chunkPollMs));
  }
  return false;
}

/** Warm app/layout chunk so it is compiled before Tauri opens (avoids "Loading chunk app/layout failed" timeout). */
async function warmAppLayoutChunk() {
  try {
    const res = await fetch(devUrl, { method: "GET", signal: AbortSignal.timeout(fetchTimeoutMs) });
    if (!res.ok) return;
    const html = await res.text();
    const layoutSrc = findAppLayoutChunkUrl(html);
    if (!layoutSrc) return;
    const layoutUrl = resolveChunkUrl(layoutSrc);
    console.log("Warming app/layout chunk: ", layoutUrl);
    await fetch(layoutUrl, { method: "GET", signal: AbortSignal.timeout(fetchTimeoutMs) });
    console.log("App/layout chunk warmed.");
  } catch (e) {
    console.log("Warm app/layout skipped: ", e.message);
  }
}

// If something is already serving on the port (e.g. previous npm run dev), reuse it
const alreadyUp = await check(devUrl);
if (!alreadyUp) {
  // Remove stale Next.js dev lock so the spawned dev server can start (avoids white screen)
  const lockPath = join(process.cwd(), ".next", "dev", "lock");
  if (existsSync(lockPath)) {
    try {
      unlinkSync(lockPath);
      console.log("Removed stale .next/dev/lock");
    } catch (e) {
      // ignore
    }
  }
  const dev = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
    detached: true,
    env: { ...process.env, FORCE_COLOR: "1", TAURI_DEV: "1", NEXT_PUBLIC_IS_TAURI: "true" },
  });
  dev.unref();
  // Give Next.js a moment to start and acquire the lock before we poll
  await new Promise((r) => setTimeout(r, 3000));
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
  console.error("Chunks not ready in time. Tauri would open with 404s. Run 'npm run dev', wait for compile, then run 'tauri dev' again.");
  process.exit(1);
}
console.log("Chunks OK, warming app/layout chunk so Tauri does not hit timeout…");
await warmAppLayoutChunk();
console.log("Tauri can open.");
process.exit(0);

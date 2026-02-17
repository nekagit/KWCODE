#!/usr/bin/env node
/**
 * Build Next.js for Tauri static export.
 * Temporarily moves app/api/data/route.ts aside so Next exports out/api/data/ as a directory
 * (for nested routes like cursor-doc, file, etc.) instead of creating out/api/data as a file.
 */
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataRoute = path.join(repoRoot, "src", "app", "api", "data", "route.ts");
const dataRouteBak = path.join(repoRoot, "src", "app", "api", "data", "route.ts.tauri-bak");

function moveAside() {
  if (fs.existsSync(dataRoute)) {
    fs.renameSync(dataRoute, dataRouteBak);
    console.log("[build-for-tauri] Moved api/data/route.ts aside");
  }
}

function restore() {
  if (fs.existsSync(dataRouteBak)) {
    fs.renameSync(dataRouteBak, dataRoute);
    console.log("[build-for-tauri] Restored api/data/route.ts");
  }
}

moveAside();
const child = spawn("npm", ["run", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: repoRoot,
  env: { ...process.env, TAURI_BUILD: "1", NEXT_PUBLIC_IS_TAURI: "true" },
});
child.on("exit", (code) => {
  restore();
  process.exit(code ?? 0);
});

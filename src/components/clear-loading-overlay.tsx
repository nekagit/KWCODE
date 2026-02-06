"use client";

import { useEffect } from "react";

/**
 * Once the client app has mounted, hide the root loading overlay
 * so the user sees the real UI. Also hide after a timeout so we never
 * get stuck on the loading screen (e.g. slow hydration in Tauri webview).
 */
export function ClearLoadingOverlay() {
  useEffect(() => {
    const el = document.getElementById("root-loading");
    if (el) el.setAttribute("data-loaded", "true");
    const t = setTimeout(() => {
      const e = document.getElementById("root-loading");
      if (e) e.setAttribute("data-loaded", "true");
    }, 5000);
    return () => clearTimeout(t);
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";

/**
 * Once the client app has mounted, hide the root loading overlay
 * so the user sees the real UI instead of a white screen.
 */
export function ClearLoadingOverlay() {
  useEffect(() => {
    const el = document.getElementById("root-loading");
    if (el) el.setAttribute("data-loaded", "true");
  }, []);
  return null;
}

/**
 * Shared helpers for run/terminal functionality.
 * Previously duplicated across ProjectTicketsTab.tsx and ProjectRunTab.tsx.
 */

import type { RunInfo } from "@/types/run";

/** Check whether a run is an Implement All, Ticket, Analyze doc, Debug, Fast dev, or Night shift run (shown in terminal slots). */
export const isImplementAllRun = (r: { label: string }) =>
    r.label === "Implement All" ||
    r.label.startsWith("Implement All (") ||
    r.label.startsWith("Ticket #") ||
    r.label.startsWith("Analyze:") ||
    r.label.startsWith("Debug:") ||
    r.label.startsWith("Fast dev:") ||
    r.label.startsWith("Night shift");

/** Parse ticket number from run label e.g. "Ticket #3: My title" → 3. Returns null if not a ticket run. */
export function parseTicketNumberFromRunLabel(label: string | undefined): number | null {
    if (!label?.startsWith("Ticket #")) return null;
    const m = label.match(/Ticket #(\d+)/);
    return m ? parseInt(m[1], 10) : null;
}

/** Format seconds as m:ss or Xs. Treats NaN and negative values as 0. */
export function formatElapsed(seconds: number): string {
    const s = Number.isFinite(seconds) && seconds >= 0 ? seconds : 0;
    if (s < 60) return `${Math.floor(s)}s`;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Format duration in milliseconds as human-readable (e.g. "2:34" or "45s").
 * Returns empty string for undefined or negative. Sub-60s uses Math.round; 60s+
 * uses m:ss (same logic as formatElapsed) for consistency with run duration display.
 */
export function formatDurationMs(ms: number | undefined): string {
    if (ms === undefined || ms < 0) return "";
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    const sec = Math.floor(ms / 1000) % 60;
    const min = Math.floor(ms / 60_000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Next free terminal slot (1–3) or null if all occupied.
 * Only considers running Implement All–style runs (Ticket, Implement All, Fast dev, etc.) when determining occupied slots.
 */
export function getNextFreeSlotOrNull(runningRuns: RunInfo[]): 1 | 2 | 3 | null {
    const occupied = new Set<1 | 2 | 3>();
    for (const r of runningRuns) {
        if (r.status !== "running") continue;
        if (!isImplementAllRun(r)) continue;
        if (r.slot === 1 || r.slot === 2 || r.slot === 3) occupied.add(r.slot);
    }
    for (const slot of [1, 2, 3] as const) {
        if (!occupied.has(slot)) return slot;
    }
    return null;
}

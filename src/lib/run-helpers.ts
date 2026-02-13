/**
 * Shared helpers for run/terminal functionality.
 * Previously duplicated across ProjectTicketsTab.tsx and ProjectRunTab.tsx.
 */

/** Check whether a run is an "Implement All" run (legacy 3-slot or ticket-driven). */
export const isImplementAllRun = (r: { label: string }) =>
    r.label === "Implement All" ||
    r.label.startsWith("Implement All (") ||
    r.label.startsWith("Ticket #");

/** Format seconds as m:ss or Xs. */
export function formatElapsed(seconds: number): string {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

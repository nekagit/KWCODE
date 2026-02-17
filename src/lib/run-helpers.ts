/**
 * Shared helpers for run/terminal functionality.
 * Previously duplicated across ProjectTicketsTab.tsx and ProjectRunTab.tsx.
 */

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

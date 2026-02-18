/**
 * Copy dashboard metrics as pretty-printed JSON to the clipboard.
 * Uses getDashboardMetrics() and adds exportedAt for traceability.
 */
import { getDashboardMetrics } from "@/lib/api-dashboard-metrics";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import type { DashboardMetrics } from "@/types/dashboard";
import { toast } from "sonner";

export interface DashboardMetricsJsonPayload extends DashboardMetrics {
  exportedAt: string;
}

/**
 * Build a JSON-serializable payload for dashboard metrics (with exportedAt).
 */
export function buildDashboardMetricsJsonPayload(
  metrics: DashboardMetrics
): DashboardMetricsJsonPayload {
  return {
    ...metrics,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Fetch dashboard metrics, serialize as JSON, and copy to clipboard.
 */
export async function copyDashboardMetricsToClipboard(): Promise<boolean> {
  try {
    const metrics = await getDashboardMetrics();
    const payload = buildDashboardMetricsJsonPayload(metrics);
    const content = JSON.stringify(payload, null, 2);
    await copyTextToClipboard(content);
    toast.success("Dashboard metrics copied as JSON");
    return true;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to copy dashboard metrics";
    toast.error(message);
    return false;
  }
}

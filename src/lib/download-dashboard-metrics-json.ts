/**
 * Download dashboard metrics as a JSON file.
 * Uses getDashboardMetrics() and adds exportedAt for traceability.
 * Filename: dashboard-metrics-{timestamp}.json
 */
import { getDashboardMetrics } from "@/lib/api-dashboard-metrics";
import { buildDashboardMetricsJsonPayload } from "@/lib/copy-dashboard-metrics";
import { filenameTimestamp, triggerFileDownload } from "@/lib/download-helpers";
import { toast } from "sonner";

/**
 * Fetch dashboard metrics and trigger a JSON file download.
 */
export async function downloadDashboardMetricsAsJson(): Promise<void> {
  try {
    const metrics = await getDashboardMetrics();
    const payload = buildDashboardMetricsJsonPayload(metrics);
    const content = JSON.stringify(payload, null, 2);
    const filename = `dashboard-metrics-${filenameTimestamp()}.json`;
    triggerFileDownload(content, filename, "application/json;charset=utf-8");
    toast.success("Dashboard metrics exported as JSON");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to download dashboard metrics";
    toast.error(message);
  }
}

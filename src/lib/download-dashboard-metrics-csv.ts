/**
 * Export dashboard metrics as CSV (single row).
 * Used by command palette "Download dashboard metrics as CSV" and "Copy dashboard metrics as CSV".
 */

import { getDashboardMetrics } from "@/lib/api-dashboard-metrics";
import { escapeCsvField } from "@/lib/csv-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { filenameTimestamp, downloadBlob } from "@/lib/download-helpers";
import type { DashboardMetrics } from "@/types/dashboard";
import { toast } from "sonner";

const CSV_HEADER =
  "exportedAt,tickets_count,prompts_count,designs_count,active_projects_count,all_projects_count";

/**
 * Build a single-row CSV for dashboard metrics.
 */
export function buildDashboardMetricsCsv(metrics: DashboardMetrics): string {
  const exportedAt = new Date().toISOString();
  const row = [
    escapeCsvField(exportedAt),
    String(metrics.tickets_count),
    String(metrics.prompts_count),
    String(metrics.designs_count),
    String(metrics.active_projects_count),
    String(metrics.all_projects_count),
  ].join(",");
  return [CSV_HEADER, row].join("\n");
}

/**
 * Fetch dashboard metrics and download as a CSV file.
 * Filename: dashboard-metrics-{timestamp}.csv
 */
export async function downloadDashboardMetricsAsCsv(): Promise<void> {
  try {
    const metrics = await getDashboardMetrics();
    const csv = buildDashboardMetricsCsv(metrics);
    const filename = `dashboard-metrics-${filenameTimestamp()}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, filename);
    toast.success("Dashboard metrics exported as CSV");
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to download dashboard metrics";
    toast.error(message);
  }
}

/**
 * Fetch dashboard metrics and copy as CSV to the clipboard.
 */
export async function copyDashboardMetricsAsCsvToClipboard(): Promise<void> {
  try {
    const metrics = await getDashboardMetrics();
    const csv = buildDashboardMetricsCsv(metrics);
    await copyTextToClipboard(csv);
    toast.success("Dashboard metrics copied as CSV");
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to copy dashboard metrics";
    toast.error(message);
  }
}

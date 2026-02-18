/**
 * Export dashboard metrics as Markdown.
 * Used by Dashboard Export toolbar and command palette "Download/Copy dashboard metrics as Markdown".
 */

import { getDashboardMetrics } from "@/lib/api-dashboard-metrics";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { filenameTimestamp, triggerFileDownload } from "@/lib/download-helpers";
import type { DashboardMetrics } from "@/types/dashboard";
import { toast } from "sonner";

/**
 * Build Markdown for dashboard metrics: title, exportedAt, then a list of metric names and values.
 */
export function dashboardMetricsToMarkdown(metrics: DashboardMetrics): string {
  const exportedAt = new Date().toISOString();
  const lines: string[] = [
    "# Dashboard metrics",
    "",
    `Exported: ${exportedAt}`,
    "",
    "| Metric | Value |",
    "| --- | --- |",
    `| Tickets count | ${metrics.tickets_count} |`,
    `| Prompts count | ${metrics.prompts_count} |`,
    `| Designs count | ${metrics.designs_count} |`,
    `| Active projects count | ${metrics.active_projects_count} |`,
    `| All projects count | ${metrics.all_projects_count} |`,
  ];
  return lines.join("\n");
}

/**
 * Fetch dashboard metrics and download as a Markdown file.
 * Filename: dashboard-metrics-{timestamp}.md
 */
export async function downloadDashboardMetricsAsMarkdown(): Promise<void> {
  try {
    const metrics = await getDashboardMetrics();
    const markdown = dashboardMetricsToMarkdown(metrics);
    const filename = `dashboard-metrics-${filenameTimestamp()}.md`;
    triggerFileDownload(markdown, filename, "text/markdown;charset=utf-8");
    toast.success("Dashboard metrics exported as Markdown");
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to download dashboard metrics";
    toast.error(message);
  }
}

/**
 * Fetch dashboard metrics and copy as Markdown to the clipboard.
 */
export async function copyDashboardMetricsAsMarkdownToClipboard(): Promise<boolean> {
  try {
    const metrics = await getDashboardMetrics();
    const markdown = dashboardMetricsToMarkdown(metrics);
    const ok = await copyTextToClipboard(markdown);
    if (ok) {
      toast.success("Dashboard metrics copied as Markdown");
    } else {
      toast.error("Failed to copy to clipboard");
    }
    return ok;
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to copy dashboard metrics";
    toast.error(message);
    return false;
  }
}

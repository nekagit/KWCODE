/**
 * Dashboard metrics API: Tauri invoke when in Tauri, else GET /api/data/dashboard-metrics.
 * Single module used by DashboardOverview and DashboardMetricsCards.
 */
import { invoke, isTauri } from "@/lib/tauri";
import type { DashboardMetrics } from "@/types/dashboard";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (isTauri) {
    return invoke<DashboardMetrics>("get_dashboard_metrics", {});
  }
  const res = await fetch("/api/data/dashboard-metrics");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

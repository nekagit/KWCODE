"use client";

/**
 * Dashboard overview: re-export of SimpleDashboard.
 * Legacy name kept for any external references; the previous overview + copy/export
 * implementation was removed in favor of a simple dashboard (KPI cards, quick actions, project list).
 */
export { SimpleDashboard as DashboardOverview } from "./SimpleDashboard";
export type { SimpleDashboardProps as DashboardOverviewProps } from "./SimpleDashboard";

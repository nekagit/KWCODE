"use client";

import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/lib/api-dashboard-metrics";
import type { DashboardMetrics } from "@/types/dashboard";
import {
  Ticket,
  MessageSquare,
  Palette,
  FolderOpen,
  Folder,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const metricConfig: Array<{
  key: keyof DashboardMetrics;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}> = [
    { key: "tickets_count", label: "Tickets", icon: Ticket, iconClassName: "text-primary" },
    { key: "prompts_count", label: "Prompts", icon: MessageSquare, iconClassName: "text-amber-600 dark:text-amber-400" },
    { key: "designs_count", label: "Designs", icon: Palette, iconClassName: "text-violet-600 dark:text-violet-400" },
    { key: "active_projects_count", label: "Active projects", icon: FolderOpen, iconClassName: "text-blue-600 dark:text-blue-400" },
    { key: "all_projects_count", label: "All projects", icon: Folder, iconClassName: "text-muted-foreground" },
  ];

export function DashboardMetricsCards({ className }: { className?: string }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDashboardMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
          className
        )}
      >
        {metricConfig.map(({ key }) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <Skeleton className="mb-2 h-5 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive",
          className
        )}
      >
        Failed to load metrics: {error}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        className
      )}
    >
      {metricConfig.map(({ key, label, icon: Icon, iconClassName }) => (
        <div
          key={key}
          className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className={cn("h-4 w-4 shrink-0", iconClassName)} />
            <span className="text-xs font-medium uppercase tracking-wide">
              {label}
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {metrics[key]}
          </p>
        </div>
      ))}
    </div>
  );
}

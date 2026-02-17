"use client";

import { StatCard } from "@/components/shared/StatCard";

export interface StatItem {
  title: string;
  value: string | number;
  description?: string;
}

export interface DashboardStatsProps {
  stats: StatItem[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
        />
      ))}
    </div>
  );
}

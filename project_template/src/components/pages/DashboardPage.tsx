"use client";

import { DashboardStats } from "@/components/organisms/DashboardStats";
import { RecentProjects } from "@/components/organisms/RecentProjects";

const defaultStats = [
  { title: "Total users", value: "2,350", description: "+20% from last month" },
  { title: "Revenue", value: "$12,234", description: "+12% from last month" },
  { title: "Active now", value: "573", description: "Across all products" },
];

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your application and key metrics.
        </p>
      </div>
      <DashboardStats stats={defaultStats} />
      <div>
        <h2 className="text-xl font-semibold mb-4">Data from API</h2>
        <RecentProjects />
      </div>
    </div>
  );
}

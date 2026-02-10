"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { CoverageMetricCard } from "@/components/molecules/CardsAndDisplay/CoverageMetricCard/CoverageMetricCard";

export function CoverageDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Test coverage dashboard
        </CardTitle>
        <CardDescription>
          Placeholder metrics. Wire to your coverage tool (e.g. Vitest, Jest, Istanbul) for real data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CoverageMetricCard title="Lines" value="—" progress={0} target="80%" />
          <CoverageMetricCard title="Branches" value="—" progress={0} target="75%" />
          <CoverageMetricCard title="Functions" value="—" progress={0} target="80%" />
          <CoverageMetricCard title="Statements" value="—" progress={0} target="80%" />
        </div>
        <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Connect your coverage</p>
          <p className="mt-1">
            To show real numbers here, add an API or script that reads your coverage output (e.g.{" "}
            <code className="rounded bg-muted px-1">coverage/coverage-summary.json</code>) and expose
            lines/branches/functions/statements. Then replace the placeholder cards with fetched values and
            pass them to the Progress components.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

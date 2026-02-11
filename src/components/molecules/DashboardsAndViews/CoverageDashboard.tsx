"use client";

import { Card } from "@/components/shared/Card";
import { BarChart3 } from "lucide-react";
import { CoverageMetricCard } from "@/components/molecules/CardsAndDisplay/CoverageMetricCard.tsx";
import { GridContainer } from "@/components/shared/GridContainer";
import { CodeBlock } from "@/components/atoms/CodeBlock";

export function CoverageDashboard() {
  return (
    <Card
      title={
        <>
          <BarChart3 className="h-5 w-5" />
          Test coverage dashboard
        </>
      }
      subtitle="Placeholder metrics. Wire to your coverage tool (e.g. Vitest, Jest, Istanbul) for real data."
    >
      <GridContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CoverageMetricCard title="Lines" value="—" progress={0} target="80%" />
        <CoverageMetricCard title="Branches" value="—" progress={0} target="75%" />
        <CoverageMetricCard title="Functions" value="—" progress={0} target="80%" />
        <CoverageMetricCard title="Statements" value="—" progress={0} target="80%" />
      </GridContainer>
      <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground mt-6">
        <p className="font-medium text-foreground">Connect your coverage</p>
        <p className="mt-1">
          To show real numbers here, add an API or script that reads your coverage output (e.g.{" "}
          <CodeBlock>coverage/coverage-summary.json</CodeBlock>) and expose
          lines/branches/functions/statements. Then replace the placeholder cards with fetched values and
          pass them to the Progress components.
        </p>
      </div>
    </Card>
  );
}

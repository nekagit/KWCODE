"use client";

/** Coverage Dashboard component. */
import { Card } from "@/components/shared/Card";
import { BarChart3 } from "lucide-react";
import { CoverageMetricCard } from "@/components/molecules/CardsAndDisplay/CoverageMetricCard";
import { GridContainer } from "@/components/shared/GridContainer";
import { CodeBlock } from "@/components/atoms/displays/CodeBlock";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("DashboardsAndViews/CoverageDashboard.tsx");

export function CoverageDashboard() {
  return (
    <Card
      title={
        <>
          <BarChart3 className={classes[0]} />
          Test coverage dashboard
        </>
      }
      subtitle="Placeholder metrics. Wire to your coverage tool (e.g. Vitest, Jest, Istanbul) for real data."
    >
      <GridContainer className={classes[1]}>
        <CoverageMetricCard title="Lines" value="—" progress={0} target="80%" />
        <CoverageMetricCard title="Branches" value="—" progress={0} target="75%" />
        <CoverageMetricCard title="Functions" value="—" progress={0} target="80%" />
        <CoverageMetricCard title="Statements" value="—" progress={0} target="80%" />
      </GridContainer>
      <div className={classes[2]}>
        <p className={classes[3]}>Connect your coverage</p>
        <p className={classes[4]}>
          To show real numbers here, add an API or script that reads your coverage output (e.g.{" "}
          <CodeBlock>coverage/coverage-summary.json</CodeBlock>) and expose
          lines/branches/functions/statements. Then replace the placeholder cards with fetched values and
          pass them to the Progress components.
        </p>
      </div>
    </Card>
  );
}

"use client";

import { Card } from "@/components/shared/Card";
import { TestingPhaseListItem } from "@/components/atoms/list-items/TestingPhaseListItem";
import { TEST_PHASES } from "@/data/test-best-practices";

export function TestingPhasesCard() {
  return (
    <Card
      title="Testing phases"
      subtitle="Recommended order: static first, then unit, integration, E2E. Automation runs these in CI."
    >
      <ul className="space-y-4">
        {TEST_PHASES.map((phase, i) => (
          <TestingPhaseListItem key={phase.id} phase={phase} index={i} />
        ))}
      </ul>
    </Card>
  );
}

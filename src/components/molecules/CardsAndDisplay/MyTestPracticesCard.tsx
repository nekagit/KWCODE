"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/shared/Card";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/MyTestPracticesCard.tsx");

interface MyTestPracticesCardProps {
  myPractices: string;
  saveMyPractices: (value: string) => void;
}

export function MyTestPracticesCard({ myPractices, saveMyPractices }: MyTestPracticesCardProps) {
  return (
    <Card
      title="My test practices"
      subtitle="Your own notes and rules for tests. Saved in browser storage."
    >
      <Textarea
        placeholder="e.g. Always use data-testid for E2E; our unit tests use Vitest and @testing-library/react..."
        value={myPractices}
        onChange={(e) => saveMyPractices(e.target.value)}
        className={classes[0]}
      />
    </Card>
  );
}

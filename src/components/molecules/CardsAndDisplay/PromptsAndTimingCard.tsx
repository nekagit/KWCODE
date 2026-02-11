import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";

interface PromptRecordsAndTimingCardProps {
  children: ReactNode;
}

export function PromptRecordsAndTimingCard({ children }: PromptRecordsAndTimingCardProps) {
  return (
    <Card
      title="PromptRecords & timing"
      subtitle="Select which prompt IDs to run. Timing (delays, etc.) is configured on the Configuration page."
    >
      {children}
    </Card>
  );
}

import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";

interface PromptsAndTimingCardProps {
  children: ReactNode;
}

export function PromptsAndTimingCard({ children }: PromptsAndTimingCardProps) {
  return (
    <Card
      title="Prompts & timing"
      subtitle="Select which prompt IDs to run. Timing (delays, etc.) is configured on the Configuration page."
    >
      {children}
    </Card>
  );
}

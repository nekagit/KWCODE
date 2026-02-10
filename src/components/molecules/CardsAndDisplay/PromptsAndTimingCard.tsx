import { ReactNode } from "react";
import { ShadcnCardContent, ShadcnCardDescription, ShadcnCardHeader, ShadcnCardTitle } from "@/components/shadcn/card";
import { GlassCard } from "@/components/atoms/GlassCard";

interface PromptsAndTimingCardProps {
  children: ReactNode;
}

export function PromptsAndTimingCard({ children }: PromptsAndTimingCardProps) {
  return (
    <GlassCard>
      <ShadcnCardHeader>
        <ShadcnCardTitle className="text-lg">Prompts &amp; timing</ShadcnCardTitle>
        <ShadcnCardDescription className="text-base">
          Select which prompt IDs to run. Timing (delays, etc.) is configured on the Configuration page.
        </ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        {children}
      </ShadcnCardContent>
    </GlassCard>
  );
}

import { ReactNode } from "react";
import { ShadcnCardContent, ShadcnCardDescription, ShadcnCardHeader, ShadcnCardTitle } from "@/components/shadcn/card";
import { GlassCard } from "@/components/atoms/GlassCard";
import { Zap } from "lucide-react";

interface QuickActionCardProps {
  children: ReactNode;
}

export function QuickActionCard({ children }: QuickActionCardProps) {
  return (
    <GlassCard>
      <ShadcnCardHeader className="pb-3">
        <ShadcnCardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick actions
        </ShadcnCardTitle>
        <ShadcnCardDescription className="text-base">Shortcuts to common tasks</ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        {children}
      </ShadcnCardContent>
    </GlassCard>
  );
}

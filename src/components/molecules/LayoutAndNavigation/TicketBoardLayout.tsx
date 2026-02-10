import { ReactNode } from "react";
import { ShadcnCardContent, ShadcnCardDescription, ShadcnCardHeader, ShadcnCardTitle } from "@/components/shadcn/card";
import { GlassCard } from "@/components/atoms/GlassCard";
import { Ticket as TicketIcon } from "lucide-react";

interface TicketBoardLayoutProps {
  children: ReactNode;
}

export function TicketBoardLayout({ children }: TicketBoardLayoutProps) {
  return (
    <GlassCard>
      <ShadcnCardHeader>
        <ShadcnCardTitle className="text-lg flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          Ticket board
        </ShadcnCardTitle>
        <ShadcnCardDescription className="text-base">Drag cards between columns to change status</ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {children}
        </div>
      </ShadcnCardContent>
    </GlassCard>
  );
}

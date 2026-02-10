import { ReactNode } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { GlassCard } from "@/components/atoms/GlassCard";
import { Ticket as TicketIcon } from "lucide-react";
import type { Ticket } from "@/app/page";

interface TicketManagementCardProps {
  tickets: Ticket[];
  children: ReactNode;
}

export function TicketManagementCard({ tickets, children }: TicketManagementCardProps) {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          Tickets
        </CardTitle>
        <CardDescription className="text-base">
          Define work items: title, description, status. Combine them with prompts and projects in the Feature tab.
          {tickets.length > 0 && (
            <span className="block mt-1 font-semibold text-foreground">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </GlassCard>
  );
}

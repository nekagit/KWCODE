import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { Ticket as TicketIcon } from "lucide-react";

interface TicketBoardLayoutProps {
  children: ReactNode;
}

export function TicketBoardLayout({ children }: TicketBoardLayoutProps) {
  return (
    <Card
      title={
        <>
          <TicketIcon className="h-5 w-5" />
          Ticket board
        </>
      }
      subtitle="Drag cards between columns to change status"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </Card>
  );
}

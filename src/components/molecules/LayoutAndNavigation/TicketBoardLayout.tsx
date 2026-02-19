/** Ticket Board Layout component. */
import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { Ticket as TicketIcon } from "lucide-react";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/TicketBoardLayout.tsx");

interface TicketBoardLayoutProps {
  children: ReactNode;
}

export function TicketBoardLayout({ children }: TicketBoardLayoutProps) {
  return (
    <Card
      title={<TitleWithIcon icon={TicketIcon} title="Ticket board" className={classes[0]} iconClassName="text-warning/90" />}
      subtitle="Drag cards between columns to change status"
    >
      <div className={classes[1]}>
        {children}
      </div>
    </Card>
  );
}

import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { Ticket as TicketIcon } from "lucide-react";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/TicketBoardLayout.tsx");
fetch('http://127.0.0.1:7242/ingest/3a8fa5bb-85c1-4305-bdaa-558e16902420',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/components/molecules/LayoutAndNavigation/TicketBoardLayout.tsx:4',message:'TitleWithIcon imported in TicketBoardLayout',data:{typeofTitleWithIcon:typeof TitleWithIcon},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});

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

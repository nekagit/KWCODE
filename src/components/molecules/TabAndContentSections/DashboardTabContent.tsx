import { QuickActions } from "@/components/organisms/QuickActions";
import { TicketBoard } from "@/components/organisms/TicketBoard";
import { DashboardMetricsCards } from "@/components/molecules/CardsAndDisplay/DashboardMetricsCards";
import type { TicketRow } from "@/types/ticket";
import { useRouter } from "next/navigation";
import { getClasses } from "@/components/molecules/tailwind-molecules";

const classes = getClasses("TabAndContentSections/DashboardTabContent.tsx");

interface DashboardTabContentProps {
  navigateToTab: (tab: string) => void;
  tickets: TicketRow[];
  updateTicket: (id: string, updates: Partial<TicketRow>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  router: ReturnType<typeof useRouter>;
}

export function DashboardTabContent({
  navigateToTab,
  tickets,
  updateTicket,
  deleteTicket,
  router,
}: DashboardTabContentProps) {
  return (
    <div className={classes[0]}>
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Metrics</h2>
        <DashboardMetricsCards />
      </section>
      <section className="mb-6">
        <QuickActions
          navigateToTab={navigateToTab}
          router={router}
        />
      </section>
      <section>
        <TicketBoard
          tickets={tickets}
          updateTicket={updateTicket}
          deleteTicket={deleteTicket}
        />
      </section>
    </div>
  );
}

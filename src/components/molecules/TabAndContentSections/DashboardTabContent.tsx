import { QuickActions } from "@/components/organisms/QuickActions";
import { TicketBoard } from "@/components/organisms/TicketBoard";
import { DashboardMetricsCards } from "@/components/molecules/CardsAndDisplay/DashboardMetricsCards";
import type { TicketRow } from "@/types/ticket";
import type { RunInfo } from "@/types/run";
import { useRouter } from "next/navigation";
import { getClasses } from "@/components/molecules/tailwind-molecules";

const classes = getClasses("TabAndContentSections/DashboardTabContent.tsx");

interface DashboardTabContentProps {
  runningRuns: RunInfo[];
  navigateToTab: (tab: string) => void;
  setSelectedRunId: (id: string | null) => void;
  tickets: TicketRow[];
  updateTicket: (id: string, updates: Partial<TicketRow>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  router: ReturnType<typeof useRouter>;
}

export function DashboardTabContent({
  runningRuns,
  navigateToTab,
  setSelectedRunId,
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
          runningRuns={runningRuns}
          navigateToTab={navigateToTab}
          setSelectedRunId={setSelectedRunId}
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

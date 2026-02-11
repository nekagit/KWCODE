import { QuickActions } from "@/components/organisms/QuickActions";
import { TicketBoard } from "@/components/organisms/TicketBoard";
import type { Feature } from "@/types/project";
import type { Ticket } from "@/types/ticket";
import type { RunInfo } from "@/types/run";
import { useRouter } from "next/navigation";

interface DashboardTabContentProps {
  features: Feature[];
  runningRuns: RunInfo[];
  navigateToTab: (tab: string) => void;
  runForFeature: (feature: Feature) => Promise<void>;
  setSelectedRunId: (id: string | null) => void;
  tickets: Ticket[];
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  router: ReturnType<typeof useRouter>;
}

export function DashboardTabContent({
  features,
  runningRuns,
  navigateToTab,
  runForFeature,
  setSelectedRunId,
  tickets,
  updateTicket,
  deleteTicket,
  router,
}: DashboardTabContentProps) {
  return (
    <div className="mt-0 space-y-6">
      <QuickActions
        features={features}
        runningRuns={runningRuns}
        navigateToTab={navigateToTab}
        runForFeature={runForFeature}
        setSelectedRunId={setSelectedRunId}
        router={router}
      />

      <TicketBoard tickets={tickets} updateTicket={updateTicket} deleteTicket={deleteTicket} />
    </div>
  );
}

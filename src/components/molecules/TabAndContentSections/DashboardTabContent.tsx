import { QuickActions } from "@/components/organisms/QuickActions";
import { TicketBoard } from "@/components/organisms/TicketBoard";
import type { Feature } from "@/types/project";
import type { TicketRow } from "@/types/ticket";
import type { RunInfo } from "@/types/run";
import { useRouter } from "next/navigation";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/DashboardTabContent.tsx");

interface DashboardTabContentProps {
  features: Feature[];
  runningRuns: RunInfo[];
  navigateToTab: (tab: string) => void;
  runForFeature: (feature: Feature) => Promise<void>;
  setSelectedRunId: (id: string | null) => void;
  tickets: TicketRow[];
  updateTicket: (id: string, updates: Partial<TicketRow>) => Promise<void>;
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
    <div className={classes[0]}>

      <TicketBoard tickets={tickets} updateTicket={updateTicket} deleteTicket={deleteTicket} />
    </div>
  );
}

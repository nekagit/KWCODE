/** Quick Actions component. */
import { useRouter } from "next/navigation";
import { QuickActionCard } from "@/components/molecules/CardsAndDisplay/QuickActionCard";
import { QuickActionButtons } from "@/components/molecules/ControlsAndButtons/QuickActionButtons";

interface QuickActionsProps {
  navigateToTab: (tab: "projects" | "dashboard" | "prompts" | "all" | "data") => void;
  router: ReturnType<typeof useRouter>;
}

export function QuickActions({
  navigateToTab,
  router,
}: QuickActionsProps) {
  return (
    <QuickActionCard>
      <QuickActionButtons navigateToTab={navigateToTab} />
    </QuickActionCard>
  );
}
